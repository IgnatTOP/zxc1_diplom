<?php

namespace Database\Seeders;

use App\Models\AdminTelegramLink;
use App\Models\Application;
use App\Models\BlogPost;
use App\Models\Collage;
use App\Models\Content;
use App\Models\Enrollment;
use App\Models\Gallery;
use App\Models\Group;
use App\Models\GroupScheduleItem;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Section;
use App\Models\SectionNews;
use App\Models\Setting;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\TeamMember;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use RecursiveDirectoryIterator;
use RecursiveIteratorIterator;

class MassiveDomainSeeder extends Seeder
{
    public function run(): void
    {
        $admins = User::query()->where('role', 'admin')->get(['id']);
        $adminIds = $admins->pluck('id')->all();

        if ($adminIds === []) {
            throw new \RuntimeException('No admin users found. Admin data must exist before seeding.');
        }

        $this->wipeDomainDataKeepingAdmins($adminIds);

        $admin = User::query()->whereKey($adminIds[0])->firstOrFail();
        $media = $this->prepareMedia();

        $sections = $this->seedSections();
        $groups = $this->seedGroupsAndSchedule($sections);
        $users = $this->seedUsers();
        $this->seedEnrollmentsAndPayments($users, $groups);
        $this->seedApplications($groups);
        $this->seedSupport($admin, $users);
        $this->seedTeam($media);
        $this->seedGalleryAndCollages($media);
        $this->seedBlog($media);
        $this->seedSectionNews($sections, $admin, $media);
        $this->seedContentAndSettings();
        $this->syncGroupCounters();
    }

    /**
     * @param array<int> $adminIds
     */
    private function wipeDomainDataKeepingAdmins(array $adminIds): void
    {
        DB::transaction(function () use ($adminIds): void {
            DB::table('support_messages')->delete();
            DB::table('support_conversations')->delete();
            DB::table('payments')->delete();
            DB::table('payment_methods')->delete();
            DB::table('enrollments')->delete();
            DB::table('group_schedule_items')->delete();
            DB::table('groups')->delete();
            DB::table('section_news')->delete();
            DB::table('applications')->delete();
            DB::table('blog_posts')->delete();
            DB::table('collages')->delete();
            DB::table('gallery')->delete();
            DB::table('team_members')->delete();
            DB::table('content')->delete();
            DB::table('settings')->delete();
            DB::table('sections')->delete();

            AdminTelegramLink::query()->whereNotIn('user_id', $adminIds)->delete();
            User::query()->whereNotIn('id', $adminIds)->delete();

            if (DB::getDriverName() === 'sqlite') {
                DB::table('sqlite_sequence')->whereIn('name', [
                    'support_messages',
                    'support_conversations',
                    'payments',
                    'payment_methods',
                    'enrollments',
                    'group_schedule_items',
                    'groups',
                    'section_news',
                    'applications',
                    'blog_posts',
                    'collages',
                    'gallery',
                    'team_members',
                    'content',
                    'settings',
                    'sections',
                    'users',
                ])->delete();
            }
        });
    }

    /**
     * @return array<int, string>
     */
    private function prepareMedia(): array
    {
        $sourceCandidates = array_filter([
            env('SEED_MEDIA_SOURCE'),
            '/seed-media',
            '/Users/ignat/Documents/ArenaIce/backend/media',
        ]);

        $source = null;
        foreach ($sourceCandidates as $candidate) {
            if (is_dir($candidate)) {
                $source = $candidate;
                break;
            }
        }

        if ($source === null) {
            throw new \RuntimeException('Media source directory not found for seeder.');
        }

        $target = storage_path('app/public/media/arena-seed');
        File::deleteDirectory($target);
        File::ensureDirectoryExists($target);

        $extensions = ['jpg', 'jpeg', 'png', 'webp'];
        $files = [];

        $iterator = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($source));
        foreach ($iterator as $file) {
            if (! $file->isFile()) {
                continue;
            }

            $ext = strtolower((string) $file->getExtension());
            if (! in_array($ext, $extensions, true)) {
                continue;
            }

            $relative = trim(str_replace($source, '', $file->getPathname()), DIRECTORY_SEPARATOR);
            $flattened = str_replace(['/', '\\', ' '], ['-', '-', '-'], $relative);
            $filename = Str::lower(pathinfo($flattened, PATHINFO_FILENAME));
            $toName = $filename.'-'.substr(md5($relative), 0, 10).'.'.$ext;
            $to = $target.DIRECTORY_SEPARATOR.$toName;

            File::copy($file->getPathname(), $to);
            $files[] = 'media/arena-seed/'.$toName;
        }

        sort($files);
        if ($files === []) {
            throw new \RuntimeException('No images were copied from media source.');
        }

        return $files;
    }

    /**
     * @return \Illuminate\Support\Collection<int, Section>
     */
    private function seedSections()
    {
        $items = [
            ['slug' => 'ice-hockey', 'name' => 'Хоккей', 'description' => 'Группы хоккея для детей и подростков: техника катания, владение шайбой, игровая практика.', 'seo_title' => 'Хоккейная секция для детей и подростков', 'seo_description' => 'Набор в хоккейные группы: расписание тренировок, пробные занятия, обучение технике катания и игре.'],
            ['slug' => 'figure-skating', 'name' => 'Фигурное катание', 'description' => 'Фигурное катание для начинающих и продолжающих: базовые элементы, скольжение, хореография на льду.', 'seo_title' => 'Фигурное катание для детей и взрослых', 'seo_description' => 'Секция фигурного катания с опытными тренерами. Группы по возрасту и уровню подготовки.'],
            ['slug' => 'ice-beginners', 'name' => 'Катание с нуля', 'description' => 'Программы для тех, кто впервые выходит на лед. Безопасный старт и уверенное катание.', 'seo_title' => 'Обучение катанию на коньках с нуля', 'seo_description' => 'Уроки катания на коньках для новичков: техника, баланс, торможение и уверенное движение по льду.'],
            ['slug' => 'goalie-school', 'name' => 'Школа вратарей', 'description' => 'Специализированные тренировки для хоккейных вратарей: реакция, координация, позиционная игра.', 'seo_title' => 'Школа хоккейных вратарей', 'seo_description' => 'Подготовка вратарей: ледовые тренировки, техника перемещений, игровые ситуации и индивидуальная работа.'],
            ['slug' => 'adult-groups', 'name' => 'Взрослые группы', 'description' => 'Регулярные вечерние тренировки для взрослых: техника катания и функциональная подготовка.', 'seo_title' => 'Тренировки на льду для взрослых', 'seo_description' => 'Взрослые группы на льду: удобное расписание после работы, тренировки для новичков и продолжающих.'],
            ['slug' => 'kids-mini', 'name' => 'Детский лед 4-6', 'description' => 'Первые шаги на льду для малышей в игровом формате с мягкой адаптацией.', 'seo_title' => 'Детская секция на льду 4-6 лет', 'seo_description' => 'Детские занятия на льду для возраста 4-6 лет: безопасная адаптация, базовые навыки и развитие координации.'],
            ['slug' => 'off-ice', 'name' => 'ОФП и растяжка', 'description' => 'Сухая подготовка для ледовых дисциплин: сила, координация, гибкость и восстановление.', 'seo_title' => 'ОФП для хоккея и фигурного катания', 'seo_description' => 'ОФП и растяжка для спортсменов на льду: профилактика травм, улучшение выносливости и техники.'],
            ['slug' => 'intensive-camps', 'name' => 'Сезонные сборы', 'description' => 'Интенсивные программы в каникулярные периоды: лед, ОФП, контроль прогресса и мини-турниры.', 'seo_title' => 'Ледовые сборы и интенсивы', 'seo_description' => 'Сборы на льду для детей и подростков: насыщенная программа тренировок и индивидуальный контроль развития.'],
        ];

        return collect($items)->map(function (array $item, int $index): Section {
            return Section::query()->create([
                'slug' => $item['slug'],
                'name' => $item['name'],
                'description' => $item['description'],
                'seo_title' => $item['seo_title'],
                'seo_description' => $item['seo_description'],
                'is_active' => true,
                'sort_order' => $index,
            ]);
        });
    }

    /**
     * @param \Illuminate\Support\Collection<int, Section> $sections
     * @return \Illuminate\Support\Collection<int, Group>
     */
    private function seedGroupsAndSchedule($sections)
    {
        $days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
        $levels = ['Начальный', 'Базовый', 'Средний', 'Продвинутый'];
        $groupCounter = 0;
        $scheduleCounter = 0;
        $groups = collect();

        foreach ($sections as $section) {
            for ($i = 0; $i < 3; $i++) {
                $level = $levels[($groupCounter + $i) % count($levels)];
                $ageMin = [4, 7, 10, 14, 18][($groupCounter + $i) % 5];
                $ageMax = max($ageMin + 3, [6, 10, 14, 17, 45][($groupCounter + $i) % 5]);
                $maxStudents = [12, 14, 16, 18, 20][($groupCounter + $i) % 5];
                $currentStudents = min($maxStudents - 1, 6 + (($groupCounter + $i) % 9));
                $startHour = 8 + (($groupCounter * 2 + $i * 3) % 12);
                $startMinute = (($groupCounter + $i) % 2 === 0) ? '00' : '30';

                $group = Group::query()->create([
                    'section_id' => $section->id,
                    'name' => $section->name.' · Поток '.($i + 1),
                    'style' => $section->name,
                    'level' => $level,
                    'day_of_week' => $days[($groupCounter + $i) % count($days)],
                    'time' => sprintf('%02d:%s', $startHour, $startMinute),
                    'age_min' => $ageMin,
                    'age_max' => $ageMax,
                    'max_students' => $maxStudents,
                    'current_students' => $currentStudents,
                    'billing_amount_cents' => (450000 + (($groupCounter + $i) % 6) * 50000),
                    'billing_period_days' => 30,
                    'currency' => 'RUB',
                    'is_active' => true,
                ]);

                $groups->push($group);
                $groupCounter++;

                for ($j = 0; $j < 2; $j++) {
                    $slotStart = Carbon::createFromTime($startHour + $j, ($j === 0 ? (int) $startMinute : 0), 0);
                    $slotEnd = (clone $slotStart)->addMinutes(90);
                    GroupScheduleItem::query()->create([
                        'group_id' => $group->id,
                        'day_of_week' => $days[($groupCounter + $j) % count($days)],
                        'date' => null,
                        'start_time' => $slotStart->format('H:i:s'),
                        'end_time' => $slotEnd->format('H:i:s'),
                        'style' => $section->name,
                        'level' => $level,
                        'instructor' => $this->instructorName($scheduleCounter),
                        'is_active' => true,
                        'sort_order' => $scheduleCounter,
                    ]);
                    $scheduleCounter++;
                }
            }
        }

        return $groups;
    }

    /**
     * @return \Illuminate\Support\Collection<int, User>
     */
    private function seedUsers()
    {
        $users = collect();

        for ($i = 1; $i <= 42; $i++) {
            $users->push(User::query()->create([
                'name' => 'Ученик '.$i,
                'email' => sprintf('student%02d@arenaice.local', $i),
                'password' => Hash::make('password'),
                'role' => 'user',
                'email_verified_at' => now()->subDays(rand(5, 240)),
            ]));
        }

        return $users;
    }

    /**
     * @param \Illuminate\Support\Collection<int, User> $users
     * @param \Illuminate\Support\Collection<int, Group> $groups
     */
    private function seedEnrollmentsAndPayments($users, $groups): void
    {
        $groupCount = $groups->count();

        foreach ($users as $index => $user) {
            $enrollmentCount = ($index % 7 === 0) ? 2 : 1;
            $usedGroupIndexes = [];

            for ($n = 0; $n < $enrollmentCount; $n++) {
                $groupIndex = ($index * 3 + $n * 5) % $groupCount;
                if (in_array($groupIndex, $usedGroupIndexes, true)) {
                    continue;
                }
                $usedGroupIndexes[] = $groupIndex;
                $group = $groups[$groupIndex];

                $startedAt = now()->subDays(10 + (($index + $n) % 120));
                $nextDueAt = (clone $startedAt)->addDays(30);

                $enrollment = Enrollment::query()->create([
                    'user_id' => $user->id,
                    'section_id' => $group->section_id,
                    'group_id' => $group->id,
                    'status' => (($index + $n) % 11 === 0) ? 'paused' : 'active',
                    'started_at' => $startedAt,
                    'ended_at' => null,
                    'next_payment_due_at' => $nextDueAt,
                    'billing_amount_cents' => $group->billing_amount_cents,
                    'billing_period_days' => 30,
                    'currency' => 'RUB',
                ]);

                $method = PaymentMethod::query()->create([
                    'user_id' => $user->id,
                    'brand' => ['visa', 'mastercard', 'mir'][($index + $n) % 3],
                    'last4' => str_pad((string) (1000 + (($index * 7 + $n * 19) % 9000)), 4, '0', STR_PAD_LEFT),
                    'exp_month' => (($index + $n) % 12) + 1,
                    'exp_year' => now()->addYears(2 + (($index + $n) % 3))->year,
                    'fingerprint' => 'seed-user-'.$user->id.'-pm-'.$n,
                    'is_default' => $n === 0,
                ]);

                for ($p = 0; $p < 3; $p++) {
                    $paidAt = (clone $startedAt)->addDays($p * 30);
                    Payment::query()->create([
                        'enrollment_id' => $enrollment->id,
                        'user_id' => $user->id,
                        'payment_method_id' => $method->id,
                        'amount_cents' => $group->billing_amount_cents,
                        'currency' => 'RUB',
                        'status' => 'success',
                        'due_at' => $paidAt,
                        'paid_at' => $paidAt,
                        'gateway' => 'mock',
                        'meta' => [
                            'seeded' => true,
                            'period' => $p + 1,
                            'group' => $group->name,
                        ],
                    ]);
                }
            }
        }
    }

    /**
     * @param \Illuminate\Support\Collection<int, Group> $groups
     */
    private function seedApplications($groups): void
    {
        $styles = $groups->pluck('style')->unique()->values();
        $levels = ['Начальный', 'Базовый', 'Средний', 'Продвинутый'];
        $statuses = ['pending', 'approved', 'pending', 'pending', 'rejected'];

        for ($i = 1; $i <= 55; $i++) {
            $group = $groups[$i % $groups->count()];
            $status = $statuses[$i % count($statuses)];

            Application::query()->create([
                'name' => 'Клиент '.$i,
                'phone' => '+79'.str_pad((string) (100000000 + $i * 137), 9, '0', STR_PAD_LEFT),
                'email' => 'lead'.$i.'@arenaice.local',
                'age' => 5 + ($i % 28),
                'weight' => $i % 4 === 0 ? null : (18 + ($i % 42)),
                'style' => $styles[$i % $styles->count()],
                'level' => $levels[$i % count($levels)],
                'status' => $status,
                'assigned_group_id' => $status === 'approved' ? $group->id : null,
                'assigned_group' => $status === 'approved' ? $group->name : null,
                'assigned_day' => $status === 'approved' ? $group->day_of_week : null,
                'assigned_time' => $status === 'approved' ? $group->time : null,
                'assigned_date' => $status === 'approved' ? now()->addDays(($i % 14) + 1)->toDateString() : null,
                'notes' => $this->applicationNote($i),
            ]);
        }
    }

    /**
     * @param \Illuminate\Support\Collection<int, User> $users
     */
    private function seedSupport(User $admin, $users): void
    {
        $userSubset = $users->take(20)->values();
        foreach ($userSubset as $index => $user) {
            $conversation = SupportConversation::query()->create([
                'user_id' => $user->id,
                'guest_token' => null,
                'assigned_admin_id' => $admin->id,
                'status' => ($index % 6 === 0) ? 'closed' : 'open',
                'last_message_at' => now()->subMinutes($index * 15),
            ]);

            $messages = [
                ['type' => 'user', 'source' => 'web', 'body' => 'Здравствуйте! Подскажите, есть ли свободные места в группе?'],
                ['type' => 'admin', 'source' => 'admin', 'body' => 'Добрый день. Да, свободные места есть, можем подобрать удобное время.'],
                ['type' => 'user', 'source' => 'web', 'body' => 'Отлично, интересует вечернее расписание в будни.'],
                ['type' => 'admin', 'source' => 'admin', 'body' => 'Добавила варианты в ваш профиль, проверьте раздел расписания.'],
            ];

            foreach ($messages as $msgIndex => $msg) {
                SupportMessage::query()->create([
                    'conversation_id' => $conversation->id,
                    'sender_type' => $msg['type'],
                    'sender_user_id' => $msg['type'] === 'admin' ? $admin->id : $user->id,
                    'source' => $msg['source'],
                    'body' => $msg['body'],
                    'telegram_update_id' => null,
                    'sent_at' => now()->subMinutes(($index * 15) + (10 - $msgIndex * 2)),
                    'is_read_by_user' => $msg['type'] === 'admin',
                    'is_read_by_admin' => true,
                ]);
            }
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedTeam(array $media): void
    {
        $names = [
            'Артем Зорин', 'Ника Орлова', 'Илья Титов', 'Евгения Ларионова',
            'Алексей Фомин', 'Мария Королева', 'Дмитрий Снегирев', 'Ольга Новикова',
            'Роман Белов', 'Татьяна Клинова', 'Павел Тетерин', 'Анна Шубина',
        ];

        foreach ($names as $index => $name) {
            TeamMember::query()->create([
                'name' => $name,
                'experience' => $this->teamExperience($index),
                'photo' => $media[$index % count($media)],
                'sort_order' => $index,
                'is_active' => true,
            ]);
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedGalleryAndCollages(array $media): void
    {
        foreach ($media as $index => $image) {
            Gallery::query()->create([
                'filename' => $image,
                'title' => 'Тренировочный кадр #'.($index + 1),
                'description' => 'Фотография тренировочного процесса на льду и работы с тренером.',
                'alt_text' => 'Arena Ice тренировка фото '.($index + 1),
                'sort_order' => $index,
                'is_active' => true,
            ]);
        }

        $chunks = array_chunk($media, 6);
        foreach (array_slice($chunks, 0, 8) as $index => $chunk) {
            Collage::query()->create([
                'title' => 'Коллаж сезона '.($index + 1),
                'main_image' => $chunk[0],
                'photos' => array_values(array_slice($chunk, 1, 4)),
                'photo_count' => 5,
            ]);
        }
    }

    /**
     * @param array<int, string> $media
     */
    private function seedBlog(array $media): void
    {
        for ($i = 1; $i <= 24; $i++) {
            $title = 'Подготовка к тренировкам на льду: чеклист #'.$i;
            $slug = Str::slug('arena-ice-blog-'.$i.'-'.$title);

            BlogPost::query()->create([
                'title' => $title,
                'slug' => $slug,
                'excerpt' => 'Практические рекомендации по технике, восстановлению и безопасной нагрузке для стабильного прогресса.',
                'content' => $this->blogContent($i),
                'featured_image' => $media[($i + 9) % count($media)],
                'images' => [
                    $media[($i + 16) % count($media)],
                    $media[($i + 23) % count($media)],
                ],
                'author' => 'Редакция Arena Ice',
                'published_date' => now()->subDays($i),
                'is_published' => true,
                'sort_order' => $i,
            ]);
        }
    }

    /**
     * @param \Illuminate\Support\Collection<int, Section> $sections
     * @param array<int, string> $media
     */
    private function seedSectionNews($sections, User $admin, array $media): void
    {
        $counter = 0;
        foreach ($sections as $section) {
            for ($n = 1; $n <= 6; $n++) {
                $counter++;
                $title = $section->name.': новый набор в группу '.$n;

                SectionNews::query()->create([
                    'section_id' => $section->id,
                    'author_id' => $admin->id,
                    'title' => $title,
                    'slug' => $section->slug.'-news-'.$n,
                    'summary' => 'Открыта запись в '.$section->name.' на новый учебный период. Доступны пробные занятия и консультации тренера.',
                    'content' => 'Мы открыли дополнительный набор в направление "'.$section->name.'". В программе: регулярные тренировки, контроль прогресса и участие в клубных мероприятиях. Выберите группу по уровню и времени, отправьте заявку через сайт и получите подтверждение в личном кабинете.',
                    'cover_image' => $media[$counter % count($media)],
                    'is_published' => true,
                    'published_at' => now()->subDays($counter),
                ]);
            }
        }
    }

    private function seedContentAndSettings(): void
    {
        $contentItems = [
            ['page' => 'about', 'section' => 'main', 'key_name' => 'main_text', 'value' => 'Arena Ice развивает детские и взрослые направления на льду: хоккей, фигурное катание, стартовые группы и специализированную подготовку.'],
            ['page' => 'about', 'section' => 'main', 'key_name' => 'mission_title', 'value' => 'Наша миссия'],
            ['page' => 'about', 'section' => 'main', 'key_name' => 'mission_text', 'value' => 'Давать системную и безопасную подготовку на льду с прозрачным прогрессом для каждого ученика.'],
            ['page' => 'about', 'section' => 'main', 'key_name' => 'values_title', 'value' => 'Ценности Arena Ice'],
            ['page' => 'about', 'section' => 'main', 'key_name' => 'values_text', 'value' => 'Дисциплина, уважение, безопасность и измеримый результат в каждой тренировке.'],
            ['page' => 'blog', 'section' => 'main', 'key_name' => 'page_title', 'value' => 'Блог Arena Ice'],
            ['page' => 'blog', 'section' => 'main', 'key_name' => 'page_subtitle', 'value' => 'Статьи о тренировках на льду, технике и восстановлении спортсменов.'],
        ];

        foreach ($contentItems as $item) {
            Content::query()->create([
                'page' => $item['page'],
                'section' => $item['section'],
                'key_name' => $item['key_name'],
                'value' => $item['value'],
                'type' => 'text',
            ]);
        }

        $settings = [
            ['key_name' => 'gallery_layout', 'value' => 'grid', 'type' => 'text'],
            ['key_name' => 'site_phone', 'value' => '+7 (901) 555-22-11', 'type' => 'text'],
            ['key_name' => 'site_email', 'value' => 'info@arenaice.ru', 'type' => 'text'],
            ['key_name' => 'site_address', 'value' => 'Москва, Ледовый проезд, 7', 'type' => 'text'],
            ['key_name' => 'seo_home_title', 'value' => 'Arena Ice: секции хоккея и фигурного катания', 'type' => 'text'],
            ['key_name' => 'seo_home_description', 'value' => 'Тренировки на льду для детей и взрослых: группы по возрасту и уровню, пробные занятия, онлайн-запись.', 'type' => 'text'],
        ];

        foreach ($settings as $setting) {
            Setting::query()->create([
                'key_name' => $setting['key_name'],
                'value' => $setting['value'],
                'type' => $setting['type'],
                'updated_at' => now(),
            ]);
        }
    }

    private function syncGroupCounters(): void
    {
        Group::query()
            ->withCount(['enrollments as active_enrollments_count' => fn ($q) => $q->where('status', 'active')])
            ->get()
            ->each(function (Group $group): void {
                $active = (int) ($group->active_enrollments_count ?? 0);
                $group->update([
                    'current_students' => min($group->max_students, max($active, (int) $group->current_students)),
                ]);
            });
    }

    private function instructorName(int $index): string
    {
        $names = [
            'Тренер Андрей К.', 'Тренер Ирина М.', 'Тренер Павел Н.',
            'Тренер Ольга С.', 'Тренер Максим Р.', 'Тренер Екатерина Д.',
        ];

        return $names[$index % count($names)];
    }

    private function teamExperience(int $index): string
    {
        $items = [
            'Хоккей, 11 лет тренерской практики',
            'Фигурное катание, КМС, 9 лет преподавания',
            'Катание с нуля, адаптация начинающих',
            'Подготовка вратарей, 8 лет специализированной работы',
            'Взрослые группы, техника и выносливость',
            'Детские группы 4-6, игровая методика',
            'ОФП и функциональная подготовка',
        ];

        return $items[$index % count($items)];
    }

    private function applicationNote(int $index): string
    {
        $notes = [
            'Нужна утренняя группа в выходные.',
            'Ребенок уже катается, хотим добавить технику.',
            'Интересует пробное занятие в ближайшие дни.',
            'Подходит только вечер после 19:00.',
            'Цель: подготовка к соревнованиям следующего сезона.',
        ];

        return $notes[$index % count($notes)];
    }

    private function blogContent(int $index): string
    {
        return '<p>Регулярные тренировки на льду дают результат только при системном подходе. Важно заранее планировать нагрузку, технику и восстановление.</p>'
            .'<p>В материале #'.$index.' разбираем подготовку к занятию, контроль интенсивности и безопасное освоение новых элементов. Для детей и взрослых ключевой фактор прогресса — стабильный график и обратная связь тренера.</p>'
            .'<p>Следите за сном, водным балансом и самочувствием после нагрузок. При необходимости корректируйте объем занятий вместе с наставником, чтобы сохранять качество техники и избегать перетренированности.</p>';
    }
}

