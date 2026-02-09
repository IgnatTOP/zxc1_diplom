import { apiGet, apiPatch, apiPost } from '@/shared/api/http';
import { getApplicationStatusMeta } from '@/shared/lib/admin-labels';
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
    assigned_group?: string | null;
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
        assigned_group: item.assigned_group ?? item.assignedGroup?.name ?? null,
        assigned_day: item.assigned_day || '',
        assigned_time: toTimeValue(item.assigned_time),
        assigned_date: toDateValue(item.assigned_date),
        notes: item.notes || '',
        created_at: item.created_at,
    };
}

export default function Applications({ items, groups }: Props) {
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
            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-semibold">
                            Управление заявками и назначениями
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Поиск работает по имени, телефону, email, стилю,
                            уровню, группе и заметке.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            className="min-w-[280px]"
                            value={query}
                            placeholder="Поиск заявки"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <Button
                            type="button"
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
                                      label: 'Все заявки',
                                      tone: 'muted' as const,
                                  }
                                : getApplicationStatusMeta(status);

                        return (
                            <button
                                type="button"
                                key={status}
                                className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                                    selected
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
                <table className="min-w-[1500px] text-left text-sm">
                    <thead className="bg-surface/70 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="min-w-[210px] px-4 py-3">Клиент</th>
                            <th className="min-w-[160px] px-4 py-3">
                                Стиль / уровень
                            </th>
                            <th className="min-w-[220px] px-4 py-3">Статус</th>
                            <th className="min-w-[220px] px-4 py-3">Группа</th>
                            <th className="min-w-[220px] px-4 py-3">
                                День / время
                            </th>
                            <th className="min-w-[160px] px-4 py-3">Дата</th>
                            <th className="min-w-[320px] px-4 py-3">Заметка</th>
                            <th className="min-w-[170px] px-4 py-3">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredList.map((item) => {
                            const statusMeta = getApplicationStatusMeta(
                                item.status,
                            );

                            return (
                                <tr
                                    key={item.id}
                                    className="border-t border-border/60 align-top"
                                >
                                    <td className="px-4 py-3">#{item.id}</td>
                                    <td className="space-y-1 px-4 py-3">
                                        <p className="font-medium">
                                            {item.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.phone}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.email || 'Без email'}
                                        </p>
                                    </td>
                                    <td className="px-4 py-3">
                                        <p>{item.style}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.level}
                                        </p>
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Badge variant={statusMeta.tone}>
                                            {statusMeta.label}
                                        </Badge>
                                        <select
                                            className="h-10 w-full rounded-lg border border-border px-2"
                                            value={item.status.toLowerCase()}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    status: event.target.value,
                                                })
                                            }
                                        >
                                            {statusOptions.map((status) => (
                                                <option
                                                    key={status}
                                                    value={status}
                                                >
                                                    {
                                                        getApplicationStatusMeta(
                                                            status,
                                                        ).label
                                                    }
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-3">
                                        <select
                                            className="h-10 w-full rounded-lg border border-border px-2"
                                            value={item.assigned_group_id ?? ''}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    assigned_group_id: event
                                                        .target.value
                                                        ? Number(
                                                              event.target
                                                                  .value,
                                                          )
                                                        : null,
                                                    assigned_group:
                                                        groups.find(
                                                            (group) =>
                                                                group.id ===
                                                                Number(
                                                                    event.target
                                                                        .value,
                                                                ),
                                                        )?.name || null,
                                                })
                                            }
                                        >
                                            <option value="">Не выбрана</option>
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
                                    <td className="space-y-2 px-4 py-3">
                                        <select
                                            className="h-10 w-full rounded-lg border border-border px-2"
                                            value={item.assigned_day}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    assigned_day:
                                                        event.target.value,
                                                })
                                            }
                                        >
                                            <option value="">
                                                День не выбран
                                            </option>
                                            {weekDays.map((day) => (
                                                <option key={day} value={day}>
                                                    {day}
                                                </option>
                                            ))}
                                        </select>
                                        <Input
                                            type="time"
                                            value={item.assigned_time}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    assigned_time:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Input
                                            type="date"
                                            value={item.assigned_date}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    assigned_date:
                                                        event.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <Textarea
                                            rows={3}
                                            placeholder="Комментарий по заявке"
                                            value={item.notes}
                                            onChange={(event) =>
                                                updateRow(item.id, {
                                                    notes: event.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                type="button"
                                                size="sm"
                                                disabled={savingId === item.id}
                                                onClick={() => update(item)}
                                            >
                                                Сохранить
                                            </Button>
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="secondary"
                                                disabled={savingId === item.id}
                                                onClick={() =>
                                                    autoAssign(item.id)
                                                }
                                            >
                                                Подобрать группу
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                        {filteredList.length === 0 ? (
                            <tr>
                                <td
                                    className="px-4 py-6 text-center text-muted-foreground"
                                    colSpan={9}
                                >
                                    {list.length === 0
                                        ? 'Заявок пока нет.'
                                        : 'По заданным фильтрам ничего не найдено.'}
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
