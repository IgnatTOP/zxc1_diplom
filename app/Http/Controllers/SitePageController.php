<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use App\Models\Collage;
use App\Models\Content;
use App\Models\Gallery;
use App\Models\Group;
use App\Models\GroupScheduleItem;
use App\Models\Section;
use App\Models\Setting;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SitePageController extends Controller
{
    public function home(): Response
    {
        return Inertia::render('Site/Home', [
            'sections' => Section::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'schedulePreview' => GroupScheduleItem::query()->where('is_active', true)->orderBy('sort_order')->limit(8)->get(),
            'team' => TeamMember::query()->where('is_active', true)->orderBy('sort_order')->limit(3)->get(),
            'collage' => Collage::query()->latest('id')->first(),
            'enrollableGroups' => $this->getEnrollableGroups(),
            'meta' => [
                'title' => 'DanceWave — Танцевальная студия',
                'description' => 'Современная танцевальная студия для детей и взрослых.',
                'canonical' => url('/'),
            ],
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Site/About', [
            'content' => $this->getPageContent('about'),
            'team' => TeamMember::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'meta' => [
                'title' => 'О нас — DanceWave',
                'description' => 'О студии DanceWave: команда, история, миссия.',
                'canonical' => url('/about'),
            ],
        ]);
    }

    public function directions(): Response
    {
        return Inertia::render('Site/Directions', [
            'sections' => Section::query()
                ->where('is_active', true)
                ->with([
                    'groups' => fn ($query) => $query
                        ->where('is_active', true)
                        ->select(['id', 'section_id', 'name', 'level']),
                ])
                ->withCount([
                    'groups as active_groups_count' => fn ($query) => $query->where('is_active', true),
                ])
                ->orderBy('sort_order')
                ->get(),
            'enrollableGroups' => $this->getEnrollableGroups(),
            'meta' => [
                'title' => 'Направления — DanceWave',
                'description' => 'Hip-Hop, Contemporary, Latin, Kids и другие направления.',
                'canonical' => url('/directions'),
            ],
        ]);
    }

    public function schedule(): Response
    {
        $slots = GroupScheduleItem::query()
            ->with(['group:id,name,section_id', 'group.section:id,name,slug'])
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get()
            ->map(static function (GroupScheduleItem $item): array {
                return [
                    'id' => $item->id,
                    'day_of_week' => $item->day_of_week,
                    'start_time' => $item->start_time,
                    'end_time' => $item->end_time,
                    'instructor' => $item->instructor,
                    'group' => $item->group ? [
                        'id' => $item->group->id,
                        'name' => $item->group->name,
                    ] : null,
                    'section' => $item->group?->section ? [
                        'name' => $item->group->section->name,
                        'slug' => $item->group->section->slug,
                    ] : null,
                ];
            })
            ->values();

        return Inertia::render('Site/Schedule', [
            'slots' => $slots,
            // Keep backward compatibility with older frontend contracts.
            'items' => $slots,
            'meta' => [
                'title' => 'Расписание — DanceWave',
                'description' => 'Актуальное расписание групп и секций.',
                'canonical' => url('/schedule'),
            ],
        ]);
    }

    public function gallery(): Response
    {
        return Inertia::render('Site/Gallery', [
            'items' => Gallery::query()->where('is_active', true)->orderBy('sort_order')->get(),
            'collages' => Collage::query()->latest('id')->get(),
            'layout' => Setting::query()->where('key_name', 'gallery_layout')->value('value') ?? 'grid',
            'meta' => [
                'title' => 'Галерея — DanceWave',
                'description' => 'Фото студии, выступлений и тренировок.',
                'canonical' => url('/gallery'),
            ],
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('Site/Blog', [
            'posts' => BlogPost::query()
                ->where('is_published', true)
                ->orderByDesc('published_date')
                ->orderByDesc('id')
                ->get(),
            'meta' => [
                'title' => 'Блог — DanceWave',
                'description' => 'Новости, анонсы и статьи студии DanceWave.',
                'canonical' => url('/blog'),
            ],
        ]);
    }

    public function blogPost(string $slug): Response
    {
        $idFromSlug = (int) preg_replace('/^.*-(\d+)$/', '$1', $slug);

        $post = BlogPost::query()
            ->where(function ($query) use ($slug, $idFromSlug): void {
                $query
                    ->where('slug', $slug)
                    ->orWhere('id', $idFromSlug);
            })
            ->where('is_published', true)
            ->firstOrFail();

        return Inertia::render('Site/BlogPost', [
            'post' => $post,
            'meta' => [
                'title' => sprintf('%s — Блог — DanceWave', $post->title),
                'description' => $post->excerpt ?: $post->title,
                'canonical' => url('/blog/'.$slug),
            ],
        ]);
    }

    public function prices(): Response
    {
        return Inertia::render('Site/Prices', [
            'sections' => Section::query()
                ->where('is_active', true)
                ->with([
                    'groups' => fn ($query) => $query
                        ->where('is_active', true)
                        ->select(['id', 'section_id', 'name', 'level', 'style', 'billing_amount_cents', 'billing_period_days', 'currency'])
                        ->orderBy('name'),
                ])
                ->orderBy('sort_order')
                ->get(),
            'enrollableGroups' => $this->getEnrollableGroups(),
            'meta' => [
                'title' => 'Цены — DanceWave',
                'description' => 'Тарифы и стоимость занятий в DanceWave.',
                'canonical' => url('/prices'),
            ],
        ]);
    }

    /**
     * @return array<string, string>
     */
    private function getPageContent(string $page): array
    {
        return Content::query()
            ->where('page', $page)
            ->get(['key_name', 'value'])
            ->pluck('value', 'key_name')
            ->toArray();
    }

    /**
     * Groups available for enrollment (active, with capacity).
     */
    private function getEnrollableGroups(): \Illuminate\Support\Collection
    {
        return Group::query()
            ->where('is_active', true)
            ->whereColumn('current_students', '<', 'max_students')
            ->with('section:id,name')
            ->orderBy('section_id')
            ->orderBy('name')
            ->get(['id', 'section_id', 'name', 'level', 'style', 'billing_amount_cents', 'currency']);
    }
}
