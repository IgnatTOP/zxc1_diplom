<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\User;
use Illuminate\Http\Request;

class SupportConversationsController extends Controller
{
    public function update(Request $request, SupportConversation $conversation)
    {
        $payload = $request->validate([
            'status' => ['nullable', 'string', 'max:40'],
            'assignedAdminId' => ['nullable', 'integer', 'exists:users,id'],
        ]);

        if (array_key_exists('assignedAdminId', $payload) && $payload['assignedAdminId']) {
            $assignee = User::query()->find($payload['assignedAdminId']);
            if (! $assignee || $assignee->role !== 'admin') {
                return response()->json([
                    'ok' => false,
                    'message' => 'Можно назначить только пользователя с ролью admin.',
                ], 422);
            }
        }

        $conversation->update([
            'status' => array_key_exists('status', $payload) ? $payload['status'] : $conversation->status,
            'assigned_admin_id' => array_key_exists('assignedAdminId', $payload) ? $payload['assignedAdminId'] : $conversation->assigned_admin_id,
        ]);

        return response()->json([
            'ok' => true,
            'item' => $conversation->fresh()->load([
                'user:id,name,email',
                'assignedAdmin:id,name,email',
                'messages' => fn ($query) => $query->orderBy('id')->limit(100),
            ]),
        ]);
    }
}
