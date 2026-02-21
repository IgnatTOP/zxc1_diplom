import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { FormEvent, useMemo, useState } from 'react';

type GroupItem = {
    id: number;
    section_id?: number;
    name: string;
    style: string;
    level: string;
    day_of_week?: string | null;
    time?: string | null;
    age_min?: number | null;
    age_max?: number | null;
    current_students: number;
    max_students: number;
    billing_amount_cents?: number;
    billing_period_days?: number;
    is_active?: boolean;
    section?: { id: number; name: string };
};

type Props = {
    sections: Array<{ id: number; name: string }>;
    items: GroupItem[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

/* ── Helper to update one field in a group ── */
function patchRow(
    setList: React.Dispatch<React.SetStateAction<GroupItem[]>>,
    id: number,
    patch: Partial<GroupItem>,
) {
    setList((prev) =>
        prev.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    );
}

/* ── Mobile card for one group ── */
function GroupCard({
    item,
    sections,
    savingId,
    onUpdate,
    onRemove,
    onPatch,
}: {
    item: GroupItem;
    sections: Array<{ id: number; name: string }>;
    savingId: number | null;
    onUpdate: (item: GroupItem) => void;
    onRemove: (id: number) => void;
    onPatch: (id: number, patch: Partial<GroupItem>) => void;
}) {
    return (
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                        {item.style} · {item.level}
                    </p>
                </div>
                <Badge
                    variant={item.is_active === false ? 'muted' : 'success'}
                >
                    {item.is_active === false ? 'Скрыта' : 'Активна'}
                </Badge>
            </div>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Секция
                    </label>
                    <AdminSelect
                        value={
                            item.section?.id ||
                            item.section_id ||
                            sections[0]?.id
                        }
                        onChange={(e) =>
                            onPatch(item.id, {
                                section_id: Number(e.target.value),
                                section: sections.find(
                                    (s) => s.id === Number(e.target.value),
                                ),
                            })
                        }
                    >
                        {sections.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name}
                            </option>
                        ))}
                    </AdminSelect>
                </div>

                <div>
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">
                        Название
                    </label>
                    <Input
                        value={item.name}
                        onChange={(e) =>
                            onPatch(item.id, { name: e.target.value })
                        }
                    />
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Стиль
                        </label>
                        <Input
                            value={item.style}
                            onChange={(e) =>
                                onPatch(item.id, { style: e.target.value })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Уровень
                        </label>
                        <Input
                            value={item.level}
                            onChange={(e) =>
                                onPatch(item.id, { level: e.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            День недели
                        </label>
                        <Input
                            value={item.day_of_week || ''}
                            placeholder="—"
                            onChange={(e) =>
                                onPatch(item.id, {
                                    day_of_week: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Время
                        </label>
                        <Input
                            value={item.time || ''}
                            placeholder="HH:mm"
                            onChange={(e) =>
                                onPatch(item.id, { time: e.target.value })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Возраст от
                        </label>
                        <Input
                            type="number"
                            value={item.age_min ?? ''}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    age_min:
                                        e.target.value === ''
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Возраст до
                        </label>
                        <Input
                            type="number"
                            value={item.age_max ?? ''}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    age_max:
                                        e.target.value === ''
                                            ? null
                                            : Number(e.target.value),
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Участники
                        </label>
                        <Input
                            type="number"
                            value={item.current_students}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    current_students: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Максимум
                        </label>
                        <Input
                            type="number"
                            value={item.max_students}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    max_students: Number(e.target.value),
                                })
                            }
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Стоимость (коп.)
                        </label>
                        <Input
                            type="number"
                            value={item.billing_amount_cents ?? 0}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    billing_amount_cents: Number(
                                        e.target.value,
                                    ),
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Период (дней)
                        </label>
                        <Input
                            type="number"
                            value={item.billing_period_days ?? 30}
                            onChange={(e) =>
                                onPatch(item.id, {
                                    billing_period_days: Number(
                                        e.target.value,
                                    ),
                                })
                            }
                        />
                    </div>
                </div>

                <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                    <input
                        type="checkbox"
                        checked={item.is_active !== false}
                        onChange={(e) =>
                            onPatch(item.id, { is_active: e.target.checked })
                        }
                    />
                    Активна
                </label>
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

export default function Groups({ sections = [], items = [] }: Props) {
    const [list, setList] = useState<GroupItem[]>(items);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const [form, setForm] = useState({
        sectionId: sections[0]?.id ?? 0,
        name: '',
        style: '',
        level: '',
        dayOfWeek: '',
        time: '',
        ageMin: '',
        ageMax: '',
        maxStudents: 15,
        billingAmountCents: 520000,
        billingPeriodDays: 30,
        isActive: true,
    });

    const activeGroups = useMemo(
        () => list.filter((group) => group.is_active !== false).length,
        [list],
    );

    const create = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const payload = await apiPost<{ ok: boolean; item: GroupItem }>(
                '/api/v1/admin/groups',
                {
                    sectionId: form.sectionId,
                    name: form.name,
                    style: form.style,
                    level: form.level,
                    dayOfWeek: form.dayOfWeek || null,
                    time: form.time || null,
                    ageMin: form.ageMin ? Number(form.ageMin) : null,
                    ageMax: form.ageMax ? Number(form.ageMax) : null,
                    maxStudents: form.maxStudents,
                    billingAmountCents: form.billingAmountCents,
                    billingPeriodDays: form.billingPeriodDays,
                    isActive: form.isActive,
                },
            );

            setList((prev) => [...prev, payload.item]);
            setForm({
                sectionId: sections[0]?.id ?? 0,
                name: '',
                style: '',
                level: '',
                dayOfWeek: '',
                time: '',
                ageMin: '',
                ageMax: '',
                maxStudents: 15,
                billingAmountCents: 520000,
                billingPeriodDays: 30,
                isActive: true,
            });
            setNotice({ tone: 'success', text: 'Группа создана.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const update = async (item: GroupItem) => {
        setSavingId(item.id);
        setNotice(null);

        try {
            const payload = await apiPatch<{ ok: boolean; item: GroupItem }>(
                `/api/v1/admin/groups/${item.id}`,
                {
                    sectionId: item.section?.id || item.section_id,
                    name: item.name,
                    style: item.style,
                    level: item.level,
                    dayOfWeek: item.day_of_week || null,
                    time: item.time || null,
                    ageMin: item.age_min ?? null,
                    ageMax: item.age_max ?? null,
                    maxStudents: item.max_students,
                    currentStudents: item.current_students,
                    billingAmountCents: item.billing_amount_cents ?? 520000,
                    billingPeriodDays: item.billing_period_days ?? 30,
                    isActive: item.is_active ?? true,
                },
            );

            setList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Группа #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const remove = async (id: number) => {
        setSavingId(id);
        setNotice(null);

        try {
            await apiDelete(`/api/v1/admin/groups/${id}`);
            setList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Группа #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Группы">
            <div className="space-y-4">
                {/* Create form */}
                <Card>
                    <CardHeader>
                        <CardTitle>Новая группа</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            Всего: {list.length} · Активных: {activeGroups}
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form
                            className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
                            onSubmit={create}
                        >
                            <AdminSelect
                                value={form.sectionId}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        sectionId: Number(e.target.value),
                                    }))
                                }
                            >
                                {sections.map((section) => (
                                    <option
                                        key={section.id}
                                        value={section.id}
                                    >
                                        {section.name}
                                    </option>
                                ))}
                            </AdminSelect>
                            <Input
                                placeholder="Название группы"
                                value={form.name}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: e.target.value,
                                    }))
                                }
                                required
                            />
                            <Input
                                placeholder="Стиль"
                                value={form.style}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        style: e.target.value,
                                    }))
                                }
                                required
                            />
                            <Input
                                placeholder="Уровень"
                                value={form.level}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        level: e.target.value,
                                    }))
                                }
                                required
                            />
                            <Input
                                placeholder="День недели"
                                value={form.dayOfWeek}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        dayOfWeek: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                placeholder="Время (HH:mm)"
                                value={form.time}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        time: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Возраст от"
                                value={form.ageMin}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        ageMin: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Возраст до"
                                value={form.ageMax}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        ageMax: e.target.value,
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Макс. участников"
                                value={form.maxStudents}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        maxStudents: Number(e.target.value),
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Стоимость (коп.)"
                                value={form.billingAmountCents}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        billingAmountCents: Number(
                                            e.target.value,
                                        ),
                                    }))
                                }
                            />
                            <Input
                                type="number"
                                placeholder="Период (дней)"
                                value={form.billingPeriodDays}
                                onChange={(e) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        billingPeriodDays: Number(
                                            e.target.value,
                                        ),
                                    }))
                                }
                            />
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
                            <Button type="submit">Добавить группу</Button>
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
                                <th className="px-4 py-3">Секция</th>
                                <th className="min-w-[200px] px-4 py-3">
                                    Название / стиль / уровень
                                </th>
                                <th className="min-w-[160px] px-4 py-3">
                                    День и время
                                </th>
                                <th className="min-w-[120px] px-4 py-3">
                                    Возраст
                                </th>
                                <th className="min-w-[140px] px-4 py-3">
                                    Участники
                                </th>
                                <th className="min-w-[170px] px-4 py-3">
                                    Биллинг
                                </th>
                                <th className="px-4 py-3">Статус</th>
                                <th className="min-w-[150px] px-4 py-3">
                                    Действия
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {list.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-border/60 align-top transition-colors hover:bg-brand/5"
                                >
                                    <td className="px-4 py-3">
                                        <AdminSelect
                                            value={
                                                item.section?.id ||
                                                item.section_id ||
                                                sections[0]?.id
                                            }
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    section_id: Number(
                                                        e.target.value,
                                                    ),
                                                    section: sections.find(
                                                        (s) =>
                                                            s.id ===
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                    ),
                                                })
                                            }
                                        >
                                            {sections.map((s) => (
                                                <option
                                                    key={s.id}
                                                    value={s.id}
                                                >
                                                    {s.name}
                                                </option>
                                            ))}
                                        </AdminSelect>
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Input
                                            value={item.name}
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    name: e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            value={item.style}
                                            placeholder="Стиль"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    style: e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            value={item.level}
                                            placeholder="Уровень"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    level: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Input
                                            value={item.day_of_week || ''}
                                            placeholder="День недели"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    day_of_week:
                                                        e.target.value,
                                                })
                                            }
                                        />
                                        <Input
                                            value={item.time || ''}
                                            placeholder="Время"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    time: e.target.value,
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Input
                                            type="number"
                                            placeholder="От"
                                            value={item.age_min ?? ''}
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    age_min:
                                                        e.target.value === ''
                                                            ? null
                                                            : Number(
                                                                e.target
                                                                    .value,
                                                            ),
                                                })
                                            }
                                        />
                                        <Input
                                            type="number"
                                            placeholder="До"
                                            value={item.age_max ?? ''}
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    age_max:
                                                        e.target.value === ''
                                                            ? null
                                                            : Number(
                                                                e.target
                                                                    .value,
                                                            ),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Input
                                            type="number"
                                            value={item.current_students}
                                            placeholder="Текущие"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    current_students: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={item.max_students}
                                            placeholder="Максимум"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    max_students: Number(
                                                        e.target.value,
                                                    ),
                                                })
                                            }
                                        />
                                    </td>
                                    <td className="space-y-2 px-4 py-3">
                                        <Input
                                            type="number"
                                            value={
                                                item.billing_amount_cents ?? 0
                                            }
                                            placeholder="Сумма (коп.)"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    billing_amount_cents:
                                                        Number(e.target.value),
                                                })
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={
                                                item.billing_period_days ?? 30
                                            }
                                            placeholder="Период (дней)"
                                            onChange={(e) =>
                                                patchRow(setList, item.id, {
                                                    billing_period_days: Number(
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
                                                    item.is_active === false
                                                        ? 'muted'
                                                        : 'success'
                                                }
                                            >
                                                {item.is_active === false
                                                    ? 'Скрыта'
                                                    : 'Активна'}
                                            </Badge>
                                            <span className="flex items-center gap-2 text-xs">
                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        item.is_active !==
                                                        false
                                                    }
                                                    onChange={(e) =>
                                                        patchRow(
                                                            setList,
                                                            item.id,
                                                            {
                                                                is_active:
                                                                    e.target
                                                                        .checked,
                                                            },
                                                        )
                                                    }
                                                />
                                                Активна
                                            </span>
                                        </label>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-2">
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
                                        colSpan={8}
                                    >
                                        Группы пока отсутствуют.
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
                            Группы пока отсутствуют.
                        </div>
                    ) : (
                        list.map((item) => (
                            <GroupCard
                                key={item.id}
                                item={item}
                                sections={sections}
                                savingId={savingId}
                                onUpdate={update}
                                onRemove={remove}
                                onPatch={(id, patch) =>
                                    patchRow(setList, id, patch)
                                }
                            />
                        ))
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
