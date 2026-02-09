<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Group;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentsCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_checkout_creates_payment_and_updates_due_date(): void
    {
        $user = User::factory()->create();
        $section = Section::query()->create([
            'slug' => 'test-section',
            'name' => 'Test',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $group = Group::query()->create([
            'section_id' => $section->id,
            'name' => 'Test Group',
            'style' => 'Hip-Hop',
            'level' => 'Beginner',
            'max_students' => 20,
            'current_students' => 1,
            'billing_amount_cents' => 520000,
            'billing_period_days' => 30,
            'currency' => 'RUB',
            'is_active' => true,
        ]);

        $enrollment = Enrollment::query()->create([
            'user_id' => $user->id,
            'section_id' => $section->id,
            'group_id' => $group->id,
            'status' => 'active',
            'started_at' => now(),
            'next_payment_due_at' => now()->subDay(),
            'billing_amount_cents' => 520000,
            'billing_period_days' => 30,
            'currency' => 'RUB',
        ]);

        $response = $this
            ->actingAs($user)
            ->postJson('/api/v1/payments/checkout', [
                'enrollmentId' => $enrollment->id,
                'cardNumber' => '4111 1111 1111 1111',
                'cardHolder' => 'TEST USER',
                'expMonth' => 12,
                'expYear' => now()->addYear()->year,
                'cvv' => '123',
            ]);

        $response
            ->assertOk()
            ->assertJson([
                'ok' => true,
            ]);

        $this->assertDatabaseCount('payments', 1);
        $this->assertDatabaseCount('payment_methods', 1);

        $this->assertDatabaseHas('payments', [
            'enrollment_id' => $enrollment->id,
            'user_id' => $user->id,
            'status' => 'success',
            'gateway' => 'mock',
        ]);

        $enrollment->refresh();
        $this->assertNotNull($enrollment->next_payment_due_at);
        $this->assertTrue($enrollment->next_payment_due_at->greaterThan(now()->addDays(29)));
    }
}
