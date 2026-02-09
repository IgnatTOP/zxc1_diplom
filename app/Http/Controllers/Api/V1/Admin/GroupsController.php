<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Group;
use Illuminate\Http\Request;

class GroupsController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => Group::query()->with('section:id,name')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'sectionId' => ['required', 'integer', 'exists:sections,id'],
            'name' => ['required', 'string', 'max:255'],
            'style' => ['required', 'string', 'max:120'],
            'level' => ['required', 'string', 'max:120'],
            'dayOfWeek' => ['nullable', 'string', 'max:80'],
            'time' => ['nullable', 'string', 'max:20'],
            'ageMin' => ['nullable', 'integer', 'min:0', 'max:100'],
            'ageMax' => ['nullable', 'integer', 'min:0', 'max:100'],
            'maxStudents' => ['nullable', 'integer', 'min:1', 'max:999'],
            'billingAmountCents' => ['nullable', 'integer', 'min:0'],
            'billingPeriodDays' => ['nullable', 'integer', 'min:1', 'max:365'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $group = Group::query()->create([
            'section_id' => $payload['sectionId'],
            'name' => $payload['name'],
            'style' => $payload['style'],
            'level' => $payload['level'],
            'day_of_week' => $payload['dayOfWeek'] ?? null,
            'time' => $payload['time'] ?? null,
            'age_min' => $payload['ageMin'] ?? null,
            'age_max' => $payload['ageMax'] ?? null,
            'max_students' => $payload['maxStudents'] ?? 15,
            'current_students' => 0,
            'billing_amount_cents' => $payload['billingAmountCents'] ?? 520000,
            'billing_period_days' => $payload['billingPeriodDays'] ?? 30,
            'currency' => 'RUB',
            'is_active' => $payload['isActive'] ?? true,
        ]);

        return response()->json(['ok' => true, 'item' => $group->load('section:id,name')], 201);
    }

    public function update(Request $request, Group $group)
    {
        $payload = $request->validate([
            'sectionId' => ['sometimes', 'integer', 'exists:sections,id'],
            'name' => ['sometimes', 'string', 'max:255'],
            'style' => ['sometimes', 'string', 'max:120'],
            'level' => ['sometimes', 'string', 'max:120'],
            'dayOfWeek' => ['nullable', 'string', 'max:80'],
            'time' => ['nullable', 'string', 'max:20'],
            'ageMin' => ['nullable', 'integer', 'min:0', 'max:100'],
            'ageMax' => ['nullable', 'integer', 'min:0', 'max:100'],
            'maxStudents' => ['nullable', 'integer', 'min:1', 'max:999'],
            'currentStudents' => ['nullable', 'integer', 'min:0', 'max:999'],
            'billingAmountCents' => ['nullable', 'integer', 'min:0'],
            'billingPeriodDays' => ['nullable', 'integer', 'min:1', 'max:365'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $group->update([
            'section_id' => $payload['sectionId'] ?? $group->section_id,
            'name' => $payload['name'] ?? $group->name,
            'style' => $payload['style'] ?? $group->style,
            'level' => $payload['level'] ?? $group->level,
            'day_of_week' => array_key_exists('dayOfWeek', $payload) ? $payload['dayOfWeek'] : $group->day_of_week,
            'time' => array_key_exists('time', $payload) ? $payload['time'] : $group->time,
            'age_min' => array_key_exists('ageMin', $payload) ? $payload['ageMin'] : $group->age_min,
            'age_max' => array_key_exists('ageMax', $payload) ? $payload['ageMax'] : $group->age_max,
            'max_students' => array_key_exists('maxStudents', $payload) ? $payload['maxStudents'] : $group->max_students,
            'current_students' => array_key_exists('currentStudents', $payload) ? $payload['currentStudents'] : $group->current_students,
            'billing_amount_cents' => array_key_exists('billingAmountCents', $payload) ? $payload['billingAmountCents'] : $group->billing_amount_cents,
            'billing_period_days' => array_key_exists('billingPeriodDays', $payload) ? $payload['billingPeriodDays'] : $group->billing_period_days,
            'is_active' => array_key_exists('isActive', $payload) ? $payload['isActive'] : $group->is_active,
        ]);

        return response()->json(['ok' => true, 'item' => $group->fresh()->load('section:id,name')]);
    }

    public function destroy(Group $group)
    {
        $group->delete();

        return response()->json(['ok' => true]);
    }
}
