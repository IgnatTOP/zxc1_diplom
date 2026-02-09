<?php

namespace Tests\Feature;

use App\Models\Enrollment;
use App\Models\Group;
use App\Models\GroupScheduleItem;
use App\Models\Section;
use App\Models\SectionNews;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProfileApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_profile_endpoints_return_user_specific_data(): void
    {
        $user = User::factory()->create();

        $section = Section::query()->create([
            'slug' => 'kids',
            'name' => 'Kids',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $group = Group::query()->create([
            'section_id' => $section->id,
            'name' => 'Kids A',
            'style' => 'Kids',
            'level' => 'Beginner',
            'max_students' => 20,
            'current_students' => 5,
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
            'next_payment_due_at' => now()->addDays(5),
            'billing_amount_cents' => 520000,
            'billing_period_days' => 30,
            'currency' => 'RUB',
        ]);

        GroupScheduleItem::query()->create([
            'group_id' => $group->id,
            'day_of_week' => 'Понедельник',
            'start_time' => '19:00:00',
            'instructor' => 'Trainer',
            'is_active' => true,
            'sort_order' => 0,
        ]);

        SectionNews::query()->create([
            'section_id' => $section->id,
            'title' => 'Новость',
            'slug' => 'novost-1',
            'summary' => 'summary',
            'content' => 'content',
            'is_published' => true,
            'published_at' => now(),
        ]);

        $this->actingAs($user)
            ->getJson('/api/v1/profile/enrollments')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('items.0.id', $enrollment->id);

        $this->actingAs($user)
            ->getJson('/api/v1/profile/schedule')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('items.0.groupId', $group->id);

        $this->actingAs($user)
            ->getJson('/api/v1/profile/section-news')
            ->assertOk()
            ->assertJsonPath('ok', true)
            ->assertJsonPath('items.0.sectionId', $section->id);
    }
}
