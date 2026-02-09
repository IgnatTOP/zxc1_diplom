<?php

namespace App\Http\Controllers;

use App\Models\BlogPost;
use Illuminate\Http\Response;

class SeoController extends Controller
{
    public function sitemap(): Response
    {
        $urls = [
            ['loc' => url('/'), 'changefreq' => 'weekly', 'priority' => '1.0', 'lastmod' => now()],
            ['loc' => url('/about'), 'changefreq' => 'monthly', 'priority' => '0.8', 'lastmod' => now()],
            ['loc' => url('/directions'), 'changefreq' => 'monthly', 'priority' => '0.9', 'lastmod' => now()],
            ['loc' => url('/schedule'), 'changefreq' => 'weekly', 'priority' => '0.8', 'lastmod' => now()],
            ['loc' => url('/gallery'), 'changefreq' => 'weekly', 'priority' => '0.7', 'lastmod' => now()],
            ['loc' => url('/blog'), 'changefreq' => 'weekly', 'priority' => '0.7', 'lastmod' => now()],
            ['loc' => url('/prices'), 'changefreq' => 'monthly', 'priority' => '0.8', 'lastmod' => now()],
        ];

        $blogUrls = BlogPost::query()
            ->where('is_published', true)
            ->get(['slug', 'updated_at', 'published_date'])
            ->map(function (BlogPost $post): array {
                $slug = $post->slug ?: ('post-'.$post->id);
                return [
                    'loc' => url('/blog/'.$slug),
                    'changefreq' => 'monthly',
                    'priority' => '0.6',
                    'lastmod' => $post->updated_at ?: $post->published_date ?: now(),
                ];
            })
            ->all();

        $allUrls = [...$urls, ...$blogUrls];

        $xml = view('seo.sitemap', ['urls' => $allUrls])->render();

        return response($xml, 200, [
            'Content-Type' => 'application/xml; charset=UTF-8',
        ]);
    }

    public function robots(): Response
    {
        $content = implode("\n", [
            'User-agent: *',
            'Allow: /',
            'Disallow: /admin',
            'Disallow: /api/v1/admin',
            'Disallow: /profile',
            'Sitemap: '.url('/sitemap.xml'),
            '',
        ]);

        return response($content, 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
        ]);
    }
}
