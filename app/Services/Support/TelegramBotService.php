<?php

namespace App\Services\Support;

use App\Models\AdminTelegramLink;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Support\TelegramSettings;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class TelegramBotService
{
    public function notifyAdminsAboutSupportMessage(
        SupportConversation $conversation,
        SupportMessage $message,
        array $excludeTelegramUserIds = [],
    ): void {
        $botToken = TelegramSettings::botToken();
        if ($botToken === '') {
            return;
        }

        $text = $this->formatSupportMessage($conversation, $message);

        $adminLinks = AdminTelegramLink::query()
            ->where('is_active', true)
            ->whereNotNull('telegram_user_id')
            ->whereNotIn('telegram_user_id', collect($excludeTelegramUserIds)->filter()->all())
            ->get();

        /** @var AdminTelegramLink $adminLink */
        foreach ($adminLinks as $adminLink) {
            $this->sendMessage(
                (int) $adminLink->telegram_user_id,
                $text,
                $this->conversationKeyboard($conversation),
            );
        }
    }

    public function sendMessage(int $chatId, string $text, ?array $replyMarkup = null): void
    {
        $botToken = TelegramSettings::botToken();
        if ($botToken === '') {
            return;
        }

        $payload = [
            'chat_id' => $chatId,
            'text' => $text,
            'disable_web_page_preview' => true,
        ];

        if ($replyMarkup !== null) {
            $payload['reply_markup'] = $replyMarkup;
        }

        $response = Http::timeout(7)
            ->acceptJson()
            ->asJson()
            ->post("https://api.telegram.org/bot{$botToken}/sendMessage", $payload);

        if (! $response->ok() || ($response->json('ok') !== true)) {
            Log::warning('Telegram sendMessage failed', [
                'chat_id' => $chatId,
                'status' => $response->status(),
                'body' => $response->json(),
            ]);
        }
    }

    public function answerCallbackQuery(string $callbackQueryId, string $text = '', bool $showAlert = false): void
    {
        $botToken = TelegramSettings::botToken();
        if ($botToken === '') {
            return;
        }

        Http::timeout(7)
            ->acceptJson()
            ->asJson()
            ->post("https://api.telegram.org/bot{$botToken}/answerCallbackQuery", [
                'callback_query_id' => $callbackQueryId,
                'text' => $text,
                'show_alert' => $showAlert,
            ]);
    }

    private function formatSupportMessage(SupportConversation $conversation, SupportMessage $message): string
    {
        $sender = match ($message->sender_type) {
            'admin' => 'Админ',
            'user' => 'Пользователь',
            default => 'Гость',
        };

        $preview = Str::limit(trim($message->body), 700);

        return implode("\n", [
            sprintf('[#%d] %s', $conversation->id, $sender),
            $preview,
            '',
            'Кнопка "Ответить" включает быстрый режим ответа.',
            sprintf('Или команда: /reply %d Ваш текст', $conversation->id),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationKeyboard(SupportConversation $conversation): array
    {
        $rows = [
            [
                ['text' => '✍️ Ответить', 'callback_data' => 'reply:'.$conversation->id],
                ['text' => '✅ Закрыть', 'callback_data' => 'close:'.$conversation->id],
            ],
        ];

        $appUrl = rtrim((string) config('app.url'), '/');
        if ($this->isPublicHttpUrl($appUrl)) {
            $rows[] = [[
                'text' => '🗂 Открыть диалог',
                'url' => $appUrl.'/admin/support',
            ]];
        }

        return [
            'inline_keyboard' => [
                ...$rows,
            ],
        ];
    }

    private function isPublicHttpUrl(string $url): bool
    {
        if (! str_starts_with($url, 'http://') && ! str_starts_with($url, 'https://')) {
            return false;
        }

        $host = parse_url($url, PHP_URL_HOST);
        if (! is_string($host) || $host === '') {
            return false;
        }

        if (in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            return false;
        }

        return true;
    }
}
