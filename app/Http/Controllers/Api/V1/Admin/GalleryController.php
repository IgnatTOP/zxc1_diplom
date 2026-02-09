<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collage;
use App\Models\Gallery;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function storeItem(Request $request)
    {
        $payload = $request->validate([
            'filename' => ['required', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'altText' => ['nullable', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $item = Gallery::query()->create([
            'filename' => $payload['filename'],
            'title' => $payload['title'] ?? null,
            'description' => $payload['description'] ?? null,
            'alt_text' => $payload['altText'] ?? null,
            'sort_order' => $payload['sortOrder'] ?? 0,
            'is_active' => $payload['isActive'] ?? true,
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function updateItem(Request $request, Gallery $item)
    {
        $payload = $request->validate([
            'filename' => ['sometimes', 'string', 'max:255'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'altText' => ['nullable', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $item->update([
            'filename' => $payload['filename'] ?? $item->filename,
            'title' => array_key_exists('title', $payload) ? $payload['title'] : $item->title,
            'description' => array_key_exists('description', $payload) ? $payload['description'] : $item->description,
            'alt_text' => array_key_exists('altText', $payload) ? $payload['altText'] : $item->alt_text,
            'sort_order' => array_key_exists('sortOrder', $payload) ? $payload['sortOrder'] : $item->sort_order,
            'is_active' => array_key_exists('isActive', $payload) ? $payload['isActive'] : $item->is_active,
        ]);

        return response()->json(['ok' => true, 'item' => $item->fresh()]);
    }

    public function destroyItem(Gallery $item)
    {
        $item->delete();

        return response()->json(['ok' => true]);
    }

    public function storeCollage(Request $request)
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'mainImage' => ['required', 'string', 'max:255'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string', 'max:255'],
            'photoCount' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $item = Collage::query()->create([
            'title' => $payload['title'],
            'main_image' => $payload['mainImage'],
            'photos' => $payload['photos'] ?? null,
            'photo_count' => $payload['photoCount'] ?? ($payload['photos'] ? count($payload['photos']) : 4),
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function updateCollage(Request $request, Collage $collage)
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'mainImage' => ['sometimes', 'string', 'max:255'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['string', 'max:255'],
            'photoCount' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $nextPhotos = array_key_exists('photos', $payload) ? $payload['photos'] : $collage->photos;
        $nextPhotoCount = array_key_exists('photoCount', $payload)
            ? $payload['photoCount']
            : ($nextPhotos ? count($nextPhotos) : $collage->photo_count);

        $collage->update([
            'title' => $payload['title'] ?? $collage->title,
            'main_image' => $payload['mainImage'] ?? $collage->main_image,
            'photos' => $nextPhotos,
            'photo_count' => $nextPhotoCount ?? 4,
        ]);

        return response()->json(['ok' => true, 'item' => $collage->fresh()]);
    }

    public function destroyCollage(Collage $collage)
    {
        $collage->delete();

        return response()->json(['ok' => true]);
    }
}
