<?php

namespace Tests\Feature;

use App\Models\AdminTelegramLink;
use App\Models\SupportConversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class TelegramWebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_telegram_webhook_creates_admin_message(): void
    {
        Http::fake();

        config()->set('services.telegram.webhook_secret', 'secret123');
        config()->set('services.telegram.bot_token', 'token123');

        $admin = User::factory()->create(['role' => 'admin']);

        AdminTelegramLink::query()->create([
            'user_id' => $admin->id,
            'telegram_user_id' => 777,
            'telegram_username' => 'admin_telegram',
            'is_active' => true,
            'linked_at' => now(),
        ]);

        $conversation = SupportConversation::query()->create([
            'status' => 'open',
            'guest_token' => 'guest-token',
        ]);

        $payload = [
            'update_id' => 9001,
            'message' => [
                'message_id' => 11,
                'from' => [
                    'id' => 777,
                    'username' => 'admin_telegram',
                ],
                'chat' => [
                    'id' => 777,
                    'type' => 'private',
                ],
                'text' => '/reply '.$conversation->id.' Ответ из TG',
            ],
        ];

        $this->postJson('/api/v1/telegram/webhook/secret123', $payload)
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseHas('support_messages', [
            'conversation_id' => $conversation->id,
            'sender_type' => 'admin',
            'source' => 'telegram',
            'telegram_update_id' => 9001,
        ]);
    }
}
