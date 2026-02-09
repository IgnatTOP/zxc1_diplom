<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Application;
use App\Models\Enrollment;
use App\Models\Group;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ApplicationsController extends Controller
{
    public function index()
    {
        return response()->json([
            'ok' => true,
            'items' => Application::query()
                ->with('assignedGroup:id,name,day_of_week,time')
                ->latest('created_at')
                ->get(),
        ]);
    }

    public function update(Request $request, Application $application)
    {
        $payload = $request->validate([
            'status' => ['nullable', 'string', 'max:40'],
            'assignedGroupId' => ['nullable', 'integer', 'exists:groups,id'],
            'assignedDay' => ['nullable', 'string', 'max:80'],
            'assignedTime' => ['nullable', 'string', 'max:20'],
            'assignedDate' => ['nullable', 'date'],
            'notes' => ['nullable', 'string'],
        ]);

        if (array_key_exists('assignedGroupId', $payload) && $payload['assignedGroupId']) {
            $group = Group::query()->find($payload['assignedGroupId']);
            if ($group) {
                $payload['assignedDay'] = $payload['assignedDay'] ?? $group->day_of_week;
                $payload['assignedTime'] = $payload['assignedTime'] ?? $group->time;
            }
        }

        $application->update([
            'status' => $payload['status'] ?? $application->status,
            'assigned_group_id' => array_key_exists('assignedGroupId', $payload) ? $payload['assignedGroupId'] : $application->assigned_group_id,
            'assigned_group' => array_key_exists('assignedGroupId', $payload)
                ? Group::query()->where('id', $payload['assignedGroupId'])->value('name')
                : $application->assigned_group,
            'assigned_day' => array_key_exists('assignedDay', $payload) ? $payload['assignedDay'] : $application->assigned_day,
            'assigned_time' => array_key_exists('assignedTime', $payload) ? $payload['assignedTime'] : $application->assigned_time,
            'assigned_date' => array_key_exists('assignedDate', $payload) ? $payload['assignedDate'] : $application->assigned_date,
            'notes' => array_key_exists('notes', $payload) ? $payload['notes'] : $application->notes,
        ]);

        $this->syncEnrollment($application->fresh());

        return response()->json(['ok' => true, 'item' => $application->fresh()->load('assignedGroup:id,name')]);
    }

    public function autoAssign(Application $application)
    {
        $group = $this->findBestGroup($application);
        if (! $group) {
            return response()->json(['ok' => false, 'message' => 'Подходящая группа не найдена.'], 422);
        }

        DB::transaction(function () use ($application, $group): void {
            $application->update([
                'status' => 'assigned',
                'assigned_group_id' => $group->id,
                'assigned_group' => $group->name,
                'assigned_day' => $group->day_of_week,
                'assigned_time' => $group->time,
            ]);

            Group::query()->where('id', $group->id)->update([
                'current_students' => DB::raw('MIN(max_students, current_students + 1)'),
            ]);
        });

        $this->syncEnrollment($application->fresh());

        return response()->json(['ok' => true, 'item' => $application->fresh()->load('assignedGroup:id,name')]);
    }

    public function autoAssignAll()
    {
        $applications = Application::query()->where('status', 'pending')->get();
        $assigned = 0;

        foreach ($applications as $application) {
            $group = $this->findBestGroup($application);
            if (! $group) {
                continue;
            }

            DB::transaction(function () use ($application, $group): void {
                $application->update([
                    'status' => 'assigned',
                    'assigned_group_id' => $group->id,
                    'assigned_group' => $group->name,
                    'assigned_day' => $group->day_of_week,
                    'assigned_time' => $group->time,
                ]);

                Group::query()->where('id', $group->id)->update([
                    'current_students' => DB::raw('MIN(max_students, current_students + 1)'),
                ]);
            });

            $this->syncEnrollment($application->fresh());
            $assigned++;
        }

        return response()->json(['ok' => true, 'assigned' => $assigned]);
    }

    private function findBestGroup(Application $application): ?Group
    {
        $age = $application->age;

        return Group::query()
            ->where('is_active', true)
            ->where('style', $application->style)
            ->where('level', $application->level)
            ->whereColumn('current_students', '<', 'max_students')
            ->when($age !== null, function ($query) use ($age): void {
                $query
                    ->where(function ($inner) use ($age): void {
                        $inner->whereNull('age_min')->orWhere('age_min', '<=', $age);
                    })
                    ->where(function ($inner) use ($age): void {
                        $inner->whereNull('age_max')->orWhere('age_max', '>=', $age);
                    });
            })
            ->orderBy('current_students')
            ->orderBy('id')
            ->first();
    }

    private function syncEnrollment(Application $application): void
    {
        if ($application->status !== 'assigned' || ! $application->assigned_group_id || ! $application->email) {
            return;
        }

        $user = User::query()->where('email', $application->email)->first();
        $group = Group::query()->find($application->assigned_group_id);

        if (! $user || ! $group) {
            return;
        }

        $startedAt = $application->assigned_date?->startOfDay() ?? now();

        Enrollment::query()->updateOrCreate(
            [
                'user_id' => $user->id,
                'group_id' => $group->id,
                'started_at' => $startedAt,
            ],
            [
                'section_id' => $group->section_id,
                'status' => 'active',
                'next_payment_due_at' => $startedAt->copy()->addDays((int) $group->billing_period_days),
                'billing_amount_cents' => $group->billing_amount_cents,
                'billing_period_days' => $group->billing_period_days,
                'currency' => $group->currency,
            ],
        );
    }
}
