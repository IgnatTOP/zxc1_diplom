<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\AdminTelegramLink;
use App\Models\Application;
use App\Models\BlogPost;
use App\Models\Enrollment;
use App\Models\Gallery;
use App\Models\Group;
use App\Models\GroupScheduleItem;
use App\Models\Section;
use App\Models\SectionNews;
use App\Models\SupportConversation;
use App\Models\User;
use App\Support\TelegramSettings;
use Inertia\Inertia;
use Inertia\Response;

class AdminPageController extends Controller
{
    public function dashboard(): Response
    {
        $stats = [
            'users' => User::query()->count(),
            'applications' => Application::query()->count(),
            'groups' => Group::query()->count(),
            'activeGroups' => Group::query()->where('is_active', true)->count(),
            'scheduleItems' => GroupScheduleItem::query()->where('is_active', true)->count(),
            'blogPosts' => BlogPost::query()->count(),
            'sectionNews' => SectionNews::query()->count(),
            'galleryItems' => Gallery::query()->count(),
            'supportOpen' => SupportConversation::query()->where('status', 'open')->count(),
            'enrollments' => Enrollment::query()->count(),
            'sections' => Section::query()->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                ...$stats,
                // Frontend-compatible aliases.
                'support' => $stats['supportOpen'],
                'schedule' => $stats['scheduleItems'],
                'gallery' => $stats['galleryItems'],
                'news' => $stats['sectionNews'],
            ],
        ]);
    }

    public function applications(): Response
    {
        return Inertia::render('Admin/Applications', [
            'items' => Application::query()
                ->with('assignedGroup:id,name')
                ->latest('id')
                ->get(),
            'groups' => Group::query()->where('is_active', true)->orderBy('name')->get(['id', 'name']),
        ]);
    }

    public function groups(): Response
    {
        return Inertia::render('Admin/Groups', [
            'sections' => Section::query()->orderBy('sort_order')->get(),
            'items' => Group::query()->with('section')->orderBy('name')->get(),
        ]);
    }

    public function schedule(): Response
    {
        return Inertia::render('Admin/Schedule', [
            'groups' => Group::query()->orderBy('name')->get(['id', 'name']),
            'items' => GroupScheduleItem::query()->with('group:id,name')->orderBy('sort_order')->get(),
        ]);
    }

    public function gallery(): Response
    {
        return Inertia::render('Admin/Gallery', [
            'items' => Gallery::query()->orderBy('sort_order')->get(),
            'collages' => \App\Models\Collage::query()->latest('id')->get(),
        ]);
    }

    public function about(): Response
    {
        return Inertia::render('Admin/About', [
            'team' => \App\Models\TeamMember::query()->orderBy('sort_order')->get(),
            'content' => \App\Models\Content::query()->where('page', 'about')->get(),
        ]);
    }

    public function blog(): Response
    {
        return Inertia::render('Admin/Blog', [
            'posts' => BlogPost::query()->latest('id')->get(),
            'pageSettings' => \App\Models\Content::query()->where('page', 'blog')->get(),
        ]);
    }

    public function users(): Response
    {
        $users = User::query()
            ->with([
                'enrollments' => fn ($query) => $query->whereIn('status', ['active', 'paused'])
                    ->with([
                        'group:id,name',
                        'group.scheduleItems' => fn ($q) => $q->where('is_active', true)->orderBy('sort_order'),
                        'section:id,name'
                    ]),
            ])
            ->latest('id')
            ->get(['id', 'name', 'email', 'role', 'created_at']);

        // Fetch active groups for the dropdown
        $groups = Group::query()
            ->where('is_active', true)
            ->with('scheduleItems:id,group_id,instructor,day_of_week,start_time,end_time')
            ->orderBy('name')
            ->get(['id', 'name', 'section_id']);

        return Inertia::render('Admin/Users', [
            'users' => $users,
            // Keep backward compatibility with older frontend contracts.
            'items' => $users,
            'groups' => $groups,
        ]);
    }

    public function sections(): Response
    {
        $sections = Section::query()->orderBy('sort_order')->get();

        return Inertia::render('Admin/Sections', [
            'sections' => $sections,
            // Keep backward compatibility with older frontend contracts.
            'items' => $sections,
        ]);
    }

    public function sectionNews(): Response
    {
        return Inertia::render('Admin/SectionNews', [
            'sections' => Section::query()->orderBy('sort_order')->get(['id', 'name']),
            'items' => SectionNews::query()->with('section:id,name')->latest('id')->get(),
        ]);
    }

    public function support(): Response
    {
        $items = SupportConversation::query()
            ->with([
                'user:id,name,email',
                'assignedAdmin:id,name,email',
                'messages' => fn ($query) => $query->orderBy('id')->limit(100),
            ])
            ->latest('last_message_at')
            ->latest('id')
            ->get();

        return Inertia::render('Admin/Support', [
            'tickets' => $items,
            'items' => $items,
            'admins' => User::query()
                ->where('role', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
        ]);
    }

    public function billing(): Response
    {
        return Inertia::render('Admin/Billing', [
            'enrollments' => Enrollment::query()->with(['user:id,name,email', 'group:id,name', 'section:id,name'])->latest('id')->get(),
            'payments' => \App\Models\Payment::query()->with(['user:id,name,email', 'enrollment:id,group_id', 'enrollment.group:id,name'])->latest('id')->limit(200)->get(),
        ]);
    }

    public function telegram(): Response
    {
        $resolved = TelegramSettings::resolve();

        return Inertia::render('Admin/Telegram', [
            'settings' => [
                'botToken' => $resolved['bot_token'],
                'botTokenSource' => $resolved['bot_token_source'],
            ],
            'links' => AdminTelegramLink::query()
                ->with('user:id,name,email,role')
                ->latest('id')
                ->get(),
            'admins' => User::query()
                ->where('role', 'admin')
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'role']),
        ]);
    }
}
