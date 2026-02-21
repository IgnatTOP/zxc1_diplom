<?php

namespace App\Console\Commands;

use App\Models\AdminTelegramLink;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Services\Support\TelegramBotService;
use App\Support\TelegramSettings;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class TelegramPollCommand extends Command
{
    protected $signature = 'telegram:poll';

    protected $description = 'Listen to Telegram updates via long polling';

    private const REPLY_CONTEXT_TTL_SECONDS = 7200;

    public function handle(TelegramBotService $telegramBotService)
    {
        $this->info('Starting Telegram polling...');

        while (true) {
            $botToken = TelegramSettings::botToken();

            if ($botToken === '') {
                $this->error('Bot token is not configured. Retrying in 10 seconds...');
                sleep(10);
                continue;
            }

            $offset = Cache::get('telegram_last_update_id', 0) + 1;

            try {
                $response = Http::timeout(40)->get("https://api.telegram.org/bot{$botToken}/getUpdates", [
                    'offset' => $offset,
                    'timeout' => 30,
                    'allowed_updates' => json_encode(['message', 'edited_message', 'callback_query']),
                ]);

                if ($response->ok() && isset($response['result']) && is_array($response['result'])) {
                    foreach ($response['result'] as $update) {
                        $this->processUpdate($update, $telegramBotService);
                        
                        $updateId = (int) $update['update_id'];
                        Cache::put('telegram_last_update_id', $updateId);
                    }
                }
            } catch (\Exception $e) {
                Log::error('Telegram polling error: ' . $e->getMessage());
                // Sleep brief interval on error
                sleep(2);
            }
        }
    }

    private function processUpdate(array $update, TelegramBotService $telegramBotService)
    {
        if (isset($update['callback_query']) && is_array($update['callback_query'])) {
            $this->processCallbackQuery($update['callback_query'], $telegramBotService);
            return;
        }

        $updateId = isset($update['update_id']) ? (int) $update['update_id'] : null;
        $message = $update['message'] ?? $update['edited_message'] ?? null;

        if (! is_array($message)) {
            return;
        }

        if ($updateId !== null && SupportMessage::query()->where('telegram_update_id', $updateId)->exists()) {
            return;
        }

        $from = $message['from'] ?? [];
        $chat = $message['chat'] ?? [];
        $text = trim((string) ($message['text'] ?? ''));
        $telegramUserId = (int) ($from['id'] ?? 0);
        $chatId = (int) ($chat['id'] ?? 0);

        if ($telegramUserId <= 0 || $chatId <= 0) {
            return;
        }

        $adminLink = AdminTelegramLink::query()
            ->where('telegram_user_id', $telegramUserId)
            ->where('is_active', true)
            ->with('user')
            ->first();

        if (! $adminLink || $adminLink->user?->role !== 'admin') {
            $telegramBotService->sendMessage(
                $chatId,
                'Доступ запрещен. Ваш Telegram не привязан к активному администратору.'
            );
            return;
        }

        if ($text === '/start') {
            $this->sendHelp($telegramBotService, $chatId);
            return;
        }

        if ($text === '/help') {
            $this->sendHelp($telegramBotService, $chatId);
            return;
        }

        if ($text === '/cancel') {
            Cache::forget($this->replyContextCacheKey($telegramUserId));
            $telegramBotService->sendMessage($chatId, 'Режим быстрого ответа отключен.');
            return;
        }

        if ($text === '/dialogs') {
            $this->sendRecentDialogs($telegramBotService, $chatId);
            return;
        }

        if (preg_match('/^\/close\s+(\d+)$/', $text, $matches) === 1) {
            $this->setConversationStatus($telegramBotService, $chatId, (int) $matches[1], 'closed');
            return;
        }

        if (preg_match('/^\/open\s+(\d+)$/', $text, $matches) === 1) {
            $this->setConversationStatus($telegramBotService, $chatId, (int) $matches[1], 'open');
            return;
        }

        [$conversationId, $body] = $this->extractReply($message, $text);

        if (($conversationId === null || $body === null) && $text !== '' && ! str_starts_with($text, '/')) {
            $contextConversationId = Cache::get($this->replyContextCacheKey($telegramUserId));
            if (is_numeric($contextConversationId)) {
                $conversationId = (int) $contextConversationId;
                $body = $text;
            }
        }

        if ($conversationId === null || $body === null) {
            $telegramBotService->sendMessage(
                $chatId,
                "Не удалось определить диалог.\nНажмите кнопку \"Ответить\" под уведомлением, используйте /dialogs или команду: /reply 123 Текст"
            );
            return;
        }

        $conversation = SupportConversation::query()->find($conversationId);
        if (! $conversation) {
            $telegramBotService->sendMessage($chatId, 'Диалог не найден.');
            return;
        }

        Cache::put(
            $this->replyContextCacheKey($telegramUserId),
            $conversation->id,
            self::REPLY_CONTEXT_TTL_SECONDS,
        );

        $supportMessage = SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'admin',
            'sender_user_id' => $adminLink->user_id,
            'source' => 'telegram',
            'body' => $body,
            'telegram_update_id' => $updateId,
            'sent_at' => now(),
            'is_read_by_user' => false,
            'is_read_by_admin' => true,
        ]);

        $conversation->update([
            'status' => 'open',
            'assigned_admin_id' => $conversation->assigned_admin_id ?: $adminLink->user_id,
            'last_message_at' => now(),
        ]);

        event(new \App\Events\SupportMessageCreated($conversation->fresh(), $supportMessage->fresh()));

        try {
            $telegramBotService->notifyAdminsAboutSupportMessage(
                $conversation->fresh(),
                $supportMessage->fresh(),
                excludeTelegramUserIds: [$telegramUserId],
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        $telegramBotService->sendMessage(
            $chatId,
            sprintf("Ответ отправлен в диалог #%d.\nСледующее сообщение тоже пойдет в этот диалог. /cancel — отключить режим.", $conversation->id)
        );
    }

    private function processCallbackQuery(array $callbackQuery, TelegramBotService $telegramBotService): void
    {
        $callbackId = (string) ($callbackQuery['id'] ?? '');
        $telegramUserId = (int) ($callbackQuery['from']['id'] ?? 0);
        $chatId = (int) ($callbackQuery['message']['chat']['id'] ?? 0);
        $data = trim((string) ($callbackQuery['data'] ?? ''));

        if ($callbackId === '' || $telegramUserId <= 0 || $chatId <= 0 || $data === '') {
            return;
        }

        $adminLink = AdminTelegramLink::query()
            ->where('telegram_user_id', $telegramUserId)
            ->where('is_active', true)
            ->with('user')
            ->first();

        if (! $adminLink || $adminLink->user?->role !== 'admin') {
            $telegramBotService->answerCallbackQuery($callbackId, 'Доступ запрещен', true);
            return;
        }

        if (preg_match('/^reply:(\d+)$/', $data, $matches) === 1) {
            $conversationId = (int) $matches[1];
            $conversation = SupportConversation::query()->find($conversationId);
            if (! $conversation) {
                $telegramBotService->answerCallbackQuery($callbackId, 'Диалог не найден', true);
                return;
            }

            Cache::put($this->replyContextCacheKey($telegramUserId), $conversationId, self::REPLY_CONTEXT_TTL_SECONDS);
            $telegramBotService->answerCallbackQuery($callbackId, "Диалог #{$conversationId} выбран");
            $telegramBotService->sendMessage(
                $chatId,
                "Режим ответа активирован для диалога #{$conversationId}.\nПросто отправьте текст следующим сообщением.\n/cancel — отключить режим.",
            );

            return;
        }

        if (preg_match('/^(close|open):(\d+)$/', $data, $matches) === 1) {
            $status = $matches[1] === 'close' ? 'closed' : 'open';
            $conversationId = (int) $matches[2];
            $conversation = SupportConversation::query()->find($conversationId);
            if (! $conversation) {
                $telegramBotService->answerCallbackQuery($callbackId, 'Диалог не найден', true);
                return;
            }

            $conversation->update([
                'status' => $status,
                'assigned_admin_id' => $conversation->assigned_admin_id ?: $adminLink->user_id,
            ]);

            $telegramBotService->answerCallbackQuery(
                $callbackId,
                $status === 'closed' ? 'Диалог закрыт' : 'Диалог открыт',
            );
            $telegramBotService->sendMessage(
                $chatId,
                sprintf('Статус диалога #%d: %s.', $conversationId, $status === 'closed' ? 'закрыт' : 'открыт'),
            );

            return;
        }

        $telegramBotService->answerCallbackQuery($callbackId, 'Неизвестное действие', true);
    }

    /**
     * @return array{0: int|null, 1: string|null}
     */
    private function extractReply(array $message, string $text): array
    {
        $replyTo = $message['reply_to_message']['text'] ?? null;
        if (is_string($replyTo)) {
            if (preg_match('/\[#(\d+)\]/', $replyTo, $matches) === 1) {
                $body = trim($text);
                if ($body !== '') {
                    return [(int) $matches[1], $body];
                }
            }
        }

        if (preg_match('/^\/reply\s+(\d+)\s+(.+)$/su', $text, $matches) === 1) {
            return [(int) $matches[1], trim($matches[2])];
        }

        if (preg_match('/^#(\d+)\s+(.+)$/su', $text, $matches) === 1) {
            return [(int) $matches[1], trim($matches[2])];
        }

        if (preg_match('/^\[(?:#)?(\d+)\]\s+(.+)$/su', $text, $matches) === 1) {
            return [(int) $matches[1], trim($matches[2])];
        }

        return [null, null];
    }

    private function sendHelp(TelegramBotService $telegramBotService, int $chatId): void
    {
        $telegramBotService->sendMessage(
            $chatId,
            implode("\n", [
                'Бот поддержки DanceWave.',
                '',
                'Быстрый сценарий:',
                '1) Нажмите кнопку "Ответить" под уведомлением.',
                '2) Отправьте текст одним сообщением.',
                '',
                'Команды:',
                '/dialogs — последние диалоги с кнопками ответа',
                '/reply <id> <текст> — ответ в конкретный диалог',
                '/close <id> — закрыть диалог',
                '/open <id> — открыть диалог',
                '/cancel — выключить быстрый режим ответа',
            ]),
        );
    }

    private function sendRecentDialogs(TelegramBotService $telegramBotService, int $chatId): void
    {
        $dialogs = SupportConversation::query()
            ->with('user:id,name,email')
            ->orderByDesc('last_message_at')
            ->orderByDesc('id')
            ->limit(8)
            ->get();

        if ($dialogs->isEmpty()) {
            $telegramBotService->sendMessage($chatId, 'Диалоги пока отсутствуют.');
            return;
        }

        $lines = ['Последние диалоги:'];
        $buttons = [];

        foreach ($dialogs as $dialog) {
            $label = $dialog->user?->name ?: ($dialog->user?->email ?: 'Гость');
            $lines[] = sprintf(
                '#%d · %s · %s',
                $dialog->id,
                $dialog->status,
                $label,
            );
            $buttons[] = [[
                'text' => sprintf('✍️ Ответить в #%d', $dialog->id),
                'callback_data' => 'reply:'.$dialog->id,
            ]];
        }

        $telegramBotService->sendMessage(
            $chatId,
            implode("\n", $lines),
            ['inline_keyboard' => $buttons],
        );
    }

    private function setConversationStatus(
        TelegramBotService $telegramBotService,
        int $chatId,
        int $conversationId,
        string $status,
    ): void {
        $conversation = SupportConversation::query()->find($conversationId);
        if (! $conversation) {
            $telegramBotService->sendMessage($chatId, 'Диалог не найден.');
            return;
        }

        $conversation->update(['status' => $status]);
        $telegramBotService->sendMessage(
            $chatId,
            sprintf('Диалог #%d теперь %s.', $conversationId, $status === 'closed' ? 'закрыт' : 'открыт'),
        );
    }

    private function replyContextCacheKey(int $telegramUserId): string
    {
        return 'telegram_reply_context_'.$telegramUserId;
    }
}
