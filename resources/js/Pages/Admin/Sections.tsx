import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    BookOpen,
    CheckCircle2,
    Plus,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type SectionItem = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    sort_order?: number;
    is_active?: boolean;
};

type Props = {
    sections?: SectionItem[];
    items?: SectionItem[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Sections({ sections, items }: Props) {
    const initialSections = Array.isArray(sections)
        ? sections
        : Array.isArray(items)
          ? items
          : [];

    const [list, setList] = useState<SectionItem[]>(initialSections);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        sortOrder: list.length + 1,
        isActive: true,
    });

    const activeCount = useMemo(
        () => list.filter((s) => s.is_active !== false).length,
        [list],
    );

    const createSection = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const payload = await apiPost<{ ok: boolean; item: SectionItem }>(
                '/api/v1/admin/sections',
                {
                    name: form.name,
                    slug: form.slug || null,
                    description: form.description || null,
                    sortOrder: form.sortOrder,
                    isActive: form.isActive,
                },
            );

            setList((prev) => [...prev, payload.item]);
            setForm({
                name: '',
                slug: '',
                description: '',
                sortOrder: list.length + 2,
                isActive: true,
            });
            setNotice({ tone: 'success', text: 'Секция добавлена.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const saveSection = async (item: SectionItem) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: SectionItem }>(
                `/api/v1/admin/sections/${item.id}`,
                {
                    name: item.name,
                    slug: item.slug || null,
                    description: item.description || null,
                    sortOrder: item.sort_order ?? 0,
                    isActive: item.is_active ?? true,
                },
            );

            setList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Секция #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const deleteSection = async (id: number) => {
        setNotice(null);
        setSavingId(id);

        try {
            await apiDelete<{ ok: boolean }>(`/api/v1/admin/sections/${id}`);
            setList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Секция #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Секции">
            {notice ? (
                <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                        : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}
                >
                    {notice.tone === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {notice.text}
                </div>
            ) : null}

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <BookOpen className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <CardTitle>Секции</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Всего: {list.length} · Активных: {activeCount}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={createSection}
                    >
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Название *</label>
                            <Input
                                placeholder="Название секции"
                                value={form.name}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        name: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Slug</label>
                            <Input
                                placeholder="auto-slug"
                                value={form.slug}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        slug: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Описание</label>
                            <Textarea
                                rows={3}
                                placeholder="Описание секции"
                                value={form.description}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        description: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Сортировка</label>
                            <Input
                                type="number"
                                value={form.sortOrder}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        sortOrder: Number(event.target.value),
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="accent-brand"
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
                            <Button type="submit">
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить секцию
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => (
                    <Card
                        key={item.id}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardContent className="space-y-3 pt-6">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">
                                    Секция #{item.id}
                                </p>
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
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Название</label>
                                <Input
                                    value={item.name}
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                        ...row,
                                                        name: event.target.value,
                                                    }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Slug</label>
                                <Input
                                    value={item.slug}
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                        ...row,
                                                        slug: event.target.value,
                                                    }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Описание</label>
                                <Textarea
                                    rows={3}
                                    value={item.description || ''}
                                    placeholder="Описание секции"
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                        ...row,
                                                        description:
                                                            event.target.value,
                                                    }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Сортировка</label>
                                    <Input
                                        type="number"
                                        value={item.sort_order ?? 0}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            sort_order: Number(
                                                                event.target.value,
                                                            ),
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                <label className="inline-flex h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-brand"
                                        checked={item.is_active !== false}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            is_active:
                                                                event.target
                                                                    .checked,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    Активна
                                </label>
                            </div>
                            <div className="flex gap-2 border-t border-border/50 pt-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={savingId === item.id}
                                    onClick={() => saveSection(item)}
                                >
                                    Сохранить
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    disabled={savingId === item.id}
                                    onClick={() => deleteSection(item.id)}
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {list.length === 0 ? (
                <Card>
                    <CardContent className="py-10 text-center text-muted-foreground">
                        Секции пока не добавлены.
                    </CardContent>
                </Card>
            ) : null}
        </AdminLayout>
    );
}
