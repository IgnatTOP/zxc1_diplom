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
        ]);

        $botToken = trim((string) ($payload['botToken'] ?? ''));

        $this->saveSetting('telegram_bot_token', $botToken !== '' ? $botToken : null, 'secret');

        return response()->json([
            'ok' => true,
            'settings' => $this->serializeSettings(),
        ]);
    }

    /**
     * @return array{
     *     botToken: string,
     *     botTokenSource: 'db'|'env'|'none'
     * }
     */
    private function serializeSettings(): array
    {
        $resolved = TelegramSettings::resolve();

        return [
            'botToken' => $resolved['bot_token'],
            'botTokenSource' => $resolved['bot_token_source'],
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
