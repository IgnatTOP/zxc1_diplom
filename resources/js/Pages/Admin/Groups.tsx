import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
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

export default function Groups({ sections, items }: Props) {
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
            <Card>
                <CardHeader>
                    <CardTitle>Новая группа</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Всего групп: {list.length} · Активных: {activeGroups}
                    </p>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-3 md:grid-cols-5"
                        onSubmit={create}
                    >
                        <select
                            className="h-11 rounded-xl border border-border px-3"
                            value={form.sectionId}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    sectionId: Number(event.target.value),
                                }))
                            }
                        >
                            {sections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.name}
                                </option>
                            ))}
                        </select>
                        <Input
                            placeholder="Название группы"
                            value={form.name}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    name: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="Стиль"
                            value={form.style}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    style: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="Уровень"
                            value={form.level}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    level: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="День недели"
                            value={form.dayOfWeek}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    dayOfWeek: event.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Время (HH:mm)"
                            value={form.time}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    time: event.target.value,
                                }))
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Возраст от"
                            value={form.ageMin}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    ageMin: event.target.value,
                                }))
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Возраст до"
                            value={form.ageMax}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    ageMax: event.target.value,
                                }))
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Макс. участников"
                            value={form.maxStudents}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    maxStudents: Number(event.target.value),
                                }))
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Стоимость (коп.)"
                            value={form.billingAmountCents}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingAmountCents: Number(
                                        event.target.value,
                                    ),
                                }))
                            }
                        />
                        <Input
                            type="number"
                            placeholder="Период оплаты (дней)"
                            value={form.billingPeriodDays}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    billingPeriodDays: Number(
                                        event.target.value,
                                    ),
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
                        <Button type="submit">Добавить группу</Button>
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
                <table className="min-w-[1700px] text-left text-sm">
                    <thead className="bg-surface/70 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">Секция</th>
                            <th className="min-w-[250px] px-4 py-3">
                                Название / стиль / уровень
                            </th>
                            <th className="min-w-[220px] px-4 py-3">
                                День и время
                            </th>
                            <th className="min-w-[160px] px-4 py-3">Возраст</th>
                            <th className="min-w-[180px] px-4 py-3">
                                Участники
                            </th>
                            <th className="min-w-[220px] px-4 py-3">Биллинг</th>
                            <th className="min-w-[120px] px-4 py-3">Статус</th>
                            <th className="min-w-[170px] px-4 py-3">
                                Действия
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-border/60 align-top"
                            >
                                <td className="px-4 py-3">
                                    <select
                                        className="h-10 w-full rounded-lg border border-border px-2"
                                        value={
                                            item.section?.id ||
                                            item.section_id ||
                                            sections[0]?.id
                                        }
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              section_id:
                                                                  Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                              section:
                                                                  sections.find(
                                                                      (
                                                                          section,
                                                                      ) =>
                                                                          section.id ===
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
                                        {sections.map((section) => (
                                            <option
                                                key={section.id}
                                                value={section.id}
                                            >
                                                {section.name}
                                            </option>
                                        ))}
                                    </select>
                                </td>
                                <td className="space-y-2 px-4 py-3">
                                    <Input
                                        value={item.name}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              name: event.target
                                                                  .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        value={item.style}
                                        placeholder="Стиль"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              style: event
                                                                  .target.value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        value={item.level}
                                        placeholder="Уровень"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              level: event
                                                                  .target.value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="space-y-2 px-4 py-3">
                                    <Input
                                        value={item.day_of_week || ''}
                                        placeholder="День недели"
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
                                    />
                                    <Input
                                        value={item.time || ''}
                                        placeholder="Время (HH:mm)"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              time: event.target
                                                                  .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="space-y-2 px-4 py-3">
                                    <Input
                                        type="number"
                                        placeholder="От"
                                        value={item.age_min ?? ''}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              age_min:
                                                                  event.target
                                                                      .value ===
                                                                  ''
                                                                      ? null
                                                                      : Number(
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
                                    <Input
                                        type="number"
                                        placeholder="До"
                                        value={item.age_max ?? ''}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              age_max:
                                                                  event.target
                                                                      .value ===
                                                                  ''
                                                                      ? null
                                                                      : Number(
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
                                <td className="space-y-2 px-4 py-3">
                                    <Input
                                        type="number"
                                        value={item.current_students}
                                        placeholder="Текущие"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              current_students:
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
                                    <Input
                                        type="number"
                                        value={item.max_students}
                                        placeholder="Максимум"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              max_students:
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
                                <td className="space-y-2 px-4 py-3">
                                    <Input
                                        type="number"
                                        value={item.billing_amount_cents ?? 0}
                                        placeholder="Сумма в копейках"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              billing_amount_cents:
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
                                    <Input
                                        type="number"
                                        value={item.billing_period_days ?? 30}
                                        placeholder="Период в днях"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              billing_period_days:
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
                                        <span className="inline-flex items-center gap-2 text-xs">
                                            <input
                                                type="checkbox"
                                                checked={
                                                    item.is_active !== false
                                                }
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
                                    className="px-4 py-8 text-center text-muted-foreground"
                                    colSpan={8}
                                >
                                    Группы пока отсутствуют.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
