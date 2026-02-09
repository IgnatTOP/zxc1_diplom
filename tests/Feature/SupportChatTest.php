<?php

namespace Tests\Feature;

use App\Models\SupportConversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class SupportChatTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_and_admin_can_exchange_messages_in_support_chat(): void
    {
        Http::fake();

        $user = User::factory()->create();
        $admin = User::factory()->create(['role' => 'admin']);

        $response = $this
            ->actingAs($user)
            ->postJson('/api/v1/support/messages', [
                'body' => 'Нужна помощь',
            ]);

        $response
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('message.senderType', 'user');

        $conversation = SupportConversation::query()->where('user_id', $user->id)->firstOrFail();

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/support/messages', [
                'conversationId' => $conversation->id,
                'body' => 'Помогаем',
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $this->assertDatabaseCount('support_messages', 2);
        $this->assertDatabaseHas('support_messages', [
            'conversation_id' => $conversation->id,
            'sender_type' => 'admin',
            'source' => 'admin',
        ]);
    }
}
