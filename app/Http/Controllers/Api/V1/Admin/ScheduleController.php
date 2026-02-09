<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\GroupScheduleItem;
use Illuminate\Http\Request;

class ScheduleController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => GroupScheduleItem::query()->with('group:id,name')->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'groupId' => ['required', 'integer', 'exists:groups,id'],
            'dayOfWeek' => ['required', 'string', 'max:80'],
            'date' => ['nullable', 'date'],
            'startTime' => ['required', 'date_format:H:i'],
            'endTime' => ['nullable', 'date_format:H:i'],
            'instructor' => ['required', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $item = GroupScheduleItem::query()->create([
            'group_id' => $payload['groupId'],
            'day_of_week' => $payload['dayOfWeek'],
            'date' => $payload['date'] ?? null,
            'start_time' => $payload['startTime'].':00',
            'end_time' => isset($payload['endTime']) ? $payload['endTime'].':00' : null,
            'instructor' => $payload['instructor'],
            'sort_order' => $payload['sortOrder'] ?? 0,
            'is_active' => $payload['isActive'] ?? true,
        ]);

        return response()->json(['ok' => true, 'item' => $item->load('group:id,name')], 201);
    }

    public function update(Request $request, GroupScheduleItem $item)
    {
        $payload = $request->validate([
            'groupId' => ['sometimes', 'integer', 'exists:groups,id'],
            'dayOfWeek' => ['sometimes', 'string', 'max:80'],
            'date' => ['nullable', 'date'],
            'startTime' => ['sometimes', 'date_format:H:i'],
            'endTime' => ['nullable', 'date_format:H:i'],
            'instructor' => ['sometimes', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $item->update([
            'group_id' => $payload['groupId'] ?? $item->group_id,
            'day_of_week' => $payload['dayOfWeek'] ?? $item->day_of_week,
            'date' => array_key_exists('date', $payload) ? $payload['date'] : $item->date,
            'start_time' => isset($payload['startTime']) ? $payload['startTime'].':00' : $item->start_time,
            'end_time' => array_key_exists('endTime', $payload)
                ? ($payload['endTime'] ? $payload['endTime'].':00' : null)
                : $item->end_time,
            'instructor' => $payload['instructor'] ?? $item->instructor,
            'sort_order' => array_key_exists('sortOrder', $payload) ? $payload['sortOrder'] : $item->sort_order,
            'is_active' => array_key_exists('isActive', $payload) ? $payload['isActive'] : $item->is_active,
        ]);

        return response()->json(['ok' => true, 'item' => $item->fresh()->load('group:id,name')]);
    }

    public function destroy(GroupScheduleItem $item)
    {
        $item->delete();

        return response()->json(['ok' => true]);
    }
}
