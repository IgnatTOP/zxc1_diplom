import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { Textarea } from '@/shared/ui/textarea';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    CheckCircle2,
    FileText,
    Plus,
    Trash2,
    Users,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type TeamMember = {
    id: number;
    name: string;
    experience: string;
    photo?: string | null;
    sort_order?: number;
    is_active?: boolean;
};

type ContentItem = {
    id: number;
    page?: string;
    section: string;
    key_name: string;
    value?: string | null;
    type?: string;
};

type Props = {
    team: TeamMember[];
    content: ContentItem[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function About({ team = [], content = [] }: Props) {
    const [teamList, setTeamList] = useState<TeamMember[]>(team);
    const [contentList, setContentList] = useState<ContentItem[]>(content);
    const [savingTeamId, setSavingTeamId] = useState<number | null>(null);
    const [savingContentId, setSavingContentId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const [teamForm, setTeamForm] = useState({
        name: '',
        experience: '',
        photo: '',
        sortOrder: team.length + 1,
        isActive: true,
    });
    const [contentForm, setContentForm] = useState({
        section: 'main',
        keyName: '',
        value: '',
        type: 'text',
    });

    const activeTeamCount = useMemo(
        () => teamList.filter((item) => item.is_active !== false).length,
        [teamList],
    );

    const createTeamMember = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const payload = await apiPost<{ ok: boolean; item: TeamMember }>(
                '/api/v1/admin/about/team-members',
                {
                    name: teamForm.name,
                    experience: teamForm.experience,
                    photo: teamForm.photo || null,
                    sortOrder: teamForm.sortOrder,
                    isActive: teamForm.isActive,
                },
            );

            setTeamList((prev) => [...prev, payload.item]);
            setTeamForm({
                name: '',
                experience: '',
                photo: '',
                sortOrder: teamList.length + 2,
                isActive: true,
            });
            setNotice({ tone: 'success', text: 'Участник команды добавлен.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const saveTeamMember = async (item: TeamMember) => {
        setNotice(null);
        setSavingTeamId(item.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: TeamMember }>(
                `/api/v1/admin/about/team-members/${item.id}`,
                {
                    name: item.name,
                    experience: item.experience,
                    photo: item.photo || null,
                    sortOrder: item.sort_order ?? 0,
                    isActive: item.is_active ?? true,
                },
            );

            setTeamList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Участник #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingTeamId(null);
        }
    };

    const deleteTeamMember = async (id: number) => {
        setNotice(null);
        setSavingTeamId(id);

        try {
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/about/team-members/${id}`,
            );
            setTeamList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Участник #${id} удалён.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingTeamId(null);
        }
    };

    const createContentItem = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        try {
            const payload = await apiPost<{ ok: boolean; item: ContentItem }>(
                '/api/v1/admin/about/content',
                {
                    section: contentForm.section || 'main',
                    keyName: contentForm.keyName,
                    value: contentForm.value || null,
                    type: contentForm.type || 'text',
                },
            );

            setContentList((prev) => [...prev, payload.item]);
            setContentForm({
                section: 'main',
                keyName: '',
                value: '',
                type: 'text',
            });
            setNotice({ tone: 'success', text: 'Контент-блок добавлен.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        }
    };

    const saveContentItem = async (item: ContentItem) => {
        setNotice(null);
        setSavingContentId(item.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: ContentItem }>(
                `/api/v1/admin/about/content/${item.id}`,
                {
                    section: item.section || 'main',
                    keyName: item.key_name,
                    value: item.value || null,
                    type: item.type || 'text',
                },
            );

            setContentList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Контент #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingContentId(null);
        }
    };

    const deleteContentItem = async (id: number) => {
        setNotice(null);
        setSavingContentId(id);

        try {
            await apiDelete<{ ok: boolean }>(
                `/api/v1/admin/about/content/${id}`,
            );
            setContentList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Контент #${id} удалён.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingContentId(null);
        }
    };

    return (
        <AdminLayout title="О нас">
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
                <CardContent className="flex flex-wrap items-center gap-6 pt-6">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Users className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Команда</p>
                            <p className="text-xs text-muted-foreground">
                                Всего: {teamList.length} · Активных: {activeTeamCount}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/30">
                            <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-sm font-medium">Контент-блоки</p>
                            <p className="text-xs text-muted-foreground">
                                Всего: {contentList.length}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                <Users className="h-5 w-5 text-brand" />
                            </div>
                            <CardTitle>Команда</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="grid gap-4"
                            onSubmit={createTeamMember}
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Имя *</label>
                                <Input
                                    placeholder="Имя"
                                    value={teamForm.name}
                                    onChange={(event) =>
                                        setTeamForm((prev) => ({
                                            ...prev,
                                            name: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Опыт и описание *</label>
                                <Textarea
                                    rows={3}
                                    placeholder="Опыт и описание"
                                    value={teamForm.experience}
                                    onChange={(event) =>
                                        setTeamForm((prev) => ({
                                            ...prev,
                                            experience: event.target.value,
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Фото</label>
                                <Input
                                    placeholder="Фото (путь/URL)"
                                    value={teamForm.photo}
                                    onChange={(event) =>
                                        setTeamForm((prev) => ({
                                            ...prev,
                                            photo: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-medium text-muted-foreground">Сортировка</label>
                                    <Input
                                        type="number"
                                        placeholder="Порядок сортировки"
                                        value={teamForm.sortOrder}
                                        onChange={(event) =>
                                            setTeamForm((prev) => ({
                                                ...prev,
                                                sortOrder: Number(
                                                    event.target.value,
                                                ),
                                            }))
                                        }
                                    />
                                </div>
                                <label className="inline-flex h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="accent-brand"
                                        checked={teamForm.isActive}
                                        onChange={(event) =>
                                            setTeamForm((prev) => ({
                                                ...prev,
                                                isActive: event.target.checked,
                                            }))
                                        }
                                    />
                                    Активен
                                </label>
                            </div>
                            <Button type="submit">
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить участника
                            </Button>
                        </form>

                        <div className="space-y-3">
                            {teamList.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-xl border border-border p-3 transition-shadow hover:shadow-sm"
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-semibold">
                                            Участник #{item.id}
                                        </p>
                                        <Badge
                                            variant={
                                                item.is_active === false
                                                    ? 'muted'
                                                    : 'success'
                                            }
                                        >
                                            {item.is_active === false
                                                ? 'Скрыт'
                                                : 'Активен'}
                                        </Badge>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Имя</label>
                                        <Input
                                            value={item.name}
                                            onChange={(event) =>
                                                setTeamList((prev) =>
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
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Опыт</label>
                                        <Textarea
                                            rows={3}
                                            value={item.experience}
                                            onChange={(event) =>
                                                setTeamList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                experience:
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
                                        <label className="text-xs text-muted-foreground">Фото</label>
                                        <Input
                                            value={item.photo || ''}
                                            placeholder="Фото (путь/URL)"
                                            onChange={(event) =>
                                                setTeamList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                photo: event
                                                                    .target.value,
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
                                                    setTeamList((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? {
                                                                    ...row,
                                                                    sort_order:
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
                                        </div>
                                        <label className="inline-flex h-11 items-center gap-2 self-end rounded-xl border border-border px-3 text-sm">
                                            <input
                                                type="checkbox"
                                                className="accent-brand"
                                                checked={
                                                    item.is_active !== false
                                                }
                                                onChange={(event) =>
                                                    setTeamList((prev) =>
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
                                            Активен
                                        </label>
                                    </div>
                                    <div className="flex gap-2 border-t border-border/50 pt-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={savingTeamId === item.id}
                                            onClick={() => saveTeamMember(item)}
                                        >
                                            Сохранить
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={savingTeamId === item.id}
                                            onClick={() =>
                                                deleteTeamMember(item.id)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/30">
                                <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <CardTitle>Контент страницы «О нас»</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form
                            className="grid gap-4"
                            onSubmit={createContentItem}
                        >
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Секция *</label>
                                <Input
                                    placeholder="Секция (например, main)"
                                    value={contentForm.section}
                                    onChange={(event) =>
                                        setContentForm((prev) => ({
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
                                    placeholder="Ключ (например, main_text)"
                                    value={contentForm.keyName}
                                    onChange={(event) =>
                                        setContentForm((prev) => ({
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
                                    placeholder="Тип (text, html...)"
                                    value={contentForm.type}
                                    onChange={(event) =>
                                        setContentForm((prev) => ({
                                            ...prev,
                                            type: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-xs font-medium text-muted-foreground">Значение</label>
                                <Textarea
                                    rows={5}
                                    placeholder="Значение"
                                    value={contentForm.value}
                                    onChange={(event) =>
                                        setContentForm((prev) => ({
                                            ...prev,
                                            value: event.target.value,
                                        }))
                                    }
                                />
                            </div>
                            <Button type="submit">
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить контент-блок
                            </Button>
                        </form>

                        <div className="space-y-3">
                            {contentList.map((item) => (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-xl border border-border p-3 transition-shadow hover:shadow-sm"
                                >
                                    <p className="text-sm font-semibold">
                                        Блок #{item.id}
                                    </p>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Секция</label>
                                        <Input
                                            value={item.section || 'main'}
                                            placeholder="Секция"
                                            onChange={(event) =>
                                                setContentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
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
                                            value={item.key_name}
                                            placeholder="Ключ"
                                            onChange={(event) =>
                                                setContentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
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
                                            value={item.type || 'text'}
                                            placeholder="Тип"
                                            onChange={(event) =>
                                                setContentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
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
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Значение</label>
                                        <Textarea
                                            rows={5}
                                            value={item.value || ''}
                                            placeholder="Значение"
                                            onChange={(event) =>
                                                setContentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                value: event
                                                                    .target.value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="flex gap-2 border-t border-border/50 pt-3">
                                        <Button
                                            type="button"
                                            size="sm"
                                            disabled={
                                                savingContentId === item.id
                                            }
                                            onClick={() =>
                                                saveContentItem(item)
                                            }
                                        >
                                            Сохранить
                                        </Button>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="destructive"
                                            disabled={
                                                savingContentId === item.id
                                            }
                                            onClick={() =>
                                                deleteContentItem(item.id)
                                            }
                                        >
                                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                                            Удалить
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
