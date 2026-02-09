<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Events\SupportMessageCreated;
use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Services\Support\TelegramBotService;
use Illuminate\Http\Request;

class SupportController extends Controller
{
    public function __construct(
        private readonly TelegramBotService $telegramBotService,
    ) {}

    public function store(Request $request)
    {
        $payload = $request->validate([
            'conversationId' => ['required', 'integer', 'exists:support_conversations,id'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        /** @var \App\Models\User $admin */
        $admin = $request->user();

        $conversation = SupportConversation::query()->findOrFail($payload['conversationId']);

        $message = SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => 'admin',
            'sender_user_id' => $admin->id,
            'source' => 'admin',
            'body' => trim($payload['body']),
            'sent_at' => now(),
            'is_read_by_user' => false,
            'is_read_by_admin' => true,
        ]);

        $conversation->update([
            'status' => 'open',
            'assigned_admin_id' => $conversation->assigned_admin_id ?: $admin->id,
            'last_message_at' => now(),
        ]);

        event(new SupportMessageCreated($conversation->fresh(), $message->fresh()));

        if ($conversation->guest_token !== null || $conversation->user_id !== null) {
            $this->telegramBotService->notifyAdminsAboutSupportMessage(
                $conversation->fresh(),
                $message->fresh(),
                excludeTelegramUserIds: [$admin->adminTelegramLink?->telegram_user_id],
            );
        }

        return response()->json(['ok' => true]);
    }
}
