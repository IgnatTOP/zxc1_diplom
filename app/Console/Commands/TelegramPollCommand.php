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
                    'allowed_updates' => json_encode(['message', 'edited_message']),
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
            $telegramBotService->sendMessage(
                $chatId,
                "Бот поддержки DanceWave.\nОтвет: /reply <conversationId> <текст>\nИли ответьте на сообщение с маркером [#ID]."
            );
            return;
        }

        [$conversationId, $body] = $this->extractReply($message, $text);

        if ($conversationId === null || $body === null) {
            $telegramBotService->sendMessage(
                $chatId,
                "Не удалось определить диалог.\nИспользуйте: /reply 123 Текст ответа"
            );
            return;
        }

        $conversation = SupportConversation::query()->find($conversationId);
        if (! $conversation) {
            $telegramBotService->sendMessage($chatId, 'Диалог не найден.');
            return;
        }

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

        $telegramBotService->sendMessage(
            $chatId,
            sprintf('Ответ отправлен в диалог #%d.', $conversation->id)
        );
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
}
