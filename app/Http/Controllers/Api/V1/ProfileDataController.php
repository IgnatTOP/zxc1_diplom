<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\GroupScheduleItem;
use App\Models\Payment;
use App\Models\SectionNews;
use Illuminate\Http\Request;

class ProfileDataController extends Controller
{
    public function enrollments(Request $request)
    {
        $items = Enrollment::query()
            ->with(['group:id,name', 'section:id,name'])
            ->where('user_id', $request->user()->id)
            ->orderByDesc('id')
            ->get()
            ->map(function (Enrollment $enrollment): array {
                return [
                    'id' => $enrollment->id,
                    'groupId' => $enrollment->group_id,
                    'groupName' => $enrollment->group?->name ?? '',
                    'sectionId' => $enrollment->section_id,
                    'sectionName' => $enrollment->section?->name ?? '',
                    'nextPaymentDueAt' => $enrollment->next_payment_due_at?->toIso8601String(),
                    'billingAmount' => (int) $enrollment->billing_amount_cents,
                    'currency' => $enrollment->currency,
                    'status' => $enrollment->status,
                ];
            })
            ->values();

        return response()->json([
            'ok' => true,
            'items' => $items,
        ]);
    }

    public function schedule(Request $request)
    {
        $groupIds = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->pluck('group_id')
            ->all();

        $items = GroupScheduleItem::query()
            ->with('group:id,name,section_id')
            ->whereIn('group_id', $groupIds)
            ->where('is_active', true)
            ->orderBy('day_of_week')
            ->orderBy('start_time')
            ->orderBy('sort_order')
            ->get()
            ->map(function (GroupScheduleItem $item): array {
                return [
                    'id' => $item->id,
                    'groupId' => $item->group_id,
                    'groupName' => $item->group?->name ?? '',
                    'dayOfWeek' => $item->day_of_week,
                    'date' => $item->date?->toDateString(),
                    'startTime' => (string) $item->start_time,
                    'endTime' => $item->end_time ? (string) $item->end_time : null,
                    'instructor' => $item->instructor,
                ];
            })
            ->values();

        return response()->json([
            'ok' => true,
            'items' => $items,
        ]);
    }

    public function payments(Request $request)
    {
        $history = Payment::query()
            ->with(['paymentMethod:id,brand,last4'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'success')
            ->orderByDesc('paid_at')
            ->orderByDesc('id')
            ->get()
            ->map(function (Payment $payment): array {
                return [
                    'id' => $payment->id,
                    'enrollmentId' => $payment->enrollment_id,
                    'amount' => (int) $payment->amount_cents,
                    'currency' => $payment->currency,
                    'status' => 'success',
                    'paidAt' => $payment->paid_at?->toIso8601String(),
                    'cardBrand' => $payment->paymentMethod?->brand,
                    'cardLast4' => $payment->paymentMethod?->last4,
                ];
            })
            ->values();

        $upcoming = Enrollment::query()
            ->with(['group:id,name'])
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->whereNotNull('next_payment_due_at')
            ->orderBy('next_payment_due_at')
            ->get()
            ->map(function (Enrollment $enrollment): array {
                return [
                    'enrollmentId' => $enrollment->id,
                    'groupId' => $enrollment->group_id,
                    'groupName' => $enrollment->group?->name ?? '',
                    'amount' => (int) $enrollment->billing_amount_cents,
                    'currency' => $enrollment->currency,
                    'dueAt' => $enrollment->next_payment_due_at?->toIso8601String(),
                ];
            })
            ->values();

        return response()->json([
            'ok' => true,
            'history' => $history,
            'upcoming' => $upcoming,
        ]);
    }

    public function sectionNews(Request $request)
    {
        $sectionIds = Enrollment::query()
            ->where('user_id', $request->user()->id)
            ->where('status', 'active')
            ->pluck('section_id')
            ->unique()
            ->values()
            ->all();

        $items = SectionNews::query()
            ->with('section:id,name')
            ->whereIn('section_id', $sectionIds)
            ->where('is_published', true)
            ->whereNotNull('published_at')
            ->orderByDesc('published_at')
            ->orderByDesc('id')
            ->limit(50)
            ->get()
            ->map(function (SectionNews $news): array {
                return [
                    'id' => $news->id,
                    'sectionId' => $news->section_id,
                    'sectionName' => $news->section?->name ?? '',
                    'title' => $news->title,
                    'slug' => $news->slug,
                    'summary' => $news->summary,
                    'publishedAt' => $news->published_at?->toIso8601String(),
                ];
            })
            ->values();

        return response()->json([
            'ok' => true,
            'items' => $items,
        ]);
    }
}
