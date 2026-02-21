<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Collage;
use App\Models\Gallery;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class GalleryController extends Controller
{
    public function storeItem(Request $request)
    {
        $payload = $request->validate([
            'filename' => ['required', 'image', 'max:10240'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'altText' => ['nullable', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $filenamePath = $request->file('filename')->store('uploads', 'public');

        $item = Gallery::query()->create([
            'filename' => $filenamePath,
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
            'filename' => ['nullable', 'image', 'max:10240'],
            'title' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'altText' => ['nullable', 'string', 'max:255'],
            'sortOrder' => ['nullable', 'integer'],
            'isActive' => ['nullable', 'boolean'],
        ]);

        $filenamePath = $item->filename;
        if ($request->hasFile('filename')) {
            if ($filenamePath) {
                Storage::disk('public')->delete($filenamePath);
            }
            $filenamePath = $request->file('filename')->store('uploads', 'public');
        }

        $item->update([
            'filename' => array_key_exists('filename', $payload) ? $filenamePath : $item->filename,
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
        if ($item->filename) {
            Storage::disk('public')->delete($item->filename);
        }
        $item->delete();

        return response()->json(['ok' => true]);
    }

    public function storeCollage(Request $request)
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'mainImage' => ['required', 'image', 'max:10240'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['image', 'max:10240'],
            'photoCount' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $mainImagePath = $request->file('mainImage')->store('uploads', 'public');
        
        $photosPaths = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photoFile) {
                $photosPaths[] = $photoFile->store('uploads', 'public');
            }
        }

        $item = Collage::query()->create([
            'title' => $payload['title'],
            'main_image' => $mainImagePath,
            'photos' => !empty($photosPaths) ? $photosPaths : null,
            'photo_count' => $payload['photoCount'] ?? (!empty($photosPaths) ? count($photosPaths) : 4),
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function updateCollage(Request $request, Collage $collage)
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'mainImage' => ['nullable', 'image', 'max:10240'],
            'photos' => ['nullable', 'array'],
            'photos.*' => ['nullable'], // can be string or file
            'photoCount' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $mainImagePath = $collage->main_image;
        if ($request->hasFile('mainImage')) {
            if ($mainImagePath) {
                Storage::disk('public')->delete($mainImagePath);
            }
            $mainImagePath = $request->file('mainImage')->store('uploads', 'public');
        }

        $nextPhotos = $collage->photos ?? [];
        if ($request->has('photos')) {
            $nextPhotos = [];
            foreach ($request->all('photos')['photos'] as $idx => $photoItem) {
                if (is_file($photoItem)) {
                    $nextPhotos[] = $photoItem->store('uploads', 'public');
                } elseif (is_string($photoItem)) {
                    $nextPhotos[] = $photoItem;
                }
            }
        }

        $nextPhotoCount = array_key_exists('photoCount', $payload)
            ? $payload['photoCount']
            : ($nextPhotos ? count($nextPhotos) : $collage->photo_count);

        $collage->update([
            'title' => $payload['title'] ?? $collage->title,
            'main_image' => array_key_exists('mainImage', $payload) ? $mainImagePath : $collage->main_image,
            'photos' => $nextPhotos,
            'photo_count' => $nextPhotoCount ?? 4,
        ]);

        return response()->json(['ok' => true, 'item' => $collage->fresh()]);
    }

    public function destroyCollage(Collage $collage)
    {
        if ($collage->main_image) {
            Storage::disk('public')->delete($collage->main_image);
        }
        if ($collage->photos) {
            foreach ($collage->photos as $photo) {
                if ($photo) {
                    Storage::disk('public')->delete($photo);
                }
            }
        }

        $collage->delete();

        return response()->json(['ok' => true]);
    }
}
