import { AdminSelect } from '@/shared/ui/admin-select';
import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { formatShortDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    CheckCircle2,
    Newspaper,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type SectionOption = { id: number; name: string };

type SectionNewsItem = {
    id: number;
    section_id?: number;
    title: string;
    slug: string;
    summary?: string | null;
    content: string;
    cover_image?: string | null;
    is_published: boolean;
    published_at?: string | null;
    section?: SectionOption;
};

type EditableSectionNewsItem = {
    id: number;
    section_id: number;
    title: string;
    slug: string;
    summary: string;
    content: string;
    cover_image: string;
    is_published: boolean;
    published_at: string;
    section?: SectionOption;
};

type Props = {
    sections: SectionOption[];
    items: SectionNewsItem[];
};

function toDateTimeLocal(value?: string | null): string {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    const local = new Date(
        parsed.getTime() - parsed.getTimezoneOffset() * 60000,
    );
    return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function normalizeItem(
    item: SectionNewsItem,
    fallbackSectionId: number,
): EditableSectionNewsItem {
    return {
        id: item.id,
        section_id: item.section_id ?? item.section?.id ?? fallbackSectionId,
        title: item.title,
        slug: item.slug,
        summary: item.summary || '',
        content: item.content,
        cover_image: item.cover_image || '',
        is_published: item.is_published ?? false,
        published_at: toDateTimeLocal(item.published_at),
        section: item.section,
    };
}

export default function SectionNews({ sections = [], items = [] }: Props) {
    const defaultSectionId = useMemo(() => sections[0]?.id ?? 0, [sections]);
    const [list, setList] = useState<EditableSectionNewsItem[]>(() =>
        items.map((item) => normalizeItem(item, defaultSectionId)),
    );
    const [isCreating, setIsCreating] = useState(false);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [publishFilter, setPublishFilter] = useState<
        'all' | 'published' | 'draft'
    >('all');
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);
    const [form, setForm] = useState({
        sectionId: defaultSectionId,
        title: '',
        slug: '',
        summary: '',
        content: '',
        coverImage: '',
        isPublished: false,
        publishedAt: '',
    });

    const filteredList = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return list.filter((item) => {
            const publishMatches =
                publishFilter === 'all' ||
                (publishFilter === 'published'
                    ? item.is_published
                    : !item.is_published);
            if (!publishMatches) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return [item.title, item.slug, item.summary, item.content]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery);
        });
    }, [list, publishFilter, query]);

    const create = async (event: FormEvent) => {
        event.preventDefault();
        if (!form.sectionId) {
            setNotice({
                tone: 'error',
                text: 'Сначала создайте хотя бы одну секцию.',
            });
            return;
        }

        setNotice(null);
        setIsCreating(true);

        try {
            const createPayload: Record<string, unknown> = {
                sectionId: form.sectionId,
                title: form.title,
                slug: form.slug,
                summary: form.summary || null,
                content: form.content,
                coverImage: form.coverImage || null,
                isPublished: form.isPublished,
            };
            const publishedAt = toIsoDateTime(form.publishedAt);
            if (publishedAt) {
                createPayload.publishedAt = publishedAt;
            }

            const payload = await apiPost<{
                ok: boolean;
                item: SectionNewsItem;
            }>('/api/v1/admin/section-news', createPayload);

            setList((prev) => [
                normalizeItem(payload.item, defaultSectionId),
                ...prev,
            ]);
            setForm({
                sectionId: defaultSectionId,
                title: '',
                slug: '',
                summary: '',
                content: '',
                coverImage: '',
                isPublished: false,
                publishedAt: '',
            });
            setNotice({ tone: 'success', text: 'Новость создана.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setIsCreating(false);
        }
    };

    const update = async (item: EditableSectionNewsItem) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const updatePayload: Record<string, unknown> = {
                sectionId: item.section_id,
                title: item.title,
                slug: item.slug,
                summary: item.summary || null,
                content: item.content,
                coverImage: item.cover_image || null,
                isPublished: item.is_published,
            };
            const publishedAt = toIsoDateTime(item.published_at);
            if (publishedAt) {
                updatePayload.publishedAt = publishedAt;
            }

            const payload = await apiPatch<{
                ok: boolean;
                item: SectionNewsItem;
            }>(`/api/v1/admin/section-news/${item.id}`, updatePayload);

            setList((prev) =>
                prev.map((row) =>
                    row.id === item.id
                        ? normalizeItem(payload.item, defaultSectionId)
                        : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Новость #${item.id} обновлена.`,
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
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/section-news/${id}`,
            );
            setList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Новость #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Новости секций">
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
                            <Newspaper className="h-5 w-5 text-brand" />
                        </div>
                        <CardTitle>Новая новость секции</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={create}
                    >
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Секция *</label>
                            <AdminSelect
                                value={form.sectionId}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        sectionId: Number(event.target.value),
                                    }))
                                }
                                required
                            >
                                {sections.length === 0 ? (
                                    <option value={0}>Нет секций</option>
                                ) : null}
                                {sections.map((section) => (
                                    <option key={section.id} value={section.id}>
                                        {section.name}
                                    </option>
                                ))}
                            </AdminSelect>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Заголовок *</label>
                            <Input
                                placeholder="Заголовок новости"
                                value={form.title}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        title: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Slug *</label>
                            <Input
                                placeholder="my-news-slug"
                                value={form.slug}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        slug: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Обложка</label>
                            <Input
                                placeholder="Обложка (путь/URL)"
                                value={form.coverImage}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        coverImage: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Краткое описание</label>
                            <Textarea
                                placeholder="Краткое описание новости"
                                rows={3}
                                value={form.summary}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        summary: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Полный текст *</label>
                            <Textarea
                                placeholder="Полный текст новости"
                                rows={8}
                                value={form.content}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        content: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Дата публикации</label>
                            <Input
                                type="datetime-local"
                                value={form.publishedAt}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        publishedAt: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-3">
                            <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="accent-brand"
                                    checked={form.isPublished}
                                    onChange={(event) =>
                                        setForm((prev) => ({
                                            ...prev,
                                            isPublished: event.target.checked,
                                        }))
                                    }
                                />
                                Опубликовать
                            </label>
                            <Button
                                type="submit"
                                disabled={isCreating || sections.length === 0}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Newspaper className="h-5 w-5 text-brand" />
                        </div>
                        <p className="text-sm font-medium">
                            Всего: {list.length} · Опубликовано:{' '}
                            {list.filter((i) => i.is_published).length}
                        </p>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={query}
                                placeholder="Поиск по заголовку, slug, тексту"
                                onChange={(event) =>
                                    setQuery(event.target.value)
                                }
                            />
                        </div>
                        <AdminSelect
                            className="w-full sm:w-52"
                            value={publishFilter}
                            onChange={(event) =>
                                setPublishFilter(
                                    event.target.value as
                                    | 'all'
                                    | 'published'
                                    | 'draft',
                                )
                            }
                        >
                            <option value="all">Все</option>
                            <option value="published">
                                Только опубликованные
                            </option>
                            <option value="draft">Только черновики</option>
                        </AdminSelect>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                {filteredList.map((item) => (
                    <Card
                        key={item.id}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardContent className="space-y-3 pt-6">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-sm font-semibold">
                                    Новость #{item.id}
                                </p>
                                <Badge
                                    variant={
                                        item.is_published ? 'success' : 'muted'
                                    }
                                >
                                    {item.is_published
                                        ? 'Опубликована'
                                        : 'Черновик'}
                                </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Секция</label>
                                    <AdminSelect
                                        value={item.section_id}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            section_id: Number(
                                                                event.target
                                                                    .value,
                                                            ),
                                                            section:
                                                                sections.find(
                                                                    (section) =>
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
                                    </AdminSelect>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Заголовок</label>
                                    <Input
                                        value={item.title}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            title: event.target
                                                                .value,
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
                                                            slug: event.target
                                                                .value,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Обложка</label>
                                    <Input
                                        value={item.cover_image}
                                        placeholder="Обложка (путь/URL)"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            cover_image:
                                                                event.target
                                                                    .value,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Краткое описание</label>
                                <Textarea
                                    rows={3}
                                    value={item.summary}
                                    placeholder="Краткое описание"
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                        ...row,
                                                        summary:
                                                            event.target.value,
                                                    }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs text-muted-foreground">Полный текст</label>
                                <Textarea
                                    rows={8}
                                    value={item.content}
                                    placeholder="Полный текст"
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === item.id
                                                    ? {
                                                        ...row,
                                                        content:
                                                            event.target.value,
                                                    }
                                                    : row,
                                            ),
                                        )
                                    }
                                />
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Дата публикации</label>
                                    <Input
                                        type="datetime-local"
                                        value={item.published_at}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            published_at:
                                                                event.target
                                                                    .value,
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
                                        checked={item.is_published}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            is_published:
                                                                event.target
                                                                    .checked,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    Опубликовано
                                </label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Публикация: {formatShortDate(item.published_at)}
                            </p>
                            <div className="flex gap-2 border-t border-border/50 pt-3">
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
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredList.length === 0 ? (
                    <Card className="xl:col-span-2">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            {list.length === 0
                                ? 'Новостей пока нет.'
                                : 'По фильтру ничего не найдено.'}
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AdminLayout>
    );
}
