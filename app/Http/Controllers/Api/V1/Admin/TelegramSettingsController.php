<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Support\TelegramSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class TelegramSettingsController extends Controller
{
    public function show()
    {
        return response()->json([
            'ok' => true,
            'settings' => $this->serializeSettings(),
        ]);
    }

    public function update(Request $request)
    {
        $payload = $request->validate([
            'botToken' => ['nullable', 'string', 'max:255'],
            'webhookSecret' => ['nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9_-]+$/'],
        ]);

        $botToken = trim((string) ($payload['botToken'] ?? ''));
        $webhookSecret = trim((string) ($payload['webhookSecret'] ?? ''));

        $this->saveSetting('telegram_bot_token', $botToken !== '' ? $botToken : null, 'secret');
        $this->saveSetting('telegram_webhook_secret', $webhookSecret !== '' ? $webhookSecret : null, 'secret');

        return response()->json([
            'ok' => true,
            'settings' => $this->serializeSettings(),
        ]);
    }

    public function setWebhook()
    {
        $botToken = TelegramSettings::botToken();
        $webhookSecret = TelegramSettings::webhookSecret();

        if ($botToken === '' || $webhookSecret === '') {
            return response()->json([
                'ok' => false,
                'message' => 'Укажите bot token и webhook secret.',
            ], 422);
        }

        $webhookUrl = TelegramSettings::webhookUrl();
        if ($webhookUrl === '') {
            return response()->json([
                'ok' => false,
                'message' => 'Не удалось сформировать webhook URL. Проверьте APP_URL и webhook secret.',
            ], 422);
        }

        $response = Http::timeout(10)
            ->acceptJson()
            ->asForm()
            ->post("https://api.telegram.org/bot{$botToken}/setWebhook", [
                'url' => $webhookUrl,
                'allowed_updates' => json_encode(['message', 'edited_message']),
            ]);

        $json = $response->json();

        if (! $response->ok() || ! is_array($json) || ! ($json['ok'] ?? false)) {
            return response()->json([
                'ok' => false,
                'message' => 'Telegram API вернул ошибку при установке webhook.',
                'response' => is_array($json) ? $json : ['raw' => $response->body()],
            ], 422);
        }

        return response()->json([
            'ok' => true,
            'message' => 'Webhook успешно установлен.',
            'webhookUrl' => $webhookUrl,
            'response' => $json,
            'settings' => $this->serializeSettings(),
        ]);
    }

    /**
     * @return array{
     *     botToken: string,
     *     webhookSecret: string,
     *     webhookUrl: string,
     *     botTokenSource: 'db'|'env'|'none',
     *     webhookSecretSource: 'db'|'env'|'none'
     * }
     */
    private function serializeSettings(): array
    {
        $resolved = TelegramSettings::resolve();

        return [
            'botToken' => $resolved['bot_token'],
            'webhookSecret' => $resolved['webhook_secret'],
            'webhookUrl' => TelegramSettings::webhookUrl(),
            'botTokenSource' => $resolved['bot_token_source'],
            'webhookSecretSource' => $resolved['webhook_secret_source'],
        ];
    }

    private function saveSetting(string $keyName, ?string $value, string $type = 'text'): void
    {
        Setting::query()->updateOrCreate(
            ['key_name' => $keyName],
            [
                'value' => $value,
                'type' => $type,
                'updated_at' => now(),
            ],
        );
    }
}
