<?php

namespace App\Http\Controllers\Api\V1;

use App\Events\SupportMessageCreated;
use App\Http\Controllers\Controller;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Services\Support\TelegramBotService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Cookie;

class SupportController extends Controller
{
    public function __construct(
        private readonly TelegramBotService $telegramBotService,
    ) {}

    public function current(Request $request)
    {
        [$conversation, $guestToken] = $this->resolveConversation($request);

        $messages = $conversation->messages()
            ->orderBy('id')
            ->limit(100)
            ->get()
            ->map(fn (SupportMessage $message): array => $this->toMessageDto($message))
            ->values();

        $response = response()->json([
            'ok' => true,
            'conversation' => [
                'id' => $conversation->id,
                'status' => $conversation->status,
                'guestToken' => $conversation->guest_token,
                'userId' => $conversation->user_id,
            ],
            'messages' => $messages,
            'realtime' => [
                'adminChannel' => 'support.admin',
                'userChannel' => $conversation->user_id ? 'support.user.'.$conversation->user_id : null,
                'guestChannel' => $conversation->guest_token ? 'support.guest.'.$conversation->guest_token : null,
            ],
            'guestToken' => $guestToken,
        ]);

        if (! $request->user() && $guestToken !== null) {
            $response->cookie($this->guestTokenCookie($guestToken));
        }

        return $response;
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'conversationId' => ['nullable', 'integer', 'exists:support_conversations,id'],
            'body' => ['required', 'string', 'max:2000'],
        ]);

        [$conversation, $guestToken] = $this->resolveConversation($request, $payload['conversationId'] ?? null);

        $user = $request->user();

        $message = SupportMessage::query()->create([
            'conversation_id' => $conversation->id,
            'sender_type' => $user ? 'user' : 'guest',
            'sender_user_id' => $user?->id,
            'source' => 'web',
            'body' => trim($payload['body']),
            'sent_at' => now(),
            'is_read_by_user' => true,
            'is_read_by_admin' => false,
        ]);

        $conversation->update([
            'last_message_at' => now(),
            'status' => 'open',
        ]);

        event(new SupportMessageCreated($conversation->fresh(), $message->fresh()));

        try {
            $this->telegramBotService->notifyAdminsAboutSupportMessage(
                $conversation->fresh(),
                $message->fresh(),
            );
        } catch (\Throwable $exception) {
            report($exception);
        }

        $response = response()->json([
            'ok' => true,
            'message' => $this->toMessageDto($message->fresh()),
        ]);

        if (! $user && $guestToken !== null) {
            $response->cookie($this->guestTokenCookie($guestToken));
        }

        return $response;
    }

    /**
     * @return array{0: SupportConversation, 1: string|null}
     */
    private function resolveConversation(Request $request, ?int $conversationId = null): array
    {
        $user = $request->user();
        $guestToken = null;

        if ($user) {
            if ($conversationId) {
                $conversation = SupportConversation::query()
                    ->where('id', $conversationId)
                    ->where('user_id', $user->id)
                    ->firstOrFail();
            } else {
                $conversation = SupportConversation::query()
                    ->firstOrCreate(
                        ['user_id' => $user->id],
                        ['status' => 'open', 'last_message_at' => now()],
                    );
            }

            return [$conversation, null];
        }

        $guestToken = $this->resolveGuestToken($request);

        if ($conversationId) {
            $conversation = SupportConversation::query()
                ->where('id', $conversationId)
                ->where('guest_token', $guestToken)
                ->firstOrFail();
        } else {
            $conversation = SupportConversation::query()
                ->firstOrCreate(
                    ['guest_token' => $guestToken],
                    ['status' => 'open', 'last_message_at' => now()],
                );
        }

        return [$conversation, $guestToken];
    }

    private function resolveGuestToken(Request $request): string
    {
        $fromHeader = $request->header('X-Guest-Token');
        if (is_string($fromHeader) && trim($fromHeader) !== '') {
            return trim($fromHeader);
        }

        $fromBody = $request->input('guestToken');
        if (is_string($fromBody) && trim($fromBody) !== '') {
            return trim($fromBody);
        }

        $fromCookie = $request->cookie('dw_guest_token');
        if (is_string($fromCookie) && trim($fromCookie) !== '') {
            return trim($fromCookie);
        }

        return (string) Str::uuid();
    }

    private function guestTokenCookie(string $token): Cookie
    {
        return cookie(
            name: 'dw_guest_token',
            value: $token,
            minutes: 60 * 24 * 365,
            path: '/',
            domain: null,
            secure: false,
            httpOnly: false,
            raw: false,
            sameSite: 'lax',
        );
    }

    private function toMessageDto(SupportMessage $message): array
    {
        return [
            'id' => $message->id,
            'conversationId' => $message->conversation_id,
            'senderType' => $message->sender_type,
            'source' => $message->source,
            'body' => $message->body,
            'sentAt' => $message->sent_at?->toIso8601String() ?? $message->created_at?->toIso8601String(),
        ];
    }
}
