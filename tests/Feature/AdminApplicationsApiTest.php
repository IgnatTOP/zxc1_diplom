<?php

namespace Tests\Feature;

use App\Models\Application;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\Section;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminApplicationsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_auto_assign_creates_enrollment_for_matching_user(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $user = User::factory()->create(['email' => 'client@example.com']);

        $section = Section::query()->create([
            'slug' => 'hiphop',
            'name' => 'Hip-Hop',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $group = Group::query()->create([
            'section_id' => $section->id,
            'name' => 'Hip-Hop A',
            'style' => 'Hip-Hop',
            'level' => 'Beginner',
            'day_of_week' => 'Понедельник',
            'time' => '19:00',
            'max_students' => 20,
            'current_students' => 0,
            'billing_amount_cents' => 520000,
            'billing_period_days' => 30,
            'currency' => 'RUB',
            'is_active' => true,
        ]);

        $application = Application::query()->create([
            'name' => 'Client',
            'phone' => '+79990000000',
            'email' => $user->email,
            'age' => 18,
            'style' => 'Hip-Hop',
            'level' => 'Beginner',
            'status' => 'pending',
        ]);

        $this->actingAs($admin)
            ->postJson('/api/v1/admin/applications/'.$application->id.'/auto-assign', [])
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('item.status', 'assigned');

        $application->refresh();

        $this->assertSame('assigned', $application->status);
        $this->assertSame($group->id, $application->assigned_group_id);
        $this->assertDatabaseHas('enrollments', [
            'user_id' => $user->id,
            'group_id' => $group->id,
            'section_id' => $section->id,
            'status' => 'active',
            'currency' => 'RUB',
        ]);

        $enrollment = Enrollment::query()->where('user_id', $user->id)->firstOrFail();
        $this->assertNotNull($enrollment->next_payment_due_at);
    }
}
