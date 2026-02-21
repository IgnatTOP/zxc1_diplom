import { apiDelete, apiPatch, apiPost } from '@/shared/api/http';
import { formatDate } from '@/shared/lib/utils';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    Bot,
    CheckCircle2,
    Link2,
    Plus,
    Send,
    Settings,
    Trash2,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type TelegramSettings = {
    botToken: string;
    botTokenSource: 'db' | 'env' | 'none' | string;
};

type AdminItem = {
    id: number;
    name?: string | null;
    email: string;
    role?: string;
};

type LinkItem = {
    id: number;
    user_id: number;
    telegram_user_id: number;
    telegram_username?: string | null;
    is_active: boolean;
    linked_at?: string | null;
    user?: AdminItem;
};

type Props = {
    settings: TelegramSettings;
    links?: LinkItem[] | null;
    admins?: AdminItem[] | null;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function normalizeLink(item: LinkItem): LinkItem {
    return {
        ...item,
        telegram_username: item.telegram_username || '',
    };
}

export default function Telegram({ settings, links, admins }: Props) {
    const safeLinks = Array.isArray(links) ? links : [];
    const safeAdmins = Array.isArray(admins) ? admins : [];

    const [config, setConfig] = useState<TelegramSettings>(settings);
    const [linkList, setLinkList] = useState<LinkItem[]>(() =>
        safeLinks.map(normalizeLink),
    );
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const [linkForm, setLinkForm] = useState({
        userId: safeAdmins[0]?.id ?? 0,
        telegramUserId: '',
        telegramUsername: '',
        isActive: true,
    });

    const activeLinkCount = useMemo(
        () => linkList.filter((item) => item.is_active).length,
        [linkList],
    );

    const saveSettings = async () => {
        setNotice(null);
        setSavingKey('settings');

        try {
            const payload = await apiPatch<{
                ok: boolean;
                settings: TelegramSettings;
            }>('/api/v1/admin/settings/telegram', {
                botToken: config.botToken,
            });

            setConfig(payload.settings);
            setNotice({ tone: 'success', text: 'Настройки Telegram сохранены.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };



    const createLink = async (event: FormEvent) => {
        event.preventDefault();
        setNotice(null);

        if (!linkForm.userId) {
            setNotice({
                tone: 'error',
                text: 'Выберите администратора для привязки.',
            });
            return;
        }

        if (!linkForm.telegramUserId.trim()) {
            setNotice({
                tone: 'error',
                text: 'Укажите Telegram User ID.',
            });
            return;
        }

        setSavingKey('create-link');

        try {
            const payload = await apiPost<{ ok: boolean; item: LinkItem }>(
                '/api/v1/admin/telegram/links',
                {
                    userId: linkForm.userId,
                    telegramUserId: Number(linkForm.telegramUserId),
                    telegramUsername: linkForm.telegramUsername || null,
                    isActive: linkForm.isActive,
                },
            );

            setLinkList((prev) => [...prev, normalizeLink(payload.item)]);
            setLinkForm((prev) => ({
                ...prev,
                telegramUserId: '',
                telegramUsername: '',
                isActive: true,
            }));
            setNotice({ tone: 'success', text: 'Привязка администратора добавлена.' });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };

    const saveLink = async (item: LinkItem) => {
        setNotice(null);
        setSavingKey(`link-${item.id}`);

        try {
            const payload = await apiPatch<{ ok: boolean; item: LinkItem }>(
                `/api/v1/admin/telegram/links/${item.id}`,
                {
                    userId: item.user_id,
                    telegramUserId: item.telegram_user_id,
                    telegramUsername: item.telegram_username || null,
                    isActive: item.is_active,
                },
            );

            setLinkList((prev) =>
                prev.map((row) =>
                    row.id === item.id ? normalizeLink(payload.item) : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Привязка #${item.id} обновлена.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };

    const deleteLink = async (id: number) => {
        setNotice(null);
        setSavingKey(`link-${id}`);

        try {
            await apiDelete<{ ok: boolean }>(`/api/v1/admin/telegram/links/${id}`);
            setLinkList((prev) => prev.filter((item) => item.id !== id));
            setNotice({ tone: 'success', text: `Привязка #${id} удалена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <AdminLayout title="Telegram">
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
                <CardContent className="flex flex-wrap items-center gap-4 pt-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Send className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <p className="font-medium text-foreground">Telegram интеграция</p>
                            <p>
                                Привязок: {linkList.length} · Активных: {activeLinkCount}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Settings className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <CardTitle>Настройки бота</CardTitle>
                            <div className="text-sm text-muted-foreground">
                                Токен:{' '}
                                <Badge variant="muted" className="ml-1">
                                    {config.botTokenSource}
                                </Badge>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">
                                Токен бота
                            </label>
                            <Input
                                type="password"
                                placeholder="123456:ABC-DEF..."
                                value={config.botToken}
                                onChange={(event) =>
                                    setConfig((prev) => ({
                                        ...prev,
                                        botToken: event.target.value,
                                    }))
                                }
                            />
                        </div>

                        <div className="md:col-span-2 flex flex-wrap gap-2">
                            <Button
                                type="button"
                                disabled={savingKey === 'settings'}
                                onClick={saveSettings}
                            >
                                Сохранить настройки
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Link2 className="h-5 w-5 text-brand" />
                        </div>
                        <div>
                            <CardTitle>Привязки администраторов</CardTitle>
                            <p className="text-sm text-muted-foreground">
                                Каждому администратору можно назначить Telegram ID для уведомлений и работы с ботом.
                            </p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-5" onSubmit={createLink}>
                        <div className="space-y-1.5 xl:col-span-2">
                            <label className="text-xs font-medium text-muted-foreground">Администратор</label>
                            <AdminSelect
                                value={linkForm.userId}
                                onChange={(event) =>
                                    setLinkForm((prev) => ({
                                        ...prev,
                                        userId: Number(event.target.value),
                                    }))
                                }
                                disabled={safeAdmins.length === 0}
                            >
                                {safeAdmins.length === 0 ? (
                                    <option value={0}>Нет администраторов</option>
                                ) : null}
                                {safeAdmins.map((admin) => (
                                    <option key={admin.id} value={admin.id}>
                                        {admin.name || admin.email}
                                    </option>
                                ))}
                            </AdminSelect>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Telegram User ID *</label>
                            <Input
                                type="number"
                                placeholder="123456789"
                                min={1}
                                value={linkForm.telegramUserId}
                                onChange={(event) =>
                                    setLinkForm((prev) => ({
                                        ...prev,
                                        telegramUserId: event.target.value,
                                    }))
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Username</label>
                            <Input
                                placeholder="admin_username"
                                value={linkForm.telegramUsername}
                                onChange={(event) =>
                                    setLinkForm((prev) => ({
                                        ...prev,
                                        telegramUsername: event.target.value,
                                    }))
                                }
                            />
                        </div>
                        <div className="flex items-end gap-2">
                            <label className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-3 text-sm">
                                <input
                                    type="checkbox"
                                    className="accent-brand"
                                    checked={linkForm.isActive}
                                    onChange={(event) =>
                                        setLinkForm((prev) => ({
                                            ...prev,
                                            isActive: event.target.checked,
                                        }))
                                    }
                                />
                                Активна
                            </label>
                            <Button
                                type="submit"
                                disabled={savingKey === 'create-link' || safeAdmins.length === 0}
                            >
                                <Plus className="mr-1 h-4 w-4" />
                                Добавить
                            </Button>
                        </div>
                    </form>

                    <div className="grid gap-3 md:grid-cols-2">
                        {linkList.map((item) => (
                            <div
                                key={item.id}
                                className="space-y-3 rounded-xl border border-border bg-surface/40 p-4"
                            >
                                <div className="flex items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Привязка #{item.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.user?.name || item.user?.email || 'Администратор не выбран'}
                                        </p>
                                    </div>
                                    <Badge
                                        variant={item.is_active ? 'success' : 'muted'}
                                    >
                                        {item.is_active ? 'Активна' : 'Отключена'}
                                    </Badge>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Администратор</label>
                                    <AdminSelect
                                        value={item.user_id}
                                        onChange={(event) =>
                                            setLinkList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            user_id: Number(event.target.value),
                                                            user: safeAdmins.find(
                                                                (admin) =>
                                                                    admin.id === Number(event.target.value),
                                                            ),
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        {safeAdmins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name || admin.email}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Telegram User ID</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={item.telegram_user_id}
                                        onChange={(event) =>
                                            setLinkList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            telegram_user_id:
                                                                Number(event.target.value) || 0,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Username</label>
                                    <Input
                                        value={item.telegram_username || ''}
                                        onChange={(event) =>
                                            setLinkList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                            ...row,
                                                            telegram_username: event.target.value,
                                                        }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>

                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <label className="inline-flex items-center gap-2 text-sm text-foreground">
                                        <input
                                            type="checkbox"
                                            className="accent-brand"
                                            checked={item.is_active}
                                            onChange={(event) =>
                                                setLinkList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                is_active: event.target.checked,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        Активна
                                    </label>
                                    <span>Связана: {formatDate(item.linked_at)}</span>
                                </div>

                                <div className="flex gap-2 border-t border-border/50 pt-3">
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingKey === `link-${item.id}`}
                                        onClick={() => saveLink(item)}
                                    >
                                        Сохранить
                                    </Button>
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="destructive"
                                        disabled={savingKey === `link-${item.id}`}
                                        onClick={() => deleteLink(item.id)}
                                    >
                                        <Trash2 className="mr-1 h-3.5 w-3.5" />
                                        Удалить
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {linkList.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground md:col-span-2">
                                Привязки пока не созданы.
                            </p>
                        ) : null}
                    </div>
                </CardContent>
            </Card>

            {safeAdmins.length === 0 ? (
                <Card>
                    <CardContent className="flex items-center gap-3 py-5 text-sm text-amber-700 dark:text-amber-300">
                        <Bot className="h-4 w-4" />
                        Создайте пользователя с ролью `admin`, чтобы добавлять Telegram привязки.
                    </CardContent>
                </Card>
            ) : null}
        </AdminLayout>
    );
}
