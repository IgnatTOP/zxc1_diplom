<?php

namespace Database\Seeders;

use App\Models\BlogPost;
use App\Models\Collage;
use App\Models\Content;
use App\Models\Gallery;
use App\Models\Group;
use App\Models\Section;
use App\Models\SectionNews;
use App\Models\Setting;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;

class RichContentSeeder extends Seeder
{
    /**
     * @var array<int, string>
     */
    private array $fallbackMedia = [
        'https://images.unsplash.com/photo-1524594154908-edd518f8a3e1?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1504609813442-a8924e83f76e?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1526413232644-8a40f03cc03b?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?q=80&w=1600&auto=format&fit=crop',
        'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop',
    ];

    public function run(): void
    {
        $media = $this->prepareMedia();
        if ($media === []) {
            $media = $this->fallbackMedia;
        }

        $this->seedSections();
        $this->seedTeam($media);
        $this->seedGallery($media);
        $this->seedCollages($media);
        $this->seedBlog($media);
        $this->seedSectionNews($media);
        $this->seedContent();
        $this->seedSettings();
        $this->syncGroupCounters();
    }

    private function seedSections(): void
    {
        $map = [
            'hip-hop' => [
                'name' => 'Hip-Hop',
                'description' => 'Уличная хореография, groove и уверенная подача на сцене.',
                'seo_title' => 'Hip-Hop занятия — DanceWave',
                'seo_description' => 'Группы Hip-Hop для начинающих и продвинутых. Расписание, новости и запись онлайн.',
            ],
            'contemporary' => [
                'name' => 'Contemporary',
                'description' => 'Современная пластика, техника корпуса и эмоциональная подача.',
                'seo_title' => 'Contemporary — DanceWave',
                'seo_description' => 'Contemporary-классы с акцентом на технику и сценическую практику.',
            ],
            'latin' => [
                'name' => 'Latin',
                'description' => 'Ритмичные латинские стили, работа в паре и сольная техника.',
                'seo_title' => 'Latin — DanceWave',
                'seo_description' => 'Занятия по Latin для разных уровней подготовки в удобное время.',
            ],
            'kids' => [
                'name' => 'Kids',
                'description' => 'Детские группы с безопасной нагрузкой и игровым форматом обучения.',
                'seo_title' => 'Kids Dance — DanceWave',
                'seo_description' => 'Детские танцевальные секции: расписание, группы по возрасту и онлайн-запись.',
            ],
        ];

        foreach ($map as $slug => $item) {
            Section::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $item['name'],
                    'description' => $item['description'],
                    'seo_title' => $item['seo_title'],
                    'seo_description' => $item['seo_description'],
                    'is_active' => true,
                ],
            );
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedTeam(array $media): void
    {
        $items = [
            ['name' => 'Денис Флоу', 'experience' => 'Hip-Hop, freestyle, 9 лет преподавания'],
            ['name' => 'Анна Лайт', 'experience' => 'Contemporary, сценическая подготовка, 8 лет опыта'],
            ['name' => 'Мария Соль', 'experience' => 'Latin & Kids, постановки номеров, 10 лет опыта'],
            ['name' => 'Ирина Ритм', 'experience' => 'Stretching и техника корпуса, 7 лет опыта'],
            ['name' => 'Артем Бит', 'experience' => 'House/Choreo, работа с музыкальностью, 6 лет опыта'],
            ['name' => 'Ксения Вэйв', 'experience' => 'Детские группы и адаптация новичков, 5 лет опыта'],
        ];

        foreach ($items as $index => $item) {
            TeamMember::query()->updateOrCreate(
                ['name' => $item['name']],
                [
                    'experience' => $item['experience'],
                    'photo' => $this->mediaAt($media, $index + 1),
                    'sort_order' => $index,
                    'is_active' => true,
                ],
            );
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedGallery(array $media): void
    {
        $galleryImages = array_slice($media, 0, min(24, count($media)));

        foreach ($galleryImages as $index => $image) {
            Gallery::query()->updateOrCreate(
                ['filename' => $image],
                [
                    'title' => 'Тренировочный процесс #'.($index + 1),
                    'description' => 'Фрагмент тренировки и постановочной практики в студии DanceWave.',
                    'alt_text' => 'DanceWave gallery image '.($index + 1),
                    'sort_order' => $index,
                    'is_active' => true,
                ],
            );
        }

        if ($galleryImages !== []) {
            Gallery::query()
                ->whereNotIn('filename', $galleryImages)
                ->update(['is_active' => false]);
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedCollages(array $media): void
    {
        $chunks = array_chunk(array_slice($media, 0, 20), 5);
        foreach (array_slice($chunks, 0, 3) as $index => $chunk) {
            $main = $chunk[0] ?? $this->mediaAt($media, $index);
            if (! $main) {
                continue;
            }

            $photos = array_values(array_slice($chunk, 1, 4));

            Collage::query()->updateOrCreate(
                ['title' => 'Сезонный коллаж #'.($index + 1)],
                [
                    'main_image' => $main,
                    'photos' => $photos,
                    'photo_count' => max(4, count($photos)),
                ],
            );
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedBlog(array $media): void
    {
        $posts = [
            [
                'title' => 'Как выбрать группу по уровню и не перегореть',
                'excerpt' => 'Практический чеклист для старта: нагрузка, график и цели на первый месяц.',
                'content' => '<p>Перед началом занятий определите цель: сценическая практика, физическая форма или освоение конкретного стиля.</p><p>На старте важно выбрать группу с подходящим темпом. Если после двух-трех тренировок чувствуете перегруз, лучше перейти в соседний поток.</p><p>Оптимальная частота для новичка: 2–3 занятия в неделю с обязательным восстановлением.</p>',
            ],
            [
                'title' => 'Подготовка к выступлению: план на 4 недели',
                'excerpt' => 'Структура подготовки номера без хаоса: от техники до уверенности на сцене.',
                'content' => '<p>Первые две недели уделяем технике и синхрону в группе. Третья неделя — прогоны с акцентом на музыкальность.</p><p>За неделю до выступления фиксируем костюм, точки входа и выходы со сцены, чтобы убрать лишний стресс.</p><p>В день выступления важны короткая разминка, вода и спокойный разбор тайминга.</p>',
            ],
            [
                'title' => 'Танцы и восстановление: что делать после интенсивной тренировки',
                'excerpt' => 'Простая система восстановления, которая помогает стабильно прогрессировать.',
                'content' => '<p>После нагрузочной тренировки организму нужно восстановление: сон, вода и мягкая мобильность.</p><p>Добавьте 10 минут заминки, легкое растяжение и прогулку. Это снижает крепатуру и улучшает качество следующего занятия.</p><p>Если есть дискомфорт в коленях или пояснице, обратитесь к тренеру за коррекцией техники.</p>',
            ],
            [
                'title' => 'Как родителям выбрать секцию для ребенка',
                'excerpt' => 'На что смотреть в первую очередь: педагог, объем нагрузки и безопасность.',
                'content' => '<p>Детям важна понятная структура урока: разминка, базовая техника, игровая часть и короткая связка.</p><p>Нагрузка должна быть возрастной, а тренер — регулярно давать обратную связь родителям о прогрессе.</p><p>Пробное занятие помогает понять, подходит ли группа ребенку по темпу и атмосфере.</p>',
            ],
            [
                'title' => 'Музыкальность в танце: 5 упражнений на каждый день',
                'excerpt' => 'Набор коротких упражнений, которые развивают ритм и чувство акцентов.',
                'content' => '<p>Работайте с простым битом: выделяйте сильную долю и добавляйте акценты корпусом.</p><p>Тренируйтесь менять динамику: один и тот же фрагмент в медленном и быстром темпе.</p><p>Ежедневные 15 минут ритмики дают заметный эффект уже через 2–3 недели.</p>',
            ],
            [
                'title' => 'Личный кабинет DanceWave: что в нем полезного',
                'excerpt' => 'Расписание, ближайшие платежи, история операций и чат поддержки в одном месте.',
                'content' => '<p>В кабинете вы видите свои группы, персональное расписание и ближайшие даты платежей по каждой секции.</p><p>История оплат помогает контролировать расходы, а новости секций показывают анонсы выступлений и сборов.</p><p>Если нужен быстрый ответ, используйте чат поддержки — администратор ответит в вебе или через Telegram.</p>',
            ],
        ];

        $slugs = [];
        foreach ($posts as $index => $post) {
            $slug = Str::slug($post['title']);
            $slugs[] = $slug;
            BlogPost::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'title' => $post['title'],
                    'excerpt' => $post['excerpt'],
                    'content' => $post['content'],
                    'featured_image' => $this->mediaAt($media, 6 + $index),
                    'images' => array_values(array_filter([
                        $this->mediaAt($media, 16 + $index),
                        $this->mediaAt($media, 22 + $index),
                    ])),
                    'author' => 'Команда DanceWave',
                    'published_date' => now()->subDays($index * 3 + 1),
                    'is_published' => true,
                    'sort_order' => $index,
                ],
            );
        }

        if ($slugs !== []) {
            BlogPost::query()
                ->whereNotIn('slug', $slugs)
                ->update(['is_published' => false]);
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedSectionNews(array $media): void
    {
        $adminId = User::query()->where('role', 'admin')->value('id');

        $sections = Section::query()->orderBy('sort_order')->get();
        $slugs = [];
        foreach ($sections as $index => $section) {
            $slug = $section->slug.'-welcome-news';
            $slugs[] = $slug;
            SectionNews::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'section_id' => $section->id,
                    'author_id' => $adminId,
                    'title' => 'Обновленное расписание секции '.$section->name,
                    'summary' => 'Добавили новые слоты и открыли дополнительный набор в действующие группы.',
                    'content' => 'В секции '.$section->name.' обновлено расписание, доступны новые временные слоты и пробные занятия. Актуальные даты уже видны в личном кабинете.',
                    'cover_image' => $this->mediaAt($media, 30 + $index),
                    'is_published' => true,
                    'published_at' => now()->subDays($index + 1),
                ],
            );
        }

        if ($slugs !== []) {
            SectionNews::query()
                ->whereNotIn('slug', $slugs)
                ->update(['is_published' => false]);
        }
    }

    private function seedContent(): void
    {
        $blocks = [
            [
                'page' => 'about',
                'section' => 'main',
                'key_name' => 'main_text',
                'value' => 'DanceWave — это студия, где обучение строится вокруг прогресса ученика: понятная система уровней, регулярная обратная связь и комфортный темп тренировок.',
            ],
            [
                'page' => 'about',
                'section' => 'main',
                'key_name' => 'mission_title',
                'value' => 'Наша миссия',
            ],
            [
                'page' => 'about',
                'section' => 'main',
                'key_name' => 'mission_text',
                'value' => 'Сделать качественное танцевальное образование доступным, понятным и удобным для детей, подростков и взрослых.',
            ],
            [
                'page' => 'blog',
                'section' => 'main',
                'key_name' => 'page_title',
                'value' => 'Блог DanceWave',
            ],
            [
                'page' => 'blog',
                'section' => 'main',
                'key_name' => 'page_subtitle',
                'value' => 'Полезные материалы о тренировках, восстановлении и подготовке к выступлениям.',
            ],
        ];

        foreach ($blocks as $block) {
            Content::query()->updateOrCreate(
                [
                    'page' => $block['page'],
                    'section' => $block['section'],
                    'key_name' => $block['key_name'],
                ],
                [
                    'value' => $block['value'],
                    'type' => 'text',
                ],
            );
        }
    }

    private function seedSettings(): void
    {
        $settings = [
            ['key_name' => 'gallery_layout', 'value' => 'grid', 'type' => 'text'],
            ['key_name' => 'site_phone', 'value' => '+7 (999) 123-45-67', 'type' => 'text'],
            ['key_name' => 'site_email', 'value' => 'hello@dancewave.ru', 'type' => 'text'],
            ['key_name' => 'site_address', 'value' => 'Москва, ул. Танцевальная, 12', 'type' => 'text'],
        ];

        foreach ($settings as $setting) {
            Setting::query()->updateOrCreate(
                ['key_name' => $setting['key_name']],
                [
                    'value' => $setting['value'],
                    'type' => $setting['type'],
                    'updated_at' => now(),
                ],
            );
        }
    }

    private function syncGroupCounters(): void
    {
        Group::query()->withCount([
            'enrollments as active_enrollments_count' => fn ($query) => $query->where('status', 'active'),
        ])->get()->each(function (Group $group): void {
            $active = (int) ($group->active_enrollments_count ?? 0);
            $group->update([
                'current_students' => max($active, (int) $group->current_students),
            ]);
        });
    }

    /**
     * @return array<int, string>
     */
    private function prepareMedia(): array
    {
        $source = null;
        foreach ([
            base_path('zxc1/diplo/assets/images'),
            base_path('zxc1/zxc1/diplo/assets/images'),
        ] as $candidate) {
            if (is_dir($candidate)) {
                $source = $candidate;
                break;
            }
        }

        $target = storage_path('app/public/media/legacy');
        File::ensureDirectoryExists($target);

        if ($source !== null) {
            foreach (File::files($source) as $file) {
                if (! $file->isFile()) {
                    continue;
                }

                $ext = strtolower($file->getExtension());
                if (! in_array($ext, ['webp', 'jpg', 'jpeg', 'png'], true)) {
                    continue;
                }

                $to = $target.DIRECTORY_SEPARATOR.$file->getFilename();
                if (! File::exists($to)) {
                    File::copy($file->getPathname(), $to);
                }
            }
        }

        $files = collect(File::files($target))
            ->filter(function ($file): bool {
                $ext = strtolower($file->getExtension());
                return in_array($ext, ['webp', 'jpg', 'jpeg'], true);
            })
            ->sortBy(fn ($file): string => $file->getFilename())
            ->values();

        return $files
            ->map(fn ($file): string => 'media/legacy/'.$file->getFilename())
            ->all();
    }

    /**
     * @param array<int, string> $media
     */
    private function mediaAt(array $media, int $index): ?string
    {
        if ($media === []) {
            return null;
        }

        return $media[$index % count($media)];
    }
}
