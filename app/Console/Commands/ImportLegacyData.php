<?php

namespace App\Console\Commands;

use App\Models\Application;
use App\Models\Content;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\Section;
use App\Models\Setting;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Str;
use PDO;
use Throwable;

class ImportLegacyData extends Command
{
    protected $signature = 'legacy:import
        {--path= : Path to legacy sqlite database}
        {--media-path= : Path to legacy media directory}
        {--skip-media : Skip media copy}';

    protected $description = 'Import legacy DanceWave data and media from /zxc1 project.';

    private const DEFAULT_STYLES = [
        'Hip-Hop',
        'Contemporary',
        'Latin',
        'Kids',
    ];

    public function handle(): int
    {
        $legacyDbPath = $this->resolveLegacyDbPath();
        if (! is_file($legacyDbPath)) {
            $this->error("Legacy database not found: {$legacyDbPath}");
            return self::FAILURE;
        }

        $legacyMediaPath = $this->resolveLegacyMediaPath();
        $pdo = new PDO('sqlite:'.$legacyDbPath);
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

        $this->info('Starting legacy import...');

        DB::beginTransaction();

        try {
            $sectionMap = $this->importSections($pdo);
            $this->importUsers($pdo);
            $this->importGroups($pdo, $sectionMap);
            $this->importSchedule($pdo, $sectionMap);
            $this->importApplications($pdo);
            $this->importEnrollments();
            $this->importBlogPosts($pdo);
            $this->importGallery($pdo);
            $this->importCollages($pdo);
            $this->importContent($pdo);
            $this->importSettings($pdo);
            $this->importTeamMembers($pdo);

            DB::commit();
        } catch (Throwable $exception) {
            DB::rollBack();
            $this->error('Import failed: '.$exception->getMessage());
            $this->line($exception->getTraceAsString());
            return self::FAILURE;
        }

        if (! $this->option('skip-media')) {
            $this->copyMedia($legacyMediaPath);
        }

        $this->ensureStorageLink();
        $this->info('Legacy import completed.');

        return self::SUCCESS;
    }

    /**
     * @return array<string, int>
     */
    private function importSections(PDO $pdo): array
    {
        $styles = [];
        $styles = [...$styles, ...$this->pluckColumn($pdo, 'SELECT DISTINCT style FROM groups WHERE style IS NOT NULL')];
        $styles = [...$styles, ...$this->pluckColumn($pdo, 'SELECT DISTINCT style FROM schedule WHERE style IS NOT NULL')];
        $styles = [...$styles, ...$this->pluckColumn($pdo, 'SELECT DISTINCT style FROM applications WHERE style IS NOT NULL')];

        $styles = collect($styles)
            ->map(fn ($style): string => trim((string) $style))
            ->filter()
            ->values()
            ->all();

        if ($styles === []) {
            $styles = self::DEFAULT_STYLES;
        }

        $styles = array_values(array_unique(array_merge(self::DEFAULT_STYLES, $styles)));

        $map = [];
        foreach ($styles as $index => $style) {
            $slug = Str::slug($style);
            if ($slug === '') {
                $slug = 'section-'.($index + 1);
            }

            $section = Section::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $style,
                    'description' => "{$style} section",
                    'is_active' => true,
                    'sort_order' => $index,
                    'seo_title' => "{$style} — DanceWave",
                    'seo_description' => "Новости, группы и расписание секции {$style}.",
                ],
            );

            $map[mb_strtolower($style)] = $section->id;
        }

        $this->line('Sections imported: '.count($map));

        return $map;
    }

    /**
     * @param array<string, int> $sectionMap
     */
    private function importGroups(PDO $pdo, array $sectionMap): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM groups ORDER BY id');
        foreach ($rows as $row) {
            $style = trim((string) ($row['style'] ?? ''));
            $sectionId = $this->resolveSectionId($style, $sectionMap);

            DB::table('groups')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'section_id' => $sectionId,
                    'name' => (string) $row['name'],
                    'style' => $style,
                    'level' => (string) ($row['level'] ?? ''),
                    'day_of_week' => $this->nullableString($row['day_of_week'] ?? null),
                    'time' => $this->nullableString($row['time'] ?? null),
                    'age_min' => $this->nullableInt($row['age_min'] ?? null),
                    'age_max' => $this->nullableInt($row['age_max'] ?? null),
                    'max_students' => (int) ($row['max_students'] ?? 15),
                    'current_students' => (int) ($row['current_students'] ?? 0),
                    'billing_amount_cents' => 520000,
                    'billing_period_days' => 30,
                    'currency' => 'RUB',
                    'is_active' => ((int) ($row['is_active'] ?? 1)) === 1,
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Groups imported: '.count($rows));
    }

    /**
     * @param array<string, int> $sectionMap
     */
    private function importSchedule(PDO $pdo, array $sectionMap): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM schedule ORDER BY id');

        foreach ($rows as $row) {
            $style = trim((string) ($row['style'] ?? ''));
            $level = trim((string) ($row['level'] ?? ''));
            $day = trim((string) ($row['day_of_week'] ?? ''));
            $time = trim((string) ($row['time'] ?? ''));

            $group = Group::query()
                ->where('style', $style)
                ->where('level', $level)
                ->where(function ($query) use ($day, $time): void {
                    $query
                        ->where(function ($inner) use ($day): void {
                            $inner->where('day_of_week', $day)->orWhereNull('day_of_week');
                        })
                        ->where(function ($inner) use ($time): void {
                            $inner->where('time', $time)->orWhereNull('time');
                        });
                })
                ->orderBy('id')
                ->first();

            if (! $group) {
                $group = Group::query()
                    ->where('style', $style)
                    ->where('level', $level)
                    ->orderBy('id')
                    ->first();
            }

            if (! $group) {
                $sectionId = $this->resolveSectionId($style, $sectionMap);
                $fallbackName = trim($style.' '.$level);
                if ($fallbackName === '') {
                    $fallbackName = 'Legacy auto-group #'.(int) ($row['id'] ?? 0);
                }

                $group = Group::query()->firstOrCreate(
                    ['name' => $fallbackName.' (legacy)'],
                    [
                        'section_id' => $sectionId,
                        'style' => $style !== '' ? $style : 'Mixed',
                        'level' => $level !== '' ? $level : 'General',
                        'day_of_week' => $day !== '' ? $day : null,
                        'time' => $time !== '' ? $time : null,
                        'max_students' => 15,
                        'current_students' => 0,
                        'billing_amount_cents' => 520000,
                        'billing_period_days' => 30,
                        'currency' => 'RUB',
                        'is_active' => true,
                    ],
                );
            }

            DB::table('group_schedule_items')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'group_id' => $group->id,
                    'day_of_week' => $day !== '' ? $day : 'Понедельник',
                    'date' => $this->nullableDate($row['date'] ?? null),
                    'start_time' => $this->normalizeTime($time),
                    'end_time' => null,
                    'style' => $style !== '' ? $style : null,
                    'level' => $level !== '' ? $level : null,
                    'instructor' => trim((string) ($row['instructor'] ?? '')) ?: 'Тренер',
                    'is_active' => ((int) ($row['is_active'] ?? 1)) === 1,
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Schedule imported: '.count($rows));
    }

    private function importUsers(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM users ORDER BY id');
        foreach ($rows as $row) {
            $email = trim((string) ($row['email'] ?? ''));
            if ($email === '') {
                continue;
            }

            User::query()->updateOrCreate(
                ['email' => $email],
                [
                    'name' => $this->nullableString($row['name'] ?? null),
                    'password' => (string) ($row['password_hash'] ?? ''),
                    'role' => in_array($row['role'] ?? null, ['admin', 'user'], true) ? $row['role'] : 'user',
                    'created_at' => $row['created_at'] ?? now(),
                ],
            );
        }

        $this->line('Users imported: '.count($rows));
    }

    private function importApplications(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM applications ORDER BY id');
        $groupByName = Group::query()->pluck('id', 'name');

        foreach ($rows as $row) {
            $assignedGroup = $this->nullableString($row['assigned_group'] ?? null);
            $assignedGroupId = $assignedGroup ? $groupByName->get($assignedGroup) : null;

            DB::table('applications')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'name' => (string) ($row['name'] ?? ''),
                    'phone' => (string) ($row['phone'] ?? ''),
                    'email' => $this->nullableString($row['email'] ?? null),
                    'age' => $this->nullableInt($row['age'] ?? null),
                    'weight' => $this->nullableInt($row['weight'] ?? null),
                    'style' => (string) ($row['style'] ?? ''),
                    'level' => (string) ($row['level'] ?? ''),
                    'status' => (string) ($row['status'] ?? 'pending'),
                    'assigned_group_id' => $assignedGroupId,
                    'assigned_group' => $assignedGroup,
                    'assigned_day' => $this->nullableString($row['assigned_day'] ?? null),
                    'assigned_time' => $this->nullableString($row['assigned_time'] ?? null),
                    'assigned_date' => $this->nullableDate($row['assigned_date'] ?? null),
                    'notes' => $this->nullableString($row['notes'] ?? null),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Applications imported: '.count($rows));
    }

    private function importEnrollments(): void
    {
        $applications = Application::query()
            ->where('status', 'assigned')
            ->whereNotNull('assigned_group_id')
            ->whereNotNull('email')
            ->get();

        foreach ($applications as $application) {
            $user = User::query()->where('email', $application->email)->first();
            if (! $user) {
                continue;
            }

            $group = Group::query()->find($application->assigned_group_id);
            if (! $group) {
                continue;
            }

            $startedAt = $application->assigned_date?->startOfDay()
                ?? $application->created_at
                ?? now();

            Enrollment::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'group_id' => $group->id,
                    'started_at' => $startedAt->format('Y-m-d H:i:s'),
                ],
                [
                    'section_id' => $group->section_id,
                    'status' => 'active',
                    'ended_at' => null,
                    'next_payment_due_at' => $startedAt->copy()->addDays((int) $group->billing_period_days),
                    'billing_amount_cents' => (int) $group->billing_amount_cents,
                    'billing_period_days' => (int) $group->billing_period_days,
                    'currency' => $group->currency ?: 'RUB',
                ],
            );
        }

        $this->line('Enrollments synced from assigned applications: '.$applications->count());
    }

    private function importBlogPosts(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM blog_posts ORDER BY id');
        foreach ($rows as $row) {
            $title = trim((string) ($row['title'] ?? ''));
            $legacyImages = $this->decodeJsonArray($row['images'] ?? null);

            $mappedImages = collect($legacyImages)
                ->map(fn (string $file): ?string => $this->normalizeMediaPath($file))
                ->filter()
                ->values()
                ->all();

            DB::table('blog_posts')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'title' => $title !== '' ? $title : 'Без названия',
                    'slug' => $this->buildSlug($title, (int) $row['id']),
                    'excerpt' => $this->nullableString($row['excerpt'] ?? null),
                    'content' => $this->rewriteMediaUrls((string) ($row['content'] ?? '')),
                    'featured_image' => $this->normalizeMediaPath($row['featured_image'] ?? null),
                    'images' => $mappedImages !== [] ? json_encode($mappedImages, JSON_UNESCAPED_UNICODE) : null,
                    'author' => $this->nullableString($row['author'] ?? null),
                    'published_date' => $this->nullableDateTime($row['published_date'] ?? null),
                    'is_published' => ((int) ($row['is_published'] ?? 0)) === 1,
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Blog posts imported: '.count($rows));
    }

    private function importGallery(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM gallery ORDER BY id');
        foreach ($rows as $row) {
            DB::table('gallery')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'filename' => $this->normalizeMediaPath($row['filename'] ?? null) ?? '',
                    'title' => $this->nullableString($row['title'] ?? null),
                    'description' => $this->nullableString($row['description'] ?? null),
                    'alt_text' => $this->nullableString($row['alt_text'] ?? null),
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                    'is_active' => ((int) ($row['is_active'] ?? 1)) === 1,
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Gallery imported: '.count($rows));
    }

    private function importCollages(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM collages ORDER BY id');
        foreach ($rows as $row) {
            $photos = collect($this->decodeJsonArray($row['photos'] ?? null))
                ->map(fn (string $path): ?string => $this->normalizeMediaPath($path))
                ->filter()
                ->values()
                ->all();

            DB::table('collages')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'title' => (string) ($row['title'] ?? 'Коллаж'),
                    'main_image' => $this->normalizeMediaPath($row['main_image'] ?? null) ?? 'media/legacy/photo_group.jpeg',
                    'photos' => $photos !== [] ? json_encode($photos, JSON_UNESCAPED_UNICODE) : null,
                    'photo_count' => (int) ($row['photo_count'] ?? max(4, count($photos))),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Collages imported: '.count($rows));
    }

    private function importContent(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM content ORDER BY id');
        foreach ($rows as $row) {
            Content::query()->updateOrCreate(
                [
                    'page' => (string) ($row['page'] ?? ''),
                    'section' => (string) ($row['section'] ?? ''),
                    'key_name' => (string) ($row['key_name'] ?? ''),
                ],
                [
                    'value' => $this->rewriteMediaUrls($this->nullableString($row['value'] ?? null)),
                    'type' => (string) ($row['type'] ?? 'text'),
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Content blocks imported: '.count($rows));
    }

    private function importSettings(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM settings ORDER BY id');
        foreach ($rows as $row) {
            Setting::query()->updateOrCreate(
                ['key_name' => (string) ($row['key_name'] ?? '')],
                [
                    'value' => $this->nullableString($row['value'] ?? null),
                    'type' => (string) ($row['type'] ?? 'text'),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Settings imported: '.count($rows));
    }

    private function importTeamMembers(PDO $pdo): void
    {
        $rows = $this->fetchAll($pdo, 'SELECT * FROM team_members ORDER BY id');
        foreach ($rows as $row) {
            DB::table('team_members')->updateOrInsert(
                ['id' => (int) $row['id']],
                [
                    'name' => (string) ($row['name'] ?? ''),
                    'experience' => (string) ($row['experience'] ?? ''),
                    'photo' => $this->normalizeMediaPath($row['photo'] ?? null),
                    'sort_order' => (int) ($row['sort_order'] ?? 0),
                    'is_active' => ((int) ($row['is_active'] ?? 1)) === 1,
                    'created_at' => $row['created_at'] ?? now(),
                    'updated_at' => $row['updated_at'] ?? now(),
                ],
            );
        }

        $this->line('Team members imported: '.count($rows));
    }

    private function copyMedia(string $legacyMediaPath): void
    {
        if (! is_dir($legacyMediaPath)) {
            $this->warn("Legacy media directory not found: {$legacyMediaPath}");
            return;
        }

        $targetDir = storage_path('app/public/media/legacy');
        File::ensureDirectoryExists($targetDir);

        $files = File::files($legacyMediaPath);
        foreach ($files as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $name = $file->getFilename();
            File::copy($file->getPathname(), $targetDir.DIRECTORY_SEPARATOR.$name);
        }

        $this->line('Media copied: '.count($files));
    }

    private function ensureStorageLink(): void
    {
        if (! is_link(public_path('storage'))) {
            Artisan::call('storage:link');
        }
    }

    private function resolveLegacyDbPath(): string
    {
        $option = $this->option('path');
        if (is_string($option) && trim($option) !== '') {
            return $this->absolutePath(trim($option));
        }

        $env = (string) env('LEGACY_DB_PATH', 'zxc1/diplo/data/app.sqlite');
        return $this->absolutePath($env);
    }

    private function resolveLegacyMediaPath(): string
    {
        $option = $this->option('media-path');
        if (is_string($option) && trim($option) !== '') {
            return $this->absolutePath(trim($option));
        }

        $env = (string) env('LEGACY_MEDIA_PATH', 'zxc1/diplo/assets/images');
        return $this->absolutePath($env);
    }

    private function absolutePath(string $path): string
    {
        if (Str::startsWith($path, DIRECTORY_SEPARATOR)) {
            return $path;
        }

        return base_path($path);
    }

    private function buildSlug(string $title, int $id): string
    {
        $slug = Str::slug($title);
        if ($slug === '') {
            $slug = 'post-'.$id;
        }

        return $slug.'-'.$id;
    }

    private function normalizeMediaPath(mixed $value): ?string
    {
        $raw = trim((string) ($value ?? ''));
        if ($raw === '') {
            return null;
        }

        if (Str::startsWith($raw, ['http://', 'https://'])) {
            return $raw;
        }

        $file = basename($raw);
        if ($file === '') {
            return null;
        }

        return 'media/legacy/'.$file;
    }

    private function rewriteMediaUrls(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return str_replace('/diplo/assets/images/', '/storage/media/legacy/', $value);
    }

    private function resolveSectionId(string $style, array $sectionMap): int
    {
        $key = mb_strtolower(trim($style));
        if ($key !== '' && isset($sectionMap[$key])) {
            return $sectionMap[$key];
        }

        return Section::query()->orderBy('sort_order')->value('id')
            ?? Section::query()->create([
                'slug' => 'misc',
                'name' => 'Misc',
                'description' => 'Misc section',
                'is_active' => true,
                'sort_order' => 999,
            ])->id;
    }

    private function normalizeTime(?string $time): string
    {
        $value = trim((string) $time);
        if ($value === '') {
            return '00:00:00';
        }

        try {
            return Carbon::createFromFormat('H:i', substr($value, 0, 5))->format('H:i:s');
        } catch (Throwable) {
            try {
                return Carbon::parse($value)->format('H:i:s');
            } catch (Throwable) {
                return '00:00:00';
            }
        }
    }

    private function nullableString(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        return $value === '' ? null : $value;
    }

    private function nullableInt(mixed $value): ?int
    {
        if ($value === null || $value === '') {
            return null;
        }
        return (int) $value;
    }

    private function nullableDate(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateString();
        } catch (Throwable) {
            return null;
        }
    }

    private function nullableDateTime(mixed $value): ?string
    {
        $value = trim((string) ($value ?? ''));
        if ($value === '') {
            return null;
        }

        try {
            return Carbon::parse($value)->toDateTimeString();
        } catch (Throwable) {
            return null;
        }
    }

    /**
     * @return list<string>
     */
    private function pluckColumn(PDO $pdo, string $sql): array
    {
        $rows = $this->fetchAll($pdo, $sql);
        return array_values(array_filter(array_map(fn (array $row): string => (string) (array_values($row)[0] ?? ''), $rows)));
    }

    /**
     * @return list<array<string, mixed>>
     */
    private function fetchAll(PDO $pdo, string $sql): array
    {
        $statement = $pdo->query($sql);
        if (! $statement) {
            return [];
        }

        $rows = $statement->fetchAll();
        return is_array($rows) ? $rows : [];
    }

    /**
     * @return list<string>
     */
    private function decodeJsonArray(mixed $value): array
    {
        if ($value === null || $value === '') {
            return [];
        }

        if (is_array($value)) {
            return array_values(array_filter(array_map('strval', $value)));
        }

        $decoded = json_decode((string) $value, true);
        if (! is_array($decoded)) {
            return [];
        }

        return array_values(array_filter(array_map('strval', $decoded)));
    }
}
