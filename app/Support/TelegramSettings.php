<?php

namespace App\Support;

use App\Models\Setting;

class TelegramSettings
{
    /**
     * @return array{
     *     bot_token: string,
     *     bot_token_source: 'db'|'env'|'none'
     * }
     */
    public static function resolve(): array
    {
        $keys = ['telegram_bot_token'];
        $values = Setting::query()
            ->whereIn('key_name', $keys)
            ->pluck('value', 'key_name');

        $dbToken = trim((string) ($values['telegram_bot_token'] ?? ''));
        $envToken = trim((string) config('services.telegram.bot_token', ''));

        $token = $dbToken !== '' ? $dbToken : $envToken;
        $tokenSource = $dbToken !== '' ? 'db' : ($envToken !== '' ? 'env' : 'none');

        return [
            'bot_token' => $token,
            'bot_token_source' => $tokenSource,
        ];
    }

    public static function botToken(): string
    {
        return self::resolve()['bot_token'];
    }
}
