<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Content;
use App\Models\TeamMember;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class AboutController extends Controller
{
    public function storeTeamMember(Request $request)
    {
        $payload = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'experience' => ['required', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'max:10240'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $photoPath = null;
        if ($request->hasFile('photo')) {
            $photoPath = $request->file('photo')->store('uploads', 'public');
        }

        $item = TeamMember::query()->create([
            'name' => $payload['name'],
            'experience' => $payload['experience'],
            'photo' => $photoPath,
            'sort_order' => $payload['sortOrder'] ?? 0,
            'is_active' => $payload['isActive'] ?? true,
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function updateTeamMember(Request $request, TeamMember $member)
    {
        $payload = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'experience' => ['sometimes', 'string', 'max:255'],
            'photo' => ['nullable', 'image', 'max:10240'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $photoPath = $member->photo;
        if ($request->hasFile('photo')) {
            if ($photoPath) {
                Storage::disk('public')->delete($photoPath);
            }
            $photoPath = $request->file('photo')->store('uploads', 'public');
        }

        $member->update([
            'name' => $payload['name'] ?? $member->name,
            'experience' => $payload['experience'] ?? $member->experience,
            'photo' => array_key_exists('photo', $payload) ? $photoPath : $member->photo,
            'sort_order' => array_key_exists('sortOrder', $payload) ? $payload['sortOrder'] : $member->sort_order,
            'is_active' => array_key_exists('isActive', $payload) ? $payload['isActive'] : $member->is_active,
        ]);

        return response()->json(['ok' => true, 'item' => $member->fresh()]);
    }

    public function destroyTeamMember(TeamMember $member)
    {
        if ($member->photo) {
            Storage::disk('public')->delete($member->photo);
        }

        $member->delete();

        return response()->json(['ok' => true]);
    }

    public function storeContent(Request $request)
    {
        $payload = $request->validate([
            'section' => ['nullable', 'string', 'max:255'],
            'keyName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('content', 'key_name')->where(function ($query) use ($request) {
                    return $query
                        ->where('page', 'about')
                        ->where('section', $request->input('section', 'main'));
                }),
            ],
            'value' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $item = Content::query()->create([
            'page' => 'about',
            'section' => $payload['section'] ?? 'main',
            'key_name' => $payload['keyName'],
            'value' => $payload['value'] ?? null,
            'type' => $payload['type'] ?? 'text',
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function updateContent(Request $request, Content $item)
    {
        abort_if($item->page !== 'about', 404);

        $payload = $request->validate([
            'section' => ['nullable', 'string', 'max:255'],
            'keyName' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('content', 'key_name')->where(function ($query) use ($request, $item) {
                    return $query
                        ->where('page', 'about')
                        ->where('section', $request->input('section', $item->section));
                })->ignore($item->id),
            ],
            'value' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $item->update([
            'section' => array_key_exists('section', $payload) ? ($payload['section'] ?: 'main') : $item->section,
            'key_name' => $payload['keyName'] ?? $item->key_name,
            'value' => array_key_exists('value', $payload) ? $payload['value'] : $item->value,
            'type' => array_key_exists('type', $payload) ? ($payload['type'] ?: 'text') : $item->type,
        ]);

        return response()->json(['ok' => true, 'item' => $item->fresh()]);
    }

    public function destroyContent(Content $item)
    {
        abort_if($item->page !== 'about', 404);

        $item->delete();

        return response()->json(['ok' => true]);
    }
}
