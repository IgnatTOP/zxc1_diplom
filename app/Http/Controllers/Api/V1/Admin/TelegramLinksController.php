<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminTelegramLink;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TelegramLinksController extends Controller
{
    public function store(Request $request)
    {
        $payload = $request->validate([
            'userId' => ['required', 'integer', 'exists:users,id', Rule::unique('admin_telegram_links', 'user_id')],
            'telegramUserId' => ['required', 'integer', 'min:1', Rule::unique('admin_telegram_links', 'telegram_user_id')],
            'telegramUsername' => ['nullable', 'string', 'max:255'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $user = User::query()->findOrFail($payload['userId']);
        if ($user->role !== 'admin') {
            return response()->json([
                'ok' => false,
                'message' => 'Привязать можно только пользователя с ролью admin.',
            ], 422);
        }

        $item = AdminTelegramLink::query()->create([
            'user_id' => $payload['userId'],
            'telegram_user_id' => $payload['telegramUserId'],
            'telegram_username' => $payload['telegramUsername'] ?? null,
            'is_active' => $payload['isActive'] ?? true,
            'linked_at' => now(),
        ]);

        return response()->json([
            'ok' => true,
            'item' => $item->load('user:id,name,email,role'),
        ], 201);
    }

    public function update(Request $request, AdminTelegramLink $link)
    {
        $payload = $request->validate([
            'userId' => ['sometimes', 'integer', 'exists:users,id', Rule::unique('admin_telegram_links', 'user_id')->ignore($link->id)],
            'telegramUserId' => ['sometimes', 'integer', 'min:1', Rule::unique('admin_telegram_links', 'telegram_user_id')->ignore($link->id)],
            'telegramUsername' => ['nullable', 'string', 'max:255'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        if (array_key_exists('userId', $payload)) {
            $user = User::query()->findOrFail($payload['userId']);
            if ($user->role !== 'admin') {
                return response()->json([
                    'ok' => false,
                    'message' => 'Привязать можно только пользователя с ролью admin.',
                ], 422);
            }
        }

        $link->update([
            'user_id' => $payload['userId'] ?? $link->user_id,
            'telegram_user_id' => $payload['telegramUserId'] ?? $link->telegram_user_id,
            'telegram_username' => array_key_exists('telegramUsername', $payload)
                ? $payload['telegramUsername']
                : $link->telegram_username,
            'is_active' => array_key_exists('isActive', $payload)
                ? $payload['isActive']
                : $link->is_active,
            'linked_at' => $link->linked_at ?: now(),
        ]);

        return response()->json([
            'ok' => true,
            'item' => $link->fresh()->load('user:id,name,email,role'),
        ]);
    }

    public function destroy(AdminTelegramLink $link)
    {
        $link->delete();

        return response()->json(['ok' => true]);
    }
}
