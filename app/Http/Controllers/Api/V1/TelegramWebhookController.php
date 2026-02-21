<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AdminTelegramLink;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Services\Support\TelegramBotService;
use App\Support\TelegramSettings;
use Illuminate\Http\Request;

class TelegramWebhookController extends Controller
{
    public function __construct(
        private readonly TelegramBotService $telegramBotService,
    ) {}

    public function handle(Request $request, string $secret)
    {
        if ($secret !== TelegramSettings::webhookSecret()) {
            abort(403);
        }

        $update = $request->all();
        $updateId = isset($update['update_id']) ? (int) $update['update_id'] : null;
        $message = $update['message'] ?? $update['edited_message'] ?? null;

        if (! is_array($message)) {
            return response()->json(['ok' => true, 'ignored' => true]);
        }

        if ($updateId !== null && SupportMessage::query()->where('telegram_update_id', $updateId)->exists()) {
            return response()->json(['ok' => true, 'duplicate' => true]);
        }

        $from = $message['from'] ?? [];
        $chat = $message['chat'] ?? [];
        $text = trim((string) ($message['text'] ?? ''));
        $telegramUserId = (int) ($from['id'] ?? 0);
        $chatId = (int) ($chat['id'] ?? 0);

        if ($telegramUserId <= 0 || $chatId <= 0) {
            return response()->json(['ok' => true, 'ignored' => true]);
        }

        $adminLink = AdminTelegramLink::query()
            ->where('telegram_user_id', $telegramUserId)
            ->where('is_active', true)
            ->with('user')
            ->first();

        if (! $adminLink || $adminLink->user?->role !== 'admin') {
            $this->telegramBotService->sendMessage(
                $chatId,
                'Доступ запрещен. Ваш Telegram не привязан к активному администратору.',
            );

            return response()->json(['ok' => true, 'unauthorized' => true]);
        }

        if ($text === '/start') {
            $this->telegramBotService->sendMessage(
                $chatId,
                "Бот поддержки DanceWave.\nОтвет: /reply <conversationId> <текст>\nИли ответьте на сообщение с маркером [#ID].",
            );

            return response()->json(['ok' => true, 'handled' => 'start']);
        }

        [$conversationId, $body] = $this->extractReply($message, $text);

        if ($conversationId === null || $body === null) {
            $this->telegramBotService->sendMessage(
                $chatId,
                "Не удалось определить диалог.\nИспользуйте: /reply 123 Текст ответа",
            );

            return response()->json(['ok' => true, 'handled' => 'invalid_format']);
        }

        $conversation = SupportConversation::query()->find($conversationId);
        if (! $conversation) {
            $this->telegramBotService->sendMessage($chatId, 'Диалог не найден.');
            return response()->json(['ok' => true, 'handled' => 'not_found']);
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

        $this->telegramBotService->sendMessage(
            $chatId,
            sprintf('Ответ отправлен в диалог #%d.', $conversation->id),
        );

        return response()->json(['ok' => true]);
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
