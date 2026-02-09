<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Content;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BlogSettingsController extends Controller
{
    public function store(Request $request)
    {
        $payload = $request->validate([
            'section' => ['nullable', 'string', 'max:255'],
            'keyName' => [
                'required',
                'string',
                'max:255',
                Rule::unique('content', 'key_name')->where(function ($query) use ($request) {
                    return $query
                        ->where('page', 'blog')
                        ->where('section', $request->input('section', 'main'));
                }),
            ],
            'value' => ['nullable', 'string'],
            'type' => ['nullable', 'string', 'max:50'],
        ]);

        $item = Content::query()->create([
            'page' => 'blog',
            'section' => $payload['section'] ?? 'main',
            'key_name' => $payload['keyName'],
            'value' => $payload['value'] ?? null,
            'type' => $payload['type'] ?? 'text',
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function update(Request $request, Content $item)
    {
        abort_if($item->page !== 'blog', 404);

        $payload = $request->validate([
            'section' => ['nullable', 'string', 'max:255'],
            'keyName' => [
                'sometimes',
                'string',
                'max:255',
                Rule::unique('content', 'key_name')->where(function ($query) use ($request, $item) {
                    return $query
                        ->where('page', 'blog')
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

    public function destroy(Content $item)
    {
        abort_if($item->page !== 'blog', 404);
        $item->delete();

        return response()->json(['ok' => true]);
    }
}
