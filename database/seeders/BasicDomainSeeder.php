<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\GroupScheduleItem;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Section;
use App\Models\SectionNews;
use App\Models\SupportConversation;
use App\Models\SupportMessage;
use App\Models\User;
use Illuminate\Database\Seeder;

class BasicDomainSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::query()->where('email', 'admin@dancewave.ru')->first();
        $user = User::query()->where('email', 'test@example.com')->first();

        if (! $admin || ! $user) {
            return;
        }

        $sections = Section::query()
            ->whereIn('slug', ['hip-hop', 'contemporary', 'latin', 'kids'])
            ->get()
            ->keyBy('slug');

        $groupsData = [
            [
                'section_slug' => 'hip-hop',
                'name' => 'Hip-Hop Beginner',
                'style' => 'Hip-Hop',
                'level' => 'Beginner',
                'day_of_week' => 'Понедельник',
                'time' => '19:00',
                'age_min' => 14,
                'age_max' => 30,
                'max_students' => 20,
                'current_students' => 8,
            ],
            [
                'section_slug' => 'contemporary',
                'name' => 'Contemporary Pro',
                'style' => 'Contemporary',
                'level' => 'Advanced',
                'day_of_week' => 'Среда',
                'time' => '20:00',
                'age_min' => 16,
                'age_max' => 35,
                'max_students' => 18,
                'current_students' => 6,
            ],
            [
                'section_slug' => 'latin',
                'name' => 'Latin Mix',
                'style' => 'Latin',
                'level' => 'Intermediate',
                'day_of_week' => 'Пятница',
                'time' => '18:30',
                'age_min' => 15,
                'age_max' => 40,
                'max_students' => 16,
                'current_students' => 7,
            ],
            [
                'section_slug' => 'kids',
                'name' => 'Kids Start',
                'style' => 'Kids',
                'level' => 'Beginner',
                'day_of_week' => 'Суббота',
                'time' => '12:00',
                'age_min' => 6,
                'age_max' => 12,
                'max_students' => 20,
                'current_students' => 10,
            ],
        ];

        $groups = collect();

        foreach ($groupsData as $groupData) {
            $section = $sections->get($groupData['section_slug']);
            if (! $section) {
                continue;
            }

            $group = Group::query()->updateOrCreate(
                [
                    'section_id' => $section->id,
                    'name' => $groupData['name'],
                ],
                [
                    'style' => $groupData['style'],
                    'level' => $groupData['level'],
                    'day_of_week' => $groupData['day_of_week'],
                    'time' => $groupData['time'],
                    'age_min' => $groupData['age_min'],
                    'age_max' => $groupData['age_max'],
                    'max_students' => $groupData['max_students'],
                    'current_students' => $groupData['current_students'],
                    'billing_amount_cents' => 520000,
                    'billing_period_days' => 30,
                    'currency' => 'RUB',
                    'is_active' => true,
                ],
            );

            $groups->push($group);

            GroupScheduleItem::query()->updateOrCreate(
                [
                    'group_id' => $group->id,
                    'day_of_week' => $groupData['day_of_week'],
                    'start_time' => $groupData['time'].':00',
                ],
                [
                    'end_time' => now()->setTimeFromTimeString($groupData['time'])->addMinutes(90)->format('H:i:s'),
                    'style' => $groupData['style'],
                    'level' => $groupData['level'],
                    'instructor' => 'DanceWave Coach',
                    'is_active' => true,
                    'sort_order' => 0,
                ],
            );
        }

        foreach ($sections as $section) {
            SectionNews::query()->updateOrCreate(
                [
                    'slug' => $section->slug.'-welcome-news',
                ],
                [
                    'section_id' => $section->id,
                    'author_id' => $admin->id,
                    'title' => 'Новый набор в секцию '.$section->name,
                    'summary' => 'Открыта запись в группы на следующий месяц.',
                    'content' => 'Открыта запись в группы секции '.$section->name.'. Оставьте заявку на сайте и выберите удобное расписание.',
                    'cover_image' => null,
                    'is_published' => true,
                    'published_at' => now(),
                ],
            );
        }

        $primaryGroup = $groups->first();
        if ($primaryGroup) {
            $enrollment = Enrollment::query()->updateOrCreate(
                [
                    'user_id' => $user->id,
                    'group_id' => $primaryGroup->id,
                ],
                [
                    'section_id' => $primaryGroup->section_id,
                    'status' => 'active',
                    'started_at' => now()->subDays(15),
                    'ended_at' => null,
                    'next_payment_due_at' => now()->addDays(15),
                    'billing_amount_cents' => 520000,
                    'billing_period_days' => 30,
                    'currency' => 'RUB',
                ],
            );

            $paymentMethod = PaymentMethod::query()->updateOrCreate(
                [
                    'fingerprint' => 'seed-test-user-visa-1111',
                ],
                [
                    'user_id' => $user->id,
                    'brand' => 'visa',
                    'last4' => '1111',
                    'exp_month' => 12,
                    'exp_year' => now()->addYear()->year,
                    'is_default' => true,
                ],
            );

            Payment::query()->updateOrCreate(
                [
                    'enrollment_id' => $enrollment->id,
                    'user_id' => $user->id,
                    'paid_at' => now()->subDays(15)->startOfDay(),
                ],
                [
                    'payment_method_id' => $paymentMethod->id,
                    'amount_cents' => 520000,
                    'currency' => 'RUB',
                    'status' => 'success',
                    'due_at' => now()->subDays(15)->startOfDay(),
                    'gateway' => 'mock',
                    'meta' => ['seeded' => true],
                ],
            );
        }

        Application::query()->updateOrCreate(
            [
                'phone' => '+79990001122',
                'style' => 'Hip-Hop',
                'level' => 'Beginner',
            ],
            [
                'name' => 'Иван Клиент',
                'email' => 'lead@example.com',
                'age' => 17,
                'weight' => null,
                'status' => 'pending',
                'assigned_group_id' => null,
                'assigned_group' => null,
                'assigned_day' => null,
                'assigned_time' => null,
                'assigned_date' => null,
                'notes' => 'Хочет вечерние тренировки',
            ],
        );

        $conversation = SupportConversation::query()->updateOrCreate(
            [
                'user_id' => $user->id,
            ],
            [
                'guest_token' => null,
                'assigned_admin_id' => $admin->id,
                'status' => 'open',
                'last_message_at' => now()->subHour(),
            ],
        );

        SupportMessage::query()->updateOrCreate(
            [
                'conversation_id' => $conversation->id,
                'sender_type' => 'user',
                'body' => 'Здравствуйте, хочу уточнить расписание своей группы.',
            ],
            [
                'sender_user_id' => $user->id,
                'source' => 'web',
                'sent_at' => now()->subHours(2),
                'is_read_by_user' => true,
                'is_read_by_admin' => true,
            ],
        );

        SupportMessage::query()->updateOrCreate(
            [
                'conversation_id' => $conversation->id,
                'sender_type' => 'admin',
                'body' => 'Добрый день, расписание уже доступно в вашем личном кабинете.',
            ],
            [
                'sender_user_id' => $admin->id,
                'source' => 'admin',
                'sent_at' => now()->subHour(),
                'is_read_by_user' => false,
                'is_read_by_admin' => true,
            ],
        );
    }
}
