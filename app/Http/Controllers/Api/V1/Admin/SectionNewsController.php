<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\SectionNews;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionNewsController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => SectionNews::query()->with(['section:id,name', 'author:id,name'])->latest('published_at')->latest('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'sectionId' => ['required', 'integer', 'exists:sections,id'],
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'max:255', Rule::unique('section_news', 'slug')],
            'summary' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'coverImage' => ['nullable', 'string', 'max:255'],
            'isPublished' => ['nullable', 'boolean'],
            'publishedAt' => ['nullable', 'date'],
        ]);

        /** @var \App\Models\User $user */
        $user = $request->user();

        $item = SectionNews::query()->create([
            'section_id' => $payload['sectionId'],
            'author_id' => $user->id,
            'title' => $payload['title'],
            'slug' => $payload['slug'],
            'summary' => $payload['summary'] ?? null,
            'content' => $payload['content'],
            'cover_image' => $payload['coverImage'] ?? null,
            'is_published' => $payload['isPublished'] ?? false,
            'published_at' => ($payload['isPublished'] ?? false)
                ? ($payload['publishedAt'] ?? now())
                : null,
        ]);

        return response()->json(['ok' => true, 'item' => $item->load(['section:id,name', 'author:id,name'])], 201);
    }

    public function update(Request $request, SectionNews $item)
    {
        $payload = $request->validate([
            'sectionId' => ['sometimes', 'integer', 'exists:sections,id'],
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['sometimes', 'string', 'max:255', Rule::unique('section_news', 'slug')->ignore($item->id)],
            'summary' => ['nullable', 'string'],
            'content' => ['sometimes', 'string'],
            'coverImage' => ['nullable', 'string', 'max:255'],
            'isPublished' => ['nullable', 'boolean'],
            'publishedAt' => ['nullable', 'date'],
        ]);

        $nextIsPublished = array_key_exists('isPublished', $payload)
            ? (bool) $payload['isPublished']
            : $item->is_published;

        $item->update([
            'section_id' => $payload['sectionId'] ?? $item->section_id,
            'title' => $payload['title'] ?? $item->title,
            'slug' => $payload['slug'] ?? $item->slug,
            'summary' => array_key_exists('summary', $payload) ? $payload['summary'] : $item->summary,
            'content' => $payload['content'] ?? $item->content,
            'cover_image' => array_key_exists('coverImage', $payload) ? $payload['coverImage'] : $item->cover_image,
            'is_published' => $nextIsPublished,
            'published_at' => array_key_exists('publishedAt', $payload)
                ? $payload['publishedAt']
                : ($nextIsPublished ? ($item->published_at ?: now()) : null),
        ]);

        return response()->json(['ok' => true, 'item' => $item->fresh()->load(['section:id,name', 'author:id,name'])]);
    }

    public function destroy(SectionNews $item)
    {
        $item->delete();

        return response()->json(['ok' => true]);
    }
}
