import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { formatShortDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { FormEvent, useMemo, useState } from 'react';

type BlogPostItem = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    content: string;
    featured_image?: string | null;
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

export default function Blog({ posts, pageSettings }: Props) {
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
        featuredImage: '',
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
            const payload = await apiPost<{ ok: boolean; item: BlogPostItem }>(
                '/api/v1/admin/blog-posts',
                {
                    title: form.title,
                    slug: form.slug || null,
                    excerpt: form.excerpt || null,
                    content: form.content,
                    featuredImage: form.featuredImage || null,
                    author: form.author || null,
                    publishedDate: toIsoDateTime(form.publishedDate),
                    isPublished: form.isPublished,
                    sortOrder: form.sortOrder,
                },
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
            const payload = await apiPatch<{ ok: boolean; item: BlogPostItem }>(
                `/api/v1/admin/blog-posts/${post.id}`,
                {
                    title: post.title,
                    slug: post.slug || null,
                    excerpt: post.excerpt || null,
                    content: post.content,
                    featuredImage: post.featured_image || null,
                    author: post.author || null,
                    publishedDate: toIsoDateTime(post.published_date || ''),
                    isPublished: post.is_published,
                    sortOrder: post.sort_order ?? 0,
                },
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
            <Card>
                <CardHeader>
                    <CardTitle>Новый пост</CardTitle>
                    <p className="text-sm text-muted-foreground">
                        Постов: {list.length} · Опубликовано:{' '}
                        {list.filter((post) => post.is_published).length} ·
                        Настроек страницы: {settingsList.length}
                    </p>
                </CardHeader>
                <CardContent>
                    <form
                        className="grid gap-3 md:grid-cols-2"
                        onSubmit={createPost}
                    >
                        <Input
                            placeholder="Заголовок"
                            value={form.title}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    title: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="slug (можно оставить пустым)"
                            value={form.slug}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    slug: event.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Обложка (путь/URL)"
                            value={form.featuredImage}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    featuredImage: event.target.value,
                                }))
                            }
                        />
                        <Input
                            placeholder="Автор"
                            value={form.author}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    author: event.target.value,
                                }))
                            }
                        />
                        <Textarea
                            className="md:col-span-2"
                            rows={4}
                            placeholder="Краткое описание"
                            value={form.excerpt}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    excerpt: event.target.value,
                                }))
                            }
                        />
                        <Textarea
                            className="md:col-span-2"
                            rows={12}
                            placeholder="Полный текст"
                            value={form.content}
                            onChange={(event) =>
                                setForm((prev) => ({
                                    ...prev,
                                    content: event.target.value,
                                }))
                            }
                            required
                        />
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
                        <Input
                            type="number"
                            placeholder="Порядок сортировки"
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
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Настройки страницы блога</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form
                        className="grid gap-3 md:grid-cols-2"
                        onSubmit={createSetting}
                    >
                        <Input
                            placeholder="Секция (например, main)"
                            value={settingForm.section}
                            onChange={(event) =>
                                setSettingForm((prev) => ({
                                    ...prev,
                                    section: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="Ключ (например, hero_text)"
                            value={settingForm.keyName}
                            onChange={(event) =>
                                setSettingForm((prev) => ({
                                    ...prev,
                                    keyName: event.target.value,
                                }))
                            }
                            required
                        />
                        <Input
                            placeholder="Тип (text, html...)"
                            value={settingForm.type}
                            onChange={(event) =>
                                setSettingForm((prev) => ({
                                    ...prev,
                                    type: event.target.value,
                                }))
                            }
                        />
                        <Button type="submit" disabled={savingId === -1}>
                            Добавить настройку
                        </Button>
                        <Textarea
                            className="md:col-span-2"
                            rows={4}
                            placeholder="Значение"
                            value={settingForm.value}
                            onChange={(event) =>
                                setSettingForm((prev) => ({
                                    ...prev,
                                    value: event.target.value,
                                }))
                            }
                        />
                    </form>

                    <div className="space-y-3">
                        {settingsList.map((setting) => (
                            <div
                                key={setting.id}
                                className="space-y-2 rounded-xl border border-border p-3"
                            >
                                <p className="text-sm font-semibold">
                                    Настройка #{setting.id}
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
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
                                    <Input
                                        className="md:col-span-2"
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
                                <Textarea
                                    rows={4}
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
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        ))}
                        {settingsList.length === 0 ? (
                            <p className="rounded-lg border border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                Настройки страницы пока отсутствуют.
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <Input
                        className="max-w-xl"
                        value={query}
                        placeholder="Поиск по заголовку, slug, тексту"
                        onChange={(event) => setQuery(event.target.value)}
                    />
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

            <div className="grid gap-3 xl:grid-cols-2">
                {filteredPosts.map((post) => (
                    <Card key={post.id}>
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
                            <Input
                                value={post.featured_image || ''}
                                placeholder="Обложка (путь/URL)"
                                onChange={(event) =>
                                    setList((prev) =>
                                        prev.map((row) =>
                                            row.id === post.id
                                                ? {
                                                      ...row,
                                                      featured_image:
                                                          event.target.value,
                                                  }
                                                : row,
                                        ),
                                    )
                                }
                            />
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
                            <Textarea
                                rows={4}
                                value={post.excerpt || ''}
                                placeholder="Краткое описание"
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
                            <Textarea
                                rows={12}
                                value={post.content}
                                placeholder="Полный текст"
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
                            <div className="grid gap-3 md:grid-cols-2">
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
                            <div className="flex items-center justify-between gap-2">
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <input
                                        type="checkbox"
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
                                    Публикация:{' '}
                                    {formatShortDate(post.published_date)}
                                </span>
                            </div>
                            <div className="flex gap-2">
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
                                    Удалить
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {filteredPosts.length === 0 ? (
                    <Card>
                        <CardContent className="py-10 text-center text-muted-foreground">
                            По заданным параметрам посты не найдены.
                        </CardContent>
                    </Card>
                ) : null}
            </div>
        </AdminLayout>
    );
}
