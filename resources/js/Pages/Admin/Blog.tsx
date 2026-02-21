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
    BookOpen,
    CheckCircle2,
    PenLine,
    Search,
    Settings,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type BlogPostItem = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featured_image?: string | File | null;
    author?: string | null;
    published_date?: string | null;
    is_published: boolean;
    sort_order?: number;
};

type Props = {
    posts: BlogPostItem[];
    pageSettings: Array<{
        id: number;
        section?: string;
        key_name: string;
        value?: string | null;
        type?: string;
    }>;
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

function normalizePost(post: BlogPostItem): BlogPostItem {
    return {
        ...post,
        excerpt: post.excerpt || '',
        featured_image: post.featured_image || '',
        author: post.author || '',
        sort_order: post.sort_order ?? 0,
        published_date: toDateTimeLocal(post.published_date),
    };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Blog({ posts = [], pageSettings = [] }: Props) {
    const [list, setList] = useState<BlogPostItem[]>(() =>
        posts.map(normalizePost),
    );
    const [settingsList, setSettingsList] = useState(pageSettings);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);
    const [form, setForm] = useState({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        featuredImage: null as File | string | null,
        author: '',
        publishedDate: '',
        isPublished: false,
        sortOrder: list.length + 1,
    });
    const [settingForm, setSettingForm] = useState({
        section: 'main',
        keyName: '',
        value: '',
        type: 'text',
    });

    const filteredPosts = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return list;
        }

        return list.filter((post) =>
            [post.title, post.slug, post.excerpt, post.content]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [list, query]);

    const createPost = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);
        setIsCreating(true);

        try {
            const formData = new FormData();
            formData.append('title', form.title);
            if (form.slug) formData.append('slug', form.slug);
            if (form.excerpt) formData.append('excerpt', form.excerpt);
            formData.append('content', form.content);
            if (form.featuredImage instanceof File) {
                formData.append('featuredImage', form.featuredImage);
            }
            if (form.author) formData.append('author', form.author);
            if (form.publishedDate) formData.append('publishedDate', toIsoDateTime(form.publishedDate) || '');
            formData.append('isPublished', form.isPublished ? '1' : '0');
            formData.append('sortOrder', String(form.sortOrder));

            const payload = await apiPost<{ ok: boolean; item: BlogPostItem }>(
                '/api/v1/admin/blog-posts',
                formData,
            );

            setList((prev) => [normalizePost(payload.item), ...prev]);
            setForm({
                title: '',
                slug: '',
                excerpt: '',
                content: '',
                featuredImage: '',
                author: '',
                publishedDate: '',
                isPublished: false,
                sortOrder: list.length + 2,
            });
            setNotice({ tone: 'success', text: 'Пост блога создан.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setIsCreating(false);
        }
    };

    const savePost = async (post: BlogPostItem) => {
        setNotice(null);
        setSavingId(post.id);

        try {
            const formData = new FormData();
            formData.append('title', post.title);
            if (post.slug) formData.append('slug', post.slug);
            if (post.excerpt) formData.append('excerpt', post.excerpt);
            formData.append('content', post.content);

            if (post.featured_image instanceof File) {
                formData.append('featuredImage', post.featured_image);
            } else if (typeof post.featured_image === 'string') {
                formData.append('featuredImage', post.featured_image);
            }

            if (post.author) formData.append('author', post.author);
            if (post.published_date) formData.append('publishedDate', toIsoDateTime(post.published_date) || '');
            formData.append('isPublished', post.is_published ? '1' : '0');
            formData.append('sortOrder', String(post.sort_order ?? 0));

            const payload = await apiPatch<{ ok: boolean; item: BlogPostItem }>(
                `/api/v1/admin/blog-posts/${post.id}`,
                formData,
            );

            setList((prev) =>
                prev.map((item) =>
                    item.id === post.id ? normalizePost(payload.item) : item,
                ),
            );
            setNotice({ tone: 'success', text: `Пост #${post.id} обновлён.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const deletePost = async (id: number) => {
        setNotice(null);
        setSavingId(id);

        try {
            await apiDelete<{ ok: boolean }>(`/api/v1/admin/blog-posts/${id}`);
            setList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Пост #${id} удалён.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const createSetting = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);
        setSavingId(-1);

        try {
            const payload = await apiPost<{
                ok: boolean;
                item: Props['pageSettings'][number];
            }>('/api/v1/admin/blog/settings', {
                section: settingForm.section || 'main',
                keyName: settingForm.keyName,
                value: settingForm.value || null,
                type: settingForm.type || 'text',
            });

            setSettingsList((prev) => [...prev, payload.item]);
            setSettingForm({
                section: 'main',
                keyName: '',
                value: '',
                type: 'text',
            });
            setNotice({ tone: 'success', text: 'Настройка блога добавлена.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const saveSetting = async (item: Props['pageSettings'][number]) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const payload = await apiPatch<{
                ok: boolean;
                item: Props['pageSettings'][number];
            }>(`/api/v1/admin/blog/settings/${item.id}`, {
                section: item.section || 'main',
                keyName: item.key_name,
                value: item.value || null,
                type: item.type || 'text',
            });

            setSettingsList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Настройка #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const deleteSetting = async (id: number) => {
        setNotice(null);
        setSavingId(id);

        try {
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/blog/settings/${id}`,
            );
            setSettingsList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Настройка #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Блог">
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
                            <PenLine className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <CardTitle>Новый пост</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Постов: {list.length} · Опубликовано:{' '}
                                {list.filter((post) => post.is_published).length} ·
                                Настроек: {settingsList.length}
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={createPost}
                    >
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Заголовок *</label>
                            <Input
                                placeholder="Заголовок поста"
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
                            <label className="text-xs font-medium text-muted-foreground">Slug</label>
                            <Input
                                placeholder="auto-generated-slug"
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
                            <label className="text-xs font-medium text-muted-foreground">Обложка</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(event) => {
                                    const file = event.target.files?.[0] || null;
                                    setForm((prev) => ({
                                        ...prev,
                                        featuredImage: file,
                                    }));
                                }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Автор</label>
                            <Input
                                placeholder="Имя автора"
                                value={form.author}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        author: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Краткое описание</label>
                            <Textarea
                                rows={3}
                                placeholder="Аннотация к посту"
                                value={form.excerpt}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        excerpt: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Полный текст *</label>
                            <Textarea
                                rows={10}
                                placeholder="Содержание поста"
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
                                value={form.publishedDate}
                                onChange={(event) =>
                                    setForm((prev) => ({
                                        ...prev,
                                        publishedDate: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Сортировка</label>
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
                        </div>
                        <div className="flex items-end gap-3 md:col-span-2">
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
                            <Button type="submit" disabled={isCreating}>
                                Добавить пост
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Settings className="h-5 w-5 text-brand" />
                        </div>
                        <CardTitle>Настройки страницы блога</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form
                        className="grid gap-4 md:grid-cols-2"
                        onSubmit={createSetting}
                    >
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Секция *</label>
                            <Input
                                placeholder="main"
                                value={settingForm.section}
                                onChange={(event) =>
                                    setSettingForm((prev) => ({
                                        ...prev,
                                        section: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Ключ *</label>
                            <Input
                                placeholder="hero_text"
                                value={settingForm.keyName}
                                onChange={(event) =>
                                    setSettingForm((prev) => ({
                                        ...prev,
                                        keyName: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Тип</label>
                            <Input
                                placeholder="text, html..."
                                value={settingForm.type}
                                onChange={(event) =>
                                    setSettingForm((prev) => ({
                                        ...prev,
                                        type: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" disabled={savingId === -1}>
                                Добавить настройку
                            </Button>
                        </div>
                        <div className="space-y-1.5 md:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Значение</label>
                            <Textarea
                                rows={3}
                                placeholder="Значение настройки"
                                value={settingForm.value}
                                onChange={(event) =>
                                    setSettingForm((prev) => ({
                                        ...prev,
                                        value: event.target.value,
                                    }))
                                }
                            />
                        </div>
                    </form>

                    <div className="space-y-3">
                        {settingsList.map((setting) => (
                            <div
                                key={setting.id}
                                className="space-y-3 rounded-xl border border-border bg-surface/40 p-4"
                            >
                                <p className="text-sm font-semibold">
                                    Настройка #{setting.id}
                                </p>
                                <div className="grid gap-3 md:grid-cols-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Секция</label>
                                        <Input
                                            value={setting.section || 'main'}
                                            onChange={(event) =>
                                                setSettingsList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === setting.id
                                                            ? {
                                                                ...row,
                                                                section:
                                                                    event.target
                                                                        .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Ключ</label>
                                        <Input
                                            value={setting.key_name}
                                            onChange={(event) =>
                                                setSettingsList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === setting.id
                                                            ? {
                                                                ...row,
                                                                key_name:
                                                                    event.target
                                                                        .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Тип</label>
                                        <Input
                                            value={setting.type || 'text'}
                                            onChange={(event) =>
                                                setSettingsList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === setting.id
                                                            ? {
                                                                ...row,
                                                                type: event.target
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
                                    <label className="text-xs text-muted-foreground">Значение</label>
                                    <Textarea
                                        rows={3}
                                        value={setting.value || ''}
                                        onChange={(event) =>
                                            setSettingsList((prev) =>
                                                prev.map((row) =>
                                                    row.id === setting.id
                                                        ? {
                                                            ...row,
                                                            value: event.target
                                                                .value,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingId === setting.id}
                                        onClick={() => saveSetting(setting)}
                                    >
                                        Сохранить
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        disabled={savingId === setting.id}
                                        onClick={() =>
                                            deleteSetting(setting.id)
                                        }
                                    >
                                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {settingsList.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                Настройки страницы пока отсутствуют.
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <BookOpen className="h-5 w-5 text-brand" />
                        </div>
                        <p className="text-sm font-medium">
                            Посты · {filteredPosts.length} из {list.length}
                        </p>
                    </div>
                    <div className="relative max-w-xl flex-1">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            value={query}
                            placeholder="Поиск по заголовку, slug, тексту..."
                            onChange={(event) => setQuery(event.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 xl:grid-cols-2">
                {filteredPosts.map((post) => (
                    <Card key={post.id} className="transition-shadow hover:shadow-md">
                        <CardContent className="space-y-3 pt-6">
                            <div className="flex items-center justify-between gap-2">
                                <p className="text-sm font-semibold">
                                    Пост #{post.id}
                                </p>
                                <Badge
                                    variant={
                                        post.is_published ? 'success' : 'muted'
                                    }
                                >
                                    {post.is_published
                                        ? 'Опубликован'
                                        : 'Черновик'}
                                </Badge>
                            </div>
                            <div className="grid gap-3 md:grid-cols-2">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Заголовок</label>
                                    <Input
                                        value={post.title}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
                                                        ? {
                                                            ...row,
                                                            title: event.target.value,
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
                                        value={post.slug}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
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
                                    <label className="text-xs text-muted-foreground">Обложка</label>
                                    <Input
                                        type="file"
                                        accept="image/*"
                                        onChange={(event) => {
                                            const file = event.target.files?.[0] || null;
                                            if (file) {
                                                setList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === post.id
                                                            ? {
                                                                ...row,
                                                                featured_image: file,
                                                            }
                                                            : row,
                                                    ),
                                                );
                                            }
                                        }}
                                    />
                                    {typeof post.featured_image === 'string' && post.featured_image && (
                                        <p className="text-xs text-muted-foreground truncate">Текущее: {post.featured_image}</p>
                                    )}
                                    {post.featured_image instanceof File && (
                                        <p className="text-xs text-muted-foreground truncate">Новое: {post.featured_image.name}</p>
                                    )}
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Автор</label>
                                    <Input
                                        value={post.author || ''}
                                        placeholder="Автор"
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
                                                        ? {
                                                            ...row,
                                                            author: event.target
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
                                    value={post.excerpt || ''}
                                    placeholder="Аннотация"
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === post.id
                                                    ? {
                                                        ...row,
                                                        excerpt:
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
                                    rows={10}
                                    value={post.content}
                                    placeholder="Содержание"
                                    onChange={(event) =>
                                        setList((prev) =>
                                            prev.map((row) =>
                                                row.id === post.id
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
                                        value={post.published_date || ''}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
                                                        ? {
                                                            ...row,
                                                            published_date:
                                                                event.target
                                                                    .value,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Сортировка</label>
                                    <Input
                                        type="number"
                                        value={post.sort_order ?? 0}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
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
                            <div className="flex items-center justify-between gap-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-brand"
                                        checked={post.is_published}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === post.id
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
                                    Опубликован
                                </label>
                                <span className="text-xs text-muted-foreground">
                                    {formatShortDate(post.published_date)}
                                </span>
                            </div>
                            <div className="flex gap-2 border-t border-border/50 pt-3">
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={savingId === post.id}
                                    onClick={() => savePost(post)}
                                >
                                    Сохранить
                                </Button>
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="destructive"
                                    disabled={savingId === post.id}
                                    onClick={() => deletePost(post.id)}
                                >
                                    <Trash2 className="mr-1 h-3.5 w-3.5" />
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredPosts.length === 0 ? (
                    <Card className="xl:col-span-2">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            По заданным параметрам посты не найдены.
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AdminLayout>
    );
}
