import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
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

/* ── Mobile card for one schedule item ── */
function ScheduleCard({
    item,
    groups,
    savingId,
    onUpdate,
    onRemove,
    onPatch,
}: {
    item: EditableScheduleItem;
    groups: GroupOption[];
    savingId: number | null;
    onUpdate: (item: EditableScheduleItem) => void;
    onRemove: (id: number) => void;
    onPatch: (id: number, patch: Partial<EditableScheduleItem>) => void;
}) {
    const groupName =
        groups.find((g) => g.id === item.group_id)?.name ?? '—';

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-semibold">{groupName}</p>
                <Badge variant={item.is_active ? 'success' : 'muted'}>
                    {item.is_active ? 'Активна' : 'Отключена'}
                </Badge>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Группа
                    </label>
                    <AdminSelect
                        value={item.group_id}
                        onChange={(e) =>
                            onPatch(item.id, {
                                group_id: Number(e.target.value),
                                group: groups.find(
                                    (g) => g.id === Number(e.target.value),
                                ),
                            })
                        }
                    >
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </AdminSelect>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        День недели
                    </label>
                    <AdminSelect
                        value={item.day_of_week}
                        onChange={(e) =>
                            onPatch(item.id, { day_of_week: e.target.value })
                        }
                    >
                        <option value="">Выберите день</option>
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
                    </AdminSelect>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Начало
                        </label>
                        <Input
                            type="time"
                            value={item.start_time}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    start_time: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Конец
                        </label>
                        <Input
                            type="time"
                            value={item.end_time}
                            onChange={(e) =>
                                onPatch(item.id, { end_time: e.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Дата
                        </label>
                        <Input
                            type="date"
                            value={item.date}
                            onChange={(e) =>
                                onPatch(item.id, { date: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Тренер
                        </label>
                        <Input
                            value={item.instructor}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    instructor: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Порядок
                        </label>
                        <Input
                            type="number"
                            value={item.sort_order}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    sort_order: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-border px-3 text-sm">
                            <input
                                type="checkbox"
                                checked={item.is_active}
                                onChange={(e) =>
                                    onPatch(item.id, {
                                        is_active: e.target.checked,
                                    })
                                }
                            />
                            Активна
                        </label>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex gap-2">
                <Button
                    type="button"
                    size="sm"
                    className="flex-1"
                    disabled={savingId === item.id}
                    onClick={() => onUpdate(item)}
                >
                    Сохранить
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    disabled={savingId === item.id}
                    onClick={() => onRemove(item.id)}
                >
                    Удалить
                </Button>
            </div>
        </div>
    );
}

export default function Schedule({ groups = [], items = [] }: Props) {
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

    const updateRow = (
        id: number,
        patch: Partial<EditableScheduleItem>,
    ) => {
        setList((prev) =>
            prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    };

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
            <div className="space-y-4">
                {/* Create form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Новая запись расписания</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-3 sm:grid-cols-2 md:grid-cols-4"
                            onSubmit={create}
                        >
                            <AdminSelect
                                value={form.groupId}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        groupId: Number(e.target.value),
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
                            </AdminSelect>
                            <AdminSelect
                                value={form.dayOfWeek}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        dayOfWeek: e.target.value,
                                    }))
                                }
                                required
                            >
                                <option value="">День недели</option>
                                {weekDays.map((day) => (
                                    <option key={day} value={day}>
                                        {day}
                                    </option>
                                ))}
                            </AdminSelect>
                            <Input
                                type="date"
                                value={form.date}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        date: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="time"
                                value={form.startTime}
                                placeholder="Начало"
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        startTime: e.target.value,
                                    }))
                                }
                                required
                            />
                            <Input
                                type="time"
                                value={form.endTime}
                                placeholder="Конец"
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        endTime: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Тренер"
                                value={form.instructor}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        instructor: e.target.value,
                                    }))
                                }
                                required
                            />
                            <Input
                                type="number"
                                placeholder="Порядок"
                                value={form.sortOrder}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        sortOrder: Number(e.target.value),
                                    }))
                                }
                            />
                            <div className="flex gap-2">
                                <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        checked={form.isActive}
                                        onChange={(e) =>
                                            setForm((prev) => ({
                                                ...prev,
                                                isActive: e.target.checked,
                                            }))
                                        }
                                    />
                                    Активна
                                </label>
                                <Button
                                    type="submit"
                                    className="flex-1"
                                    disabled={
                                        isCreating || groups.length === 0
                                    }
                                >
                                    Добавить
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                {/* Notice */}
                {notice && (
                    <p
                        className={`rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                            }`}
                    >
                        {notice.text}
                    </p>
                )}

                {/* Desktop table */}
                <div className="hidden overflow-x-auto rounded-2xl border border-border bg-card md:block">
                    <table className="w-full text-left text-sm">
                        <thead className="border-b border-border text-xs uppercase text-muted-foreground">
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
                                    className="border-t border-border/60 transition-colors hover:bg-brand/5"
                                >
                                    <td className="px-4 py-3">
                                        <AdminSelect
                                            value={item.group_id}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    group_id: Number(
                                                        e.target.value,
                                                    ),
                                                    group: groups.find(
                                                        (g) =>
                                                            g.id ===
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                    ),
                                                })
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
                                        </AdminSelect>
                                    </td>
                                    <td className="px-4 py-3">
                                        <AdminSelect
                                            value={item.day_of_week}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    day_of_week:
                                                        e.target.value,
                                                })
                                            }
                                        >
                                            <option value="">—</option>
                                            {!weekDays.includes(
                                                item.day_of_week,
                                            ) && item.day_of_week ? (
                                                <option
                                                    value={item.day_of_week}
                                                >
                                                    {item.day_of_week}
                                                </option>
                                            ) : null}
                                            {weekDays.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </AdminSelect>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="date"
                                            value={item.date}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    date: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="time"
                                            value={item.start_time}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    start_time: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="time"
                                            value={item.end_time}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    end_time: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            value={item.instructor}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    instructor: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="number"
                                            className="w-20"
                                            value={item.sort_order}
                                            onChange={(e) =>
                                                updateRow(item.id, {
                                                    sort_order: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <label className="space-y-2">
                                            <Badge
                                                variant={
                                                    item.is_active
                                                        ? 'success'
                                                        : 'muted'
                                                }
                                            >
                                                {item.is_active
                                                    ? 'Активна'
                                                    : 'Отключена'}
                                            </Badge>
                                            <span className="flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={item.is_active}
                                                    onChange={(e) =>
                                                        updateRow(item.id, {
                                                            is_active:
                                                                e.target
                                                                    .checked,
                                                        })
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
                                                size="sm"
                                                disabled={
                                                    savingId === item.id
                                                }
                                                onClick={() => update(item)}
                                            >
                                                Сохранить
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="destructive"
                                                disabled={
                                                    savingId === item.id
                                                }
                                                onClick={() =>
                                                    remove(item.id)
                                                }
                                            >
                                                Удалить
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {list.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-8 text-center text-muted-foreground"
                                        colSpan={9}
                                    >
                                        Записи расписания пока отсутствуют.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="flex flex-col gap-3 md:hidden">
                    {list.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            Записи расписания пока отсутствуют.
                        </div>
                    ) : (
                        list.map((item) => (
                            <ScheduleCard
                                key={item.id}
                                item={item}
                                groups={groups}
                                savingId={savingId}
                                onUpdate={update}
                                onRemove={remove}
                                onPatch={updateRow}
                            />
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
