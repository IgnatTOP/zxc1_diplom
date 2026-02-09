<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UsersController extends Controller
{
    public function update(Request $request, User $user)
    {
        $payload = $request->validate([
            'name' => ['nullable', 'string', 'max:255'],
            'email' => ['sometimes', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'role' => ['sometimes', 'string', 'max:50'],
        ]);

        /** @var User $actor */
        $actor = $request->user();
        if (
            $actor->id === $user->id
            && array_key_exists('role', $payload)
            && $payload['role'] !== 'admin'
        ) {
            return response()->json([
                'ok' => false,
                'message' => 'Нельзя снять роль администратора у текущего пользователя.',
            ], 422);
        }

        $user->update([
            'name' => array_key_exists('name', $payload) ? $payload['name'] : $user->name,
            'email' => $payload['email'] ?? $user->email,
            'role' => $payload['role'] ?? $user->role,
        ]);

        return response()->json([
            'ok' => true,
            'item' => User::query()->find($user->id, ['id', 'name', 'email', 'role', 'created_at']),
        ]);
    }
}
