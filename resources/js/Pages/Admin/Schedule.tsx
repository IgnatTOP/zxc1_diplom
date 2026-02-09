import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { FormEvent, useMemo, useState } from 'react';

type GroupOption = { id: number; name: string };

type ScheduleItem = {
    id: number;
    group_id?: number;
    day_of_week: string;
    date?: string | null;
    start_time: string;
    end_time?: string | null;
    instructor: string;
    sort_order: number;
    is_active: boolean;
    group?: GroupOption;
};

type EditableScheduleItem = {
    id: number;
    group_id: number;
    day_of_week: string;
    date: string;
    start_time: string;
    end_time: string;
    instructor: string;
    sort_order: number;
    is_active: boolean;
    group?: GroupOption;
};

type Props = {
    groups: GroupOption[];
    items: ScheduleItem[];
};

const weekDays = [
    'Понедельник',
    'Вторник',
    'Среда',
    'Четверг',
    'Пятница',
    'Суббота',
    'Воскресенье',
];

function toTimeValue(value?: string | null): string {
    return value ? String(value).slice(0, 5) : '';
}

function toDateValue(value?: string | null): string {
    return value ? String(value).slice(0, 10) : '';
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function normalizeItem(
    item: ScheduleItem,
    fallbackGroupId: number,
): EditableScheduleItem {
    return {
        id: item.id,
        group_id: item.group_id ?? item.group?.id ?? fallbackGroupId,
        day_of_week: item.day_of_week,
        date: toDateValue(item.date),
        start_time: toTimeValue(item.start_time),
        end_time: toTimeValue(item.end_time),
        instructor: item.instructor,
        sort_order: item.sort_order ?? 0,
        is_active: item.is_active ?? true,
        group: item.group,
    };
}

export default function Schedule({ groups, items }: Props) {
    const defaultGroupId = useMemo(() => groups[0]?.id ?? 0, [groups]);
    const [list, setList] = useState<EditableScheduleItem[]>(() =>
        items.map((item) => normalizeItem(item, defaultGroupId)),
    );
    const [isCreating, setIsCreating] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);
    const [form, setForm] = useState({
        groupId: defaultGroupId,
        dayOfWeek: '',
        date: '',
        startTime: '',
        endTime: '',
        instructor: '',
        sortOrder: list.length,
        isActive: true,
    });

    const create = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.groupId) {
            setNotice({
                tone: 'error',
                text: 'Сначала создайте хотя бы одну группу.',
            });
            return;
        }

        setNotice(null);
        setIsCreating(true);

        try {
            const payload = await apiPost<{ ok: boolean; item: ScheduleItem }>(
                '/api/v1/admin/schedule',
                {
                    groupId: form.groupId,
                    dayOfWeek: form.dayOfWeek,
                    date: form.date || null,
                    startTime: form.startTime,
                    endTime: form.endTime || null,
                    instructor: form.instructor,
                    sortOrder: form.sortOrder,
                    isActive: form.isActive,
                },
            );

            setList((prev) => [
                ...prev,
                normalizeItem(payload.item, defaultGroupId),
            ]);
            setForm({
                groupId: defaultGroupId,
                dayOfWeek: '',
                date: '',
                startTime: '',
                endTime: '',
                instructor: '',
                sortOrder: list.length + 1,
                isActive: true,
            });
            setNotice({
                tone: 'success',
                text: 'Запись расписания добавлена.',
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (item: EditableScheduleItem) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: ScheduleItem }>(
                `/api/v1/admin/schedule/${item.id}`,
                {
                    groupId: item.group_id,
                    dayOfWeek: item.day_of_week,
                    date: item.date || null,
                    startTime: item.start_time,
                    endTime: item.end_time || null,
                    instructor: item.instructor,
                    sortOrder: item.sort_order,
                    isActive: item.is_active,
                },
            );

            setList((prev) =>
                prev.map((row) =>
                    row.id === item.id
                        ? normalizeItem(payload.item, defaultGroupId)
                        : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Запись #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const remove = async (id: number) => {
        setNotice(null);
        setSavingId(id);

        try {
            await apiDelete<{ ok: boolean }>(`/api/v1/admin/schedule/${id}`);
            setList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Запись #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Расписание">
            <Card>
                <CardHeader>
                    <CardTitle>Новая запись расписания</CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-3 md:grid-cols-4"
                        onSubmit={create}
                    >
                        <select
                            className="h-11 rounded-xl border border-border px-3"
                            value={form.groupId}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    groupId: Number(event.target.value),
                                }))
                            }
                            required
                        >
                            {groups.length === 0 ? (
                                <option value={0}>Нет групп</option>
                            ) : null}
                            {groups.map((group) => (
                                <option key={group.id} value={group.id}>
                                    {group.name}
                                </option>
                            ))}
                        </select>
                        <select
                            className="h-11 rounded-xl border border-border px-3"
                            value={form.dayOfWeek}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    dayOfWeek: event.target.value,
                                }))
                            }
                            required
                        >
                            <option value="">Выберите день недели</option>
                            {weekDays.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </select>
                        <Input
                            type="date"
                            value={form.date}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    date: event.target.value,
                                }))
                            }
                        />
                        <Input
                            type="time"
                            value={form.startTime}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    startTime: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            type="time"
                            value={form.endTime}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    endTime: event.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Тренер"
                            value={form.instructor}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    instructor: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            type="number"
                            placeholder="Порядок"
                            value={form.sortOrder}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    sortOrder: Number(event.target.value),
                                }))
                            }
                        />
                        <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                            <input
                                type="checkbox"
                                checked={form.isActive}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        isActive: event.target.checked,
                                    }))
                                }
                            />
                            Активна
                        </label>
                        <Button
                            type="submit"
                            disabled={isCreating || groups.length === 0}
                        >
                            Добавить
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {notice ? (
                <p
                    className={`rounded-lg px-3 py-2 text-sm ${
                        notice.tone === 'success'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-red-100 text-red-700'
                    }`}
                >
                    {notice.text}
                </p>
            ) : null}

            <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface/70 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Группа</th>
                            <th className="px-4 py-3">День</th>
                            <th className="px-4 py-3">Дата</th>
                            <th className="px-4 py-3">Начало</th>
                            <th className="px-4 py-3">Конец</th>
                            <th className="px-4 py-3">Тренер</th>
                            <th className="px-4 py-3">Порядок</th>
                            <th className="px-4 py-3">Статус</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-border/60"
                            >
                                <td className="px-4 py-3">
                                    <select
                                        className="h-9 rounded-lg border border-border px-2"
                                        value={item.group_id}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              group_id: Number(
                                                                  event.target
                                                                      .value,
                                                              ),
                                                              group: groups.find(
                                                                  (group) =>
                                                                      group.id ===
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              ),
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        {groups.map((group) => (
                                            <option
                                                key={group.id}
                                                value={group.id}
                                            >
                                                {group.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <select
                                        className="h-11 w-full rounded-xl border border-border px-3"
                                        value={item.day_of_week}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              day_of_week:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        <option value="">
                                            Выберите день недели
                                        </option>
                                        {!weekDays.includes(item.day_of_week) &&
                                        item.day_of_week ? (
                                            <option value={item.day_of_week}>
                                                {item.day_of_week}
                                            </option>
                                        ) : null}
                                        {weekDays.map((day) => (
                                            <option key={day} value={day}>
                                                {day}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        type="date"
                                        value={item.date}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              date: event.target
                                                                  .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        type="time"
                                        value={item.start_time}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              start_time:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        type="time"
                                        value={item.end_time}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              end_time:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        value={item.instructor}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              instructor:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        type="number"
                                        value={item.sort_order}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              sort_order:
                                                                  Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="px-4 py-3">
                                    <label className="space-y-2">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                item.is_active
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-surface text-muted-foreground'
                                            }`}
                                        >
                                            {item.is_active
                                                ? 'Активна'
                                                : 'Отключена'}
                                        </span>
                                        <span className="inline-flex items-center gap-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={item.is_active}
                                                onChange={(event) =>
                                                    setList((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                      ...row,
                                                                      is_active:
                                                                          event
                                                                              .target
                                                                              .checked,
                                                                  }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                            Активна
                                        </span>
                                    </label>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            disabled={savingId === item.id}
                                            onClick={() => update(item)}
                                        >
                                            Сохранить
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            disabled={savingId === item.id}
                                            onClick={() => remove(item.id)}
                                        >
                                            Удалить
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {list.length === 0 ? (
                            <tr>
                                <td
                                    className="px-4 py-6 text-center text-muted-foreground"
                                    colSpan={9}
                                >
                                    Записи расписания пока отсутствуют.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
