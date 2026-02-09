<?php

namespace Database\Seeders;

use App\Models\Section;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::query()->updateOrCreate([
            'email' => 'admin@dancewave.ru',
        ], [
            'name' => 'DanceWave Admin',
            'password' => Hash::make('password'),
            'role' => 'admin',
            'email_verified_at' => now(),
        ]);

        User::query()->updateOrCreate([
            'email' => 'test@example.com',
        ], [
            'name' => 'Test User',
            'password' => Hash::make('password'),
            'role' => 'user',
            'email_verified_at' => now(),
        ]);

        collect([
            [
                'slug' => 'hip-hop',
                'name' => 'Hip-Hop',
                'description' => 'Уличная хореография, groove и сценическая подача.',
                'seo_title' => 'Hip-Hop занятия — DanceWave',
                'seo_description' => 'Группы Hip-Hop для разных уровней с удобным расписанием.',
            ],
            [
                'slug' => 'contemporary',
                'name' => 'Contemporary',
                'description' => 'Современная пластика, техника и эмоциональная выразительность.',
                'seo_title' => 'Contemporary — DanceWave',
                'seo_description' => 'Contemporary-классы с постановками и сценической практикой.',
            ],
            [
                'slug' => 'latin',
                'name' => 'Latin',
                'description' => 'Ритм, пластика и энергия латинских направлений.',
                'seo_title' => 'Latin — DanceWave',
                'seo_description' => 'Latin-занятия для начинающих и продвинутых.',
            ],
            [
                'slug' => 'kids',
                'name' => 'Kids',
                'description' => 'Детские группы с безопасной нагрузкой и игровым форматом.',
                'seo_title' => 'Kids Dance — DanceWave',
                'seo_description' => 'Детские танцевальные секции: развитие, дисциплина и сцена.',
            ],
        ])->each(function (array $item, int $index): void {
            Section::query()->updateOrCreate(['slug' => $item['slug']], [
                'name' => $item['name'],
                'description' => $item['description'],
                'seo_title' => $item['seo_title'],
                'seo_description' => $item['seo_description'],
                'is_active' => true,
                'sort_order' => $index,
            ]);
        });

        $this->call([
            BasicDomainSeeder::class,
            RichContentSeeder::class,
        ]);
    }
}
