<?php

namespace App\Services\Support;

use App\Models\AdminTelegramLink;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class TelegramBotService
{
    public function notifyAdminsAboutSupportMessage(
        SupportConversation $conversation,
        SupportMessage $message,
        array $excludeTelegramUserIds = [],
    ): void {
        $botToken = (string) config('services.telegram.bot_token');
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
            $this->sendMessage((int) $adminLink->telegram_user_id, $text);
        }
    }

    public function sendMessage(int $chatId, string $text): void
    {
        $botToken = (string) config('services.telegram.bot_token');
        if ($botToken === '') {
            return;
        }

        Http::timeout(7)
            ->acceptJson()
            ->asJson()
            ->post("https://api.telegram.org/bot{$botToken}/sendMessage", [
                'chat_id' => $chatId,
                'text' => $text,
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
            sprintf('Ответ: /reply %d Ваш текст', $conversation->id),
        ]);
    }
}
