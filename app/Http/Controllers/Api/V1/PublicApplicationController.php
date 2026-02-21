<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Group;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PublicApplicationController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $payload = $request->validate([
            'name'    => ['required', 'string', 'max:100'],
            'phone'   => ['required', 'string', 'max:30'],
            'email'   => ['nullable', 'email', 'max:150'],
            'groupId' => ['nullable', 'integer', 'exists:groups,id'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $group = null;
        if (! empty($payload['groupId'])) {
            $group = Group::query()->with('section:id,name')->find($payload['groupId']);
        }

        Application::create([
            'name'              => $payload['name'],
            'phone'             => $payload['phone'],
            'email'             => $payload['email'] ?? null,
            'status'            => 'pending',
            'style'             => $group?->style,
            'level'             => $group?->level,
            'assigned_group_id' => $group?->id,
            'assigned_group'    => $group?->name,
            'notes'             => $payload['comment'] ?? null,
        ]);

        return response()->json(['ok' => true]);
    }
}
