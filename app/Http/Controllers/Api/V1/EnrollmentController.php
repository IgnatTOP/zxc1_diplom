<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Enrollment;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EnrollmentController extends Controller
{
    public function apply(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'groupId' => ['required', 'integer', 'exists:groups,id'],
            'phone'   => ['nullable', 'string', 'max:30'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $user  = $request->user();
        $group = Group::query()->findOrFail($payload['groupId']);

        // Prevent duplicate pending/active enrollments
        $existing = Enrollment::query()
            ->where('user_id', $user->id)
            ->where('group_id', $group->id)
            ->whereIn('status', ['active', 'pending'])
            ->first();

        if ($existing) {
            return response()->json([
                'ok'      => false,
                'message' => 'Вы уже записаны в эту группу.',
            ], 422);
        }

        $enrollment = Enrollment::create([
            'user_id'              => $user->id,
            'section_id'           => $group->section_id,
            'group_id'             => $group->id,
            'status'               => 'pending',
            'started_at'           => now(),
            'billing_amount_cents' => $group->billing_amount_cents,
            'billing_period_days'  => $group->billing_period_days,
            'currency'             => $group->currency ?? 'RUB',
        ]);

        return response()->json([
            'ok'         => true,
            'enrollment' => $enrollment->load('group:id,name', 'section:id,name'),
        ]);
    }
}
