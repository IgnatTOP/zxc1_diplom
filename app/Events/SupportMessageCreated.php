<?php

namespace App\Events;

use App\Models\SupportConversation;
use App\Models\SupportMessage;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class SupportMessageCreated implements ShouldBroadcastNow
{
    use Dispatchable;
    use InteractsWithSockets;
    use SerializesModels;

    public function __construct(
        public readonly SupportConversation $conversation,
        public readonly SupportMessage $message,
    ) {}

    /**
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [
            new PrivateChannel('support.admin'),
        ];

        if ($this->conversation->user_id !== null) {
            $channels[] = new PrivateChannel('support.user.'.$this->conversation->user_id);
        }

        if ($this->conversation->guest_token !== null) {
            $channels[] = new Channel('support.guest.'.$this->conversation->guest_token);
        }

        return $channels;
    }

    public function broadcastAs(): string
    {
        return 'support.message.created';
    }

    public function broadcastWith(): array
    {
        return [
            'conversation' => [
                'id' => $this->conversation->id,
                'status' => $this->conversation->status,
                'userId' => $this->conversation->user_id,
                'guestToken' => $this->conversation->guest_token,
                'lastMessageAt' => $this->conversation->last_message_at?->toIso8601String(),
            ],
            'message' => [
                'id' => $this->message->id,
                'conversationId' => $this->message->conversation_id,
                'senderType' => $this->message->sender_type,
                'source' => $this->message->source,
                'body' => $this->message->body,
                'sentAt' => $this->message->sent_at?->toIso8601String() ?? $this->message->created_at?->toIso8601String(),
            ],
        ];
    }
}
