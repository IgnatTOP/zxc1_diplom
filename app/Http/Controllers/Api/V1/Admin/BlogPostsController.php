<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\BlogPost;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class BlogPostsController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => BlogPost::query()->latest('id')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $payload = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_posts', 'slug')],
            'excerpt' => ['nullable', 'string'],
            'content' => ['required', 'string'],
            'featuredImage' => ['nullable', 'image', 'max:10240'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'publishedDate' => ['nullable', 'date'],
            'isPublished' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer'],
        ]);

        $slugSource = $payload['slug'] ?? Str::slug($payload['title']);
        $slug = $this->ensureUniqueSlug($slugSource);

        $featuredImagePath = null;
        if ($request->hasFile('featuredImage')) {
            $featuredImagePath = $request->file('featuredImage')->store('uploads', 'public');
        }

        $item = BlogPost::query()->create([
            'title' => $payload['title'],
            'slug' => $slug,
            'excerpt' => $payload['excerpt'] ?? null,
            'content' => $payload['content'],
            'featured_image' => $featuredImagePath,
            'images' => $payload['images'] ?? null,
            'author' => $payload['author'] ?? null,
            'published_date' => ($payload['isPublished'] ?? false)
                ? ($payload['publishedDate'] ?? now())
                : null,
            'is_published' => $payload['isPublished'] ?? false,
            'sort_order' => $payload['sortOrder'] ?? 0,
        ]);

        return response()->json(['ok' => true, 'item' => $item], 201);
    }

    public function update(Request $request, BlogPost $post)
    {
        $payload = $request->validate([
            'title' => ['sometimes', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('blog_posts', 'slug')->ignore($post->id)],
            'excerpt' => ['nullable', 'string'],
            'content' => ['sometimes', 'string'],
            'featuredImage' => ['nullable', 'image', 'max:10240'],
            'images' => ['nullable', 'array'],
            'images.*' => ['string', 'max:255'],
            'author' => ['nullable', 'string', 'max:255'],
            'publishedDate' => ['nullable', 'date'],
            'isPublished' => ['nullable', 'boolean'],
            'sortOrder' => ['nullable', 'integer'],
        ]);

        $nextIsPublished = array_key_exists('isPublished', $payload)
            ? (bool) $payload['isPublished']
            : $post->is_published;

        $slug = array_key_exists('slug', $payload)
            ? ($payload['slug'] ?: Str::slug($payload['title'] ?? $post->title))
            : $post->slug;
        if (! $slug) {
            $slug = $this->ensureUniqueSlug(Str::slug($payload['title'] ?? $post->title), $post->id);
        } else {
            $slug = $this->ensureUniqueSlug($slug, $post->id);
        }

        $featuredImagePath = $post->featured_image;
        if ($request->hasFile('featuredImage')) {
            if ($featuredImagePath) {
                Storage::disk('public')->delete($featuredImagePath);
            }
            $featuredImagePath = $request->file('featuredImage')->store('uploads', 'public');
        }

        $post->update([
            'title' => $payload['title'] ?? $post->title,
            'slug' => $slug,
            'excerpt' => array_key_exists('excerpt', $payload) ? $payload['excerpt'] : $post->excerpt,
            'content' => $payload['content'] ?? $post->content,
            'featured_image' => array_key_exists('featuredImage', $payload) ? $featuredImagePath : $post->featured_image,
            'images' => array_key_exists('images', $payload) ? $payload['images'] : $post->images,
            'author' => array_key_exists('author', $payload) ? $payload['author'] : $post->author,
            'is_published' => $nextIsPublished,
            'published_date' => array_key_exists('publishedDate', $payload)
                ? $payload['publishedDate']
                : ($nextIsPublished ? ($post->published_date ?: now()) : null),
            'sort_order' => array_key_exists('sortOrder', $payload) ? $payload['sortOrder'] : $post->sort_order,
        ]);

        return response()->json(['ok' => true, 'item' => $post->fresh()]);
    }

    public function destroy(BlogPost $post)
    {
        if ($post->featured_image) {
            Storage::disk('public')->delete($post->featured_image);
        }
        $post->delete();

        return response()->json(['ok' => true]);
    }

    private function ensureUniqueSlug(string $source, ?int $ignoreId = null): string
    {
        $base = Str::of($source)->trim()->lower()->value();
        $base = $base !== '' ? $base : 'post';
        $slug = Str::slug($base);
        if ($slug === '') {
            $slug = 'post';
        }

        $counter = 1;
        while (
            BlogPost::query()
                ->where('slug', $slug)
                ->when($ignoreId !== null, fn ($query) => $query->where('id', '!=', $ignoreId))
                ->exists()
        ) {
            $slug = Str::slug($base).'-'.$counter;
            $counter++;
        }

        return $slug;
    }
}
