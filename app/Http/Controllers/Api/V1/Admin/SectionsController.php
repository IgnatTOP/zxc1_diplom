<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Section;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class SectionsController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => Section::query()->orderBy('sort_order')->orderBy('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'slug' => ['required', 'string', 'max:120', 'alpha_dash', Rule::unique('sections', 'slug')],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'seoTitle' => ['nullable', 'string', 'max:255'],
            'seoDescription' => ['nullable', 'string'],
            'isActive' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer'],
        ]);

        $section = Section::query()->create([
            'slug' => $payload['slug'],
            'name' => $payload['name'],
            'description' => $payload['description'] ?? null,
            'seo_title' => $payload['seoTitle'] ?? null,
            'seo_description' => $payload['seoDescription'] ?? null,
            'is_active' => $payload['isActive'] ?? true,
            'sort_order' => $payload['sortOrder'] ?? 0,
        ]);

        return response()->json(['ok' => true, 'item' => $section], 201);
    }

    public function update(Request $request, Section $section)
    {
        $payload = $request->validate([
            'slug' => ['sometimes', 'string', 'max:120', 'alpha_dash', Rule::unique('sections', 'slug')->ignore($section->id)],
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'seoTitle' => ['nullable', 'string', 'max:255'],
            'seoDescription' => ['nullable', 'string'],
            'isActive' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer'],
        ]);

        $section->update([
            'slug' => $payload['slug'] ?? $section->slug,
            'name' => $payload['name'] ?? $section->name,
            'description' => array_key_exists('description', $payload) ? $payload['description'] : $section->description,
            'seo_title' => array_key_exists('seoTitle', $payload) ? $payload['seoTitle'] : $section->seo_title,
            'seo_description' => array_key_exists('seoDescription', $payload) ? $payload['seoDescription'] : $section->seo_description,
            'is_active' => array_key_exists('isActive', $payload) ? $payload['isActive'] : $section->is_active,
            'sort_order' => array_key_exists('sortOrder', $payload) ? $payload['sortOrder'] : $section->sort_order,
        ]);

        return response()->json(['ok' => true, 'item' => $section->fresh()]);
    }

    public function destroy(Section $section)
    {
        $section->delete();

        return response()->json(['ok' => true]);
    }
}
