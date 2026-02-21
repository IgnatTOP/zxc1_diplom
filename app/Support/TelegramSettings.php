<?php

namespace App\Support;

use App\Models\Setting;

class TelegramSettings
{
    /**
     * @return array{
     *     bot_token: string,
     *     webhook_secret: string,
     *     bot_token_source: 'db'|'env'|'none',
     *     webhook_secret_source: 'db'|'env'|'none'
     * }
     */
    public static function resolve(): array
    {
        $keys = ['telegram_bot_token', 'telegram_webhook_secret'];
        $values = Setting::query()
            ->whereIn('key_name', $keys)
            ->pluck('value', 'key_name');

        $dbToken = trim((string) ($values['telegram_bot_token'] ?? ''));
        $dbSecret = trim((string) ($values['telegram_webhook_secret'] ?? ''));

        $envToken = trim((string) config('services.telegram.bot_token', ''));
        $envSecret = trim((string) config('services.telegram.webhook_secret', ''));

        $token = $dbToken !== '' ? $dbToken : $envToken;
        $secret = $dbSecret !== '' ? $dbSecret : $envSecret;

        $tokenSource = $dbToken !== '' ? 'db' : ($envToken !== '' ? 'env' : 'none');
        $secretSource = $dbSecret !== '' ? 'db' : ($envSecret !== '' ? 'env' : 'none');

        return [
            'bot_token' => $token,
            'webhook_secret' => $secret,
            'bot_token_source' => $tokenSource,
            'webhook_secret_source' => $secretSource,
        ];
    }

    public static function botToken(): string
    {
        return self::resolve()['bot_token'];
    }

    public static function webhookSecret(): string
    {
        return self::resolve()['webhook_secret'];
    }

    public static function webhookUrl(): string
    {
        $baseUrl = rtrim((string) config('app.url'), '/');
        $secret = self::webhookSecret();

        if ($baseUrl === '' || $secret === '') {
            return '';
        }

        return $baseUrl.'/api/v1/telegram/webhook/'.$secret;
    }
}
