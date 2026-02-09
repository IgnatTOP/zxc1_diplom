import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { FormEvent, useMemo, useState } from 'react';

type SectionItem = {
    id: number;
    name: string;
    slug: string;
    description?: string | null;
    seo_title?: string | null;
    seo_description?: string | null;
    is_active: boolean;
    sort_order: number;
};

type Props = {
    items: SectionItem[];
};

export default function Sections({ items }: Props) {
    const [list, setList] = useState<SectionItem[]>(items);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [form, setForm] = useState({
        name: '',
        slug: '',
        description: '',
        seoTitle: '',
        seoDescription: '',
        isActive: true,
    });

    const activeCount = useMemo(
        () => list.filter((item) => item.is_active).length,
        [list],
    );

    const create = async (event: FormEvent) => {
        event.preventDefault();
        setMessage(null);

        const payload = await apiPost<{ ok: boolean; item: SectionItem }>(
            '/api/v1/admin/sections',
            {
                name: form.name,
                slug: form.slug,
                description: form.description || null,
                seoTitle: form.seoTitle || null,
                seoDescription: form.seoDescription || null,
                isActive: form.isActive,
                sortOrder: list.length + 1,
            },
        );

        setList((prev) => [...prev, payload.item]);
        setForm({
            name: '',
            slug: '',
            description: '',
            seoTitle: '',
            seoDescription: '',
            isActive: true,
        });
        setMessage('Секция создана.');
    };

    const update = async (section: SectionItem) => {
        setSavingId(section.id);
        setMessage(null);
        const payload = await apiPatch<{ ok: boolean; item: SectionItem }>(
            `/api/v1/admin/sections/${section.id}`,
            {
                name: section.name,
                slug: section.slug,
                description: section.description || null,
                seoTitle: section.seo_title || null,
                seoDescription: section.seo_description || null,
                isActive: section.is_active,
                sortOrder: section.sort_order,
            },
        );

        setList((prev) =>
            prev.map((item) => (item.id === section.id ? payload.item : item)),
        );
        setSavingId(null);
        setMessage(`Секция #${section.id} обновлена.`);
    };

    const remove = async (id: number) => {
        setSavingId(id);
        setMessage(null);
        await apiDelete(`/api/v1/admin/sections/${id}`);
        setList((prev) => prev.filter((item) => item.id !== id));
        setSavingId(null);
        setMessage(`Секция #${id} удалена.`);
    };

    return (
        <AdminLayout title="Секции">
            <Card>
                <CardHeader>
                    <CardTitle>Новая секция</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Всего: {list.length} · Активных: {activeCount}
                    </p>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-3 md:grid-cols-2"
                        onSubmit={create}
                    >
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
                        <Input
                            placeholder="slug (например, hip-hop)"
                            value={form.slug}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    slug: event.target.value,
                                }))
                            }
                            required
                        />
                        <Textarea
                            className="md:col-span-2"
                            placeholder="Описание секции"
                            rows={4}
                            value={form.description}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    description: event.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="SEO title"
                            value={form.seoTitle}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    seoTitle: event.target.value,
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
                        <Textarea
                            className="md:col-span-2"
                            placeholder="SEO description"
                            rows={3}
                            value={form.seoDescription}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    seoDescription: event.target.value,
                                }))
                            }
                        />
                        <div className="md:col-span-2">
                            <Button type="submit">Добавить секцию</Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {message ? (
                <p className="rounded-lg bg-emerald-100 px-3 py-2 text-sm text-emerald-700">
                    {message}
                </p>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {list.map((item) => (
                    <div
                        key={item.id}
                        className="space-y-3 rounded-xl border border-border bg-card p-4"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold">
                                Секция #{item.id}
                            </p>
                            <Badge
                                variant={item.is_active ? 'success' : 'muted'}
                            >
                                {item.is_active ? 'Активна' : 'Скрыта'}
                            </Badge>
                        </div>
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
                        <Textarea
                            rows={3}
                            value={item.description || ''}
                            placeholder="Описание"
                            onChange={(event) =>
                                setList((prev) =>
                                    prev.map((row) =>
                                        row.id === item.id
                                            ? {
                                                  ...row,
                                                  description:
                                                      event.target.value ||
                                                      null,
                                              }
                                            : row,
                                    ),
                                )
                            }
                        />
                        <Input
                            value={item.seo_title || ''}
                            placeholder="SEO title"
                            onChange={(event) =>
                                setList((prev) =>
                                    prev.map((row) =>
                                        row.id === item.id
                                            ? {
                                                  ...row,
                                                  seo_title:
                                                      event.target.value ||
                                                      null,
                                              }
                                            : row,
                                    ),
                                )
                            }
                        />
                        <Textarea
                            rows={3}
                            value={item.seo_description || ''}
                            placeholder="SEO description"
                            onChange={(event) =>
                                setList((prev) =>
                                    prev.map((row) =>
                                        row.id === item.id
                                            ? {
                                                  ...row,
                                                  seo_description:
                                                      event.target.value ||
                                                      null,
                                              }
                                            : row,
                                    ),
                                )
                            }
                        />
                        <div className="flex items-center justify-between text-sm">
                            <label className="inline-flex items-center gap-2">
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
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                    Порядок
                                </span>
                                <Input
                                    className="h-8 w-20"
                                    type="number"
                                    value={item.sort_order}
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                          ...row,
                                                          sort_order: Number(
                                                              event.target
                                                                  .value,
                                                          ),
                                                      }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                className="flex-1"
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
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}
