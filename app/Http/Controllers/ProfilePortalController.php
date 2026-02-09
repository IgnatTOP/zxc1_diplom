<?php

namespace App\Http\Controllers;

use App\Models\Enrollment;
use App\Models\Payment;
use App\Models\SectionNews;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProfilePortalController extends Controller
{
    public function show(Request $request): Response
    {
        $user = $request->user();

        $enrollments = Enrollment::query()
            ->with(['group:id,name,section_id', 'section:id,name,slug'])
            ->where('user_id', $user->id)
            ->orderByDesc('id')
            ->get();

        $groupIds = $enrollments->pluck('group_id')->all();
        $sectionIds = $enrollments->pluck('section_id')->unique()->values()->all();

        $schedule = \App\Models\GroupScheduleItem::query()
            ->with('group:id,name')
            ->whereIn('group_id', $groupIds)
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $payments = Payment::query()
            ->with('paymentMethod:id,brand,last4')
            ->where('user_id', $user->id)
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get();

        $sectionNews = SectionNews::query()
            ->with('section:id,name,slug')
            ->whereIn('section_id', $sectionIds)
            ->where('is_published', true)
            ->orderByDesc('published_at')
            ->limit(20)
            ->get();

        return Inertia::render('Profile/Portal', [
            'enrollments' => $enrollments,
            'schedule' => $schedule,
            'payments' => $payments,
            'upcomingPayments' => $enrollments
                ->filter(fn (Enrollment $enrollment): bool => $enrollment->next_payment_due_at !== null)
                ->values(),
            'sectionNews' => $sectionNews,
            'meta' => [
                'title' => 'Личный кабинет — DanceWave',
                'description' => 'Расписание, оплаты и новости ваших секций.',
                'canonical' => url('/profile'),
            ],
        ]);
    }
}
