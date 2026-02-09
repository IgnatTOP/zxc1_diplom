<?php

namespace Tests\Feature;

use App\Models\Section;
use App\Models\SectionNews;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminSectionNewsApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_publish_draft_without_explicit_published_at(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);

        $section = Section::query()->create([
            'slug' => 'kids',
            'name' => 'Kids',
            'is_active' => true,
            'sort_order' => 1,
        ]);

        $news = SectionNews::query()->create([
            'section_id' => $section->id,
            'author_id' => $admin->id,
            'title' => 'Черновик',
            'slug' => 'chernovik',
            'summary' => 'summary',
            'content' => 'content',
            'is_published' => false,
        ]);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/section-news/'.$news->id, [
                'isPublished' => true,
            ])
            ->assertOk()
            ->assertJsonPath('ok', true);

        $news->refresh();

        $this->assertTrue($news->is_published);
        $this->assertNotNull($news->published_at);
    }
}
