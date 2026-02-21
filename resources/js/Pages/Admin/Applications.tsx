import { apiGet, apiPatch, apiPost } from '@/shared/api/http';
import { getApplicationStatusMeta } from '@/shared/lib/admin-labels';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { useMemo, useState } from 'react';

type GroupOption = {
    id: number;
    name: string;
};

type ApplicationItem = {
    id: number;
    name: string;
    phone: string;
    email?: string | null;
    style: string;
    level: string;
    status: string;
    assigned_group_id?: number | null;
    assigned_group?: string | GroupOption | null;
    assigned_day?: string | null;
    assigned_time?: string | null;
    assigned_date?: string | null;
    notes?: string | null;
    created_at?: string | null;
    assignedGroup?: GroupOption | null;
};

type EditableApplicationItem = {
    id: number;
    name: string;
    phone: string;
    email: string;
    style: string;
    level: string;
    status: string;
    assigned_group_id: number | null;
    assigned_group: string | null;
    assigned_day: string;
    assigned_time: string;
    assigned_date: string;
    notes: string;
    created_at?: string | null;
};

type Props = {
    items: ApplicationItem[];
    groups: GroupOption[];
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

function toDateValue(value?: string | null): string {
    return value ? String(value).slice(0, 10) : '';
}

function toTimeValue(value?: string | null): string {
    return value ? String(value).slice(0, 5) : '';
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function normalizeAssignedGroupName(
    assignedGroup: ApplicationItem['assigned_group'],
    fallbackAssignedGroup?: GroupOption | null,
): string | null {
    if (typeof assignedGroup === 'string') {
        return assignedGroup;
    }

    if (
        assignedGroup &&
        typeof assignedGroup === 'object' &&
        'name' in assignedGroup
    ) {
        const name = assignedGroup.name;
        return typeof name === 'string' ? name : null;
    }

    return fallbackAssignedGroup?.name ?? null;
}

function normalizeItem(item: ApplicationItem): EditableApplicationItem {
    return {
        id: item.id,
        name: item.name,
        phone: item.phone,
        email: item.email || '',
        style: item.style,
        level: item.level,
        status: item.status,
        assigned_group_id:
            item.assigned_group_id ?? item.assignedGroup?.id ?? null,
        assigned_group: normalizeAssignedGroupName(
            item.assigned_group,
            item.assignedGroup,
        ),
        assigned_day: item.assigned_day || '',
        assigned_time: toTimeValue(item.assigned_time),
        assigned_date: toDateValue(item.assigned_date),
        notes: item.notes || '',
        created_at: item.created_at,
    };
}

/* ── Inline row for desktop table ── */
function ApplicationRow({
    item,
    groups,
    statusOptions,
    savingId,
    onUpdate,
    onAutoAssign,
    onPatch,
}: {
    item: EditableApplicationItem;
    groups: GroupOption[];
    statusOptions: string[];
    savingId: number | null;
    onUpdate: (item: EditableApplicationItem) => void;
    onAutoAssign: (id: number) => void;
    onPatch: (id: number, patch: Partial<EditableApplicationItem>) => void;
}) {
    const statusMeta = getApplicationStatusMeta(item.status);

    return (
        <tr className="border-t border-border/60 align-top">
            <td className="px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">
                    #{item.id}
                </span>
            </td>
            <td className="space-y-1 px-4 py-3">
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-muted-foreground">{item.phone}</p>
                <p className="text-xs text-muted-foreground">
                    {item.email || 'Без email'}
                </p>
            </td>
            <td className="px-4 py-3">
                <p>{item.style}</p>
                <p className="text-xs text-muted-foreground">{item.level}</p>
            </td>
            <td className="space-y-2 px-4 py-3">
                <Badge variant={statusMeta.tone}>{statusMeta.label}</Badge>
                <AdminSelect
                    value={item.status.toLowerCase()}
                    onChange={(e) =>
                        onPatch(item.id, { status: e.target.value })
                    }
                >
                    {statusOptions.map((status) => (
                        <option key={status} value={status}>
                            {getApplicationStatusMeta(status).label}
                        </option>
                    ))}
                </AdminSelect>
            </td>
            <td className="px-4 py-3">
                <AdminSelect
                    value={item.assigned_group_id ?? ''}
                    onChange={(e) =>
                        onPatch(item.id, {
                            assigned_group_id: e.target.value
                                ? Number(e.target.value)
                                : null,
                            assigned_group:
                                groups.find(
                                    (g) => g.id === Number(e.target.value),
                                )?.name || null,
                        })
                    }
                >
                    <option value="">Не выбрана</option>
                    {groups.map((group) => (
                        <option key={group.id} value={group.id}>
                            {group.name}
                        </option>
                    ))}
                </AdminSelect>
            </td>
            <td className="space-y-2 px-4 py-3">
                <AdminSelect
                    value={item.assigned_day}
                    onChange={(e) =>
                        onPatch(item.id, { assigned_day: e.target.value })
                    }
                >
                    <option value="">День не выбран</option>
                    {weekDays.map((day) => (
                        <option key={day} value={day}>
                            {day}
                        </option>
                    ))}
                </AdminSelect>
                <Input
                    type="time"
                    value={item.assigned_time}
                    onChange={(e) =>
                        onPatch(item.id, { assigned_time: e.target.value })
                    }
                />
            </td>
            <td className="px-4 py-3">
                <Input
                    type="date"
                    value={item.assigned_date}
                    onChange={(e) =>
                        onPatch(item.id, { assigned_date: e.target.value })
                    }
                />
            </td>
            <td className="px-4 py-3">
                <Textarea
                    rows={3}
                    placeholder="Комментарий по заявке"
                    value={item.notes}
                    onChange={(e) =>
                        onPatch(item.id, { notes: e.target.value })
                    }
                />
            </td>
            <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        size="sm"
                        disabled={savingId === item.id}
                        onClick={() => onUpdate(item)}
                    >
                        Сохранить
                    </Button>
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={savingId === item.id}
                        onClick={() => onAutoAssign(item.id)}
                    >
                        Подобрать группу
                    </Button>
                </div>
            </td>
        </tr>
    );
}

/* ── Mobile card ── */
function ApplicationCard({
    item,
    groups,
    statusOptions,
    savingId,
    onUpdate,
    onAutoAssign,
    onPatch,
}: {
    item: EditableApplicationItem;
    groups: GroupOption[];
    statusOptions: string[];
    savingId: number | null;
    onUpdate: (item: EditableApplicationItem) => void;
    onAutoAssign: (id: number) => void;
    onPatch: (id: number, patch: Partial<EditableApplicationItem>) => void;
}) {
    const statusMeta = getApplicationStatusMeta(item.status);

    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            {/* Header */}
            <div className="mb-3 flex items-start justify-between">
                <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.phone}</p>
                    <p className="text-xs text-muted-foreground">
                        {item.email || 'Без email'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={statusMeta.tone}>{statusMeta.label}</Badge>
                    <span className="font-mono text-xs text-muted-foreground">
                        #{item.id}
                    </span>
                </div>
            </div>

            {/* Info */}
            <div className="mb-3 flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-surface px-2 py-1 text-xs">
                    {item.style}
                </span>
                <span className="rounded-lg bg-surface px-2 py-1 text-xs">
                    {item.level}
                </span>
                {item.assigned_group && (
                    <span className="rounded-lg bg-brand/10 px-2 py-1 text-xs text-brand-dark">
                        {item.assigned_group}
                    </span>
                )}
            </div>

            {/* Editable fields */}
            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Статус
                    </label>
                    <AdminSelect
                        value={item.status.toLowerCase()}
                        onChange={(e) =>
                            onPatch(item.id, { status: e.target.value })
                        }
                    >
                        {statusOptions.map((status) => (
                            <option key={status} value={status}>
                                {getApplicationStatusMeta(status).label}
                            </option>
                        ))}
                    </AdminSelect>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Группа
                    </label>
                    <AdminSelect
                        value={item.assigned_group_id ?? ''}
                        onChange={(e) =>
                            onPatch(item.id, {
                                assigned_group_id: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                assigned_group:
                                    groups.find(
                                        (g) =>
                                            g.id === Number(e.target.value),
                                    )?.name || null,
                            })
                        }
                    >
                        <option value="">Не выбрана</option>
                        {groups.map((group) => (
                            <option key={group.id} value={group.id}>
                                {group.name}
                            </option>
                        ))}
                    </AdminSelect>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            День
                        </label>
                        <AdminSelect
                            value={item.assigned_day}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    assigned_day: e.target.value,
                                })
                            }
                        >
                            <option value="">—</option>
                            {weekDays.map((day) => (
                                <option key={day} value={day}>
                                    {day}
                                </option>
                            ))}
                        </AdminSelect>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Время
                        </label>
                        <Input
                            type="time"
                            value={item.assigned_time}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    assigned_time: e.target.value,
                                })
                            }
                        />
                    </div>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Дата
                    </label>
                    <Input
                        type="date"
                        value={item.assigned_date}
                        onChange={(e) =>
                            onPatch(item.id, { assigned_date: e.target.value })
                        }
                    />
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Заметка
                    </label>
                    <Textarea
                        rows={2}
                        placeholder="Комментарий"
                        value={item.notes}
                        onChange={(e) =>
                            onPatch(item.id, { notes: e.target.value })
                        }
                    />
                </div>
            </div>

            {/* Actions */}
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
                    variant="secondary"
                    className="flex-1"
                    disabled={savingId === item.id}
                    onClick={() => onAutoAssign(item.id)}
                >
                    Подобрать группу
                </Button>
            </div>
        </div>
    );
}

/* ── Main page ── */
export default function Applications({ items = [], groups = [] }: Props) {
    const [list, setList] = useState<EditableApplicationItem[]>(() =>
        items.map(normalizeItem),
    );
    const [savingId, setSavingId] = useState<number | null>(null);
    const [isAutoAssigningAll, setIsAutoAssigningAll] = useState(false);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const statusOptions = useMemo(() => {
        const predefined = ['pending', 'assigned', 'processed', 'rejected'];
        const dynamic = list.map((item) => item.status.toLowerCase());
        return Array.from(new Set([...predefined, ...dynamic]));
    }, [list]);

    const statusCounts = useMemo<Record<string, number>>(() => {
        const counts: Record<string, number> = { all: list.length };
        statusOptions.forEach((status) => {
            counts[status] = list.filter(
                (item) => item.status.toLowerCase() === status,
            ).length;
        });
        return counts;
    }, [list, statusOptions]);

    const filteredList = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return list.filter((item) => {
            const statusMatches =
                statusFilter === 'all' ||
                item.status.toLowerCase() === statusFilter.toLowerCase();
            if (!statusMatches) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const haystack = [
                item.name,
                item.phone,
                item.email,
                item.style,
                item.level,
                item.notes,
                item.assigned_group,
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [list, query, statusFilter]);

    const updateRow = (
        id: number,
        patch: Partial<EditableApplicationItem>,
    ): void => {
        setList((prev) =>
            prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
        );
    };

    const update = async (item: EditableApplicationItem) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const payload = await apiPatch<{
                ok: boolean;
                item: ApplicationItem;
            }>(`/api/v1/admin/applications/${item.id}`, {
                status: item.status,
                assignedGroupId: item.assigned_group_id,
                assignedDay: item.assigned_day || null,
                assignedTime: item.assigned_time || null,
                assignedDate: item.assigned_date || null,
                notes: item.notes || null,
            });

            setList((prev) =>
                prev.map((row) =>
                    row.id === item.id ? normalizeItem(payload.item) : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Заявка #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const autoAssign = async (id: number) => {
        setNotice(null);
        setSavingId(id);

        try {
            const payload = await apiPost<{
                ok: boolean;
                item: ApplicationItem;
            }>(`/api/v1/admin/applications/${id}/auto-assign`, {});
            setList((prev) =>
                prev.map((row) =>
                    row.id === id ? normalizeItem(payload.item) : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Для заявки #${id} подобрана группа.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const autoAssignAll = async () => {
        setNotice(null);
        setIsAutoAssigningAll(true);

        try {
            const response = await apiPost<{ ok: boolean; assigned: number }>(
                '/api/v1/admin/applications/auto-assign-all',
                {},
            );
            const refreshed = await apiGet<{
                ok: boolean;
                items: ApplicationItem[];
            }>('/api/v1/admin/applications');
            setList(refreshed.items.map(normalizeItem));
            setNotice({
                tone: 'success',
                text: `Автораспределение завершено: ${response.assigned} заявок.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setIsAutoAssigningAll(false);
        }
    };

    return (
        <AdminLayout title="Заявки">
            <div className="space-y-4">
                {/* Filters */}
                <div className="rounded-2xl border border-border bg-card p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                            <p className="text-sm font-semibold">
                                Управление заявками и назначениями
                            </p>
                            <p className="hidden text-sm text-muted-foreground sm:block">
                                Поиск работает по имени, телефону, email, стилю,
                                уровню, группе и заметке.
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                            <Input
                                className="w-full sm:min-w-[280px]"
                                value={query}
                                placeholder="Поиск заявки"
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                            <Button
                                type="button"
                                className="w-full shrink-0 sm:w-auto"
                                disabled={isAutoAssigningAll}
                                onClick={autoAssignAll}
                            >
                                Распределить все новые
                            </Button>
                        </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                        {['all', ...statusOptions].map((status) => {
                            const selected = statusFilter === status;
                            const meta =
                                status === 'all'
                                    ? {
                                        label: 'Все',
                                        tone: 'muted' as const,
                                    }
                                    : getApplicationStatusMeta(status);

                            return (
                                <button
                                    type="button"
                                    key={status}
                                    className={`rounded-lg border px-3 py-1.5 text-sm transition ${selected
                                            ? 'border-brand bg-brand/10 font-semibold text-brand-dark'
                                            : 'border-border text-foreground hover:bg-surface'
                                        }`}
                                    onClick={() => setStatusFilter(status)}
                                >
                                    {meta.label}: {statusCounts[status] ?? 0}
                                </button>
                            );
                        })}
                    </div>
                </div>

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
                                <th className="px-4 py-3">ID</th>
                                <th className="min-w-[180px] px-4 py-3">
                                    Клиент
                                </th>
                                <th className="min-w-[120px] px-4 py-3">
                                    Стиль / уровень
                                </th>
                                <th className="min-w-[180px] px-4 py-3">
                                    Статус
                                </th>
                                <th className="min-w-[180px] px-4 py-3">
                                    Группа
                                </th>
                                <th className="min-w-[180px] px-4 py-3">
                                    День / время
                                </th>
                                <th className="min-w-[140px] px-4 py-3">
                                    Дата
                                </th>
                                <th className="min-w-[200px] px-4 py-3">
                                    Заметка
                                </th>
                                <th className="min-w-[150px] px-4 py-3">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map((item) => (
                                <ApplicationRow
                                    key={item.id}
                                    item={item}
                                    groups={groups}
                                    statusOptions={statusOptions}
                                    savingId={savingId}
                                    onUpdate={update}
                                    onAutoAssign={autoAssign}
                                    onPatch={updateRow}
                                />
                            ))}
                            {filteredList.length === 0 && (
                                <tr>
                                    <td
                                        className="px-4 py-8 text-center text-muted-foreground"
                                        colSpan={9}
                                    >
                                        {list.length === 0
                                            ? 'Заявок пока нет.'
                                            : 'По заданным фильтрам ничего не найдено.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile cards */}
                <div className="flex flex-col gap-3 md:hidden">
                    {filteredList.length === 0 ? (
                        <div className="py-12 text-center text-sm text-muted-foreground">
                            {list.length === 0
                                ? 'Заявок пока нет.'
                                : 'По заданным фильтрам ничего не найдено.'}
                        </div>
                    ) : (
                        filteredList.map((item) => (
                            <ApplicationCard
                                key={item.id}
                                item={item}
                                groups={groups}
                                statusOptions={statusOptions}
                                savingId={savingId}
                                onUpdate={update}
                                onAutoAssign={autoAssign}
                                onPatch={updateRow}
                            />
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
