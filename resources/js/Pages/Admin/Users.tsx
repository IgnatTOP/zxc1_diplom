import { apiPatch } from '@/shared/api/http';
import { getRoleLabel } from '@/shared/lib/admin-labels';
import { formatDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { useMemo, useState } from 'react';

type UserItem = {
    id: number;
    name?: string | null;
    email: string;
    role: string;
    created_at?: string | null;
};

type Props = {
    items: UserItem[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Users({ items }: Props) {
    const [list, setList] = useState<UserItem[]>(items);
    const [savingId, setSavingId] = useState<number | null>(null);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const filteredItems = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return list;
        }

        return list.filter((item) =>
            [item.name, item.email, item.role]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [list, query]);

    const adminCount = list.filter((item) => item.role === 'admin').length;

    const saveUser = async (item: UserItem) => {
        setNotice(null);
        setSavingId(item.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: UserItem }>(
                `/api/v1/admin/users/${item.id}`,
                {
                    name: item.name || null,
                    email: item.email,
                    role: item.role,
                },
            );

            setList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({
                tone: 'success',
                text: `Пользователь #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Пользователи">
            <div className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-sm text-muted-foreground">
                        Всего пользователей: {list.length} · Администраторов:{' '}
                        {adminCount}
                    </div>
                    <Input
                        className="max-w-md"
                        value={query}
                        placeholder="Поиск по имени, email и роли"
                        onChange={(event) => setQuery(event.target.value)}
                    />
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
                <table className="min-w-[900px] text-left text-sm">
                    <thead className="bg-surface/70 text-xs uppercase text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3">ID</th>
                            <th className="px-4 py-3">Имя</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Роль</th>
                            <th className="px-4 py-3">Дата регистрации</th>
                            <th className="px-4 py-3">Действия</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredItems.map((item) => (
                            <tr
                                key={item.id}
                                className="border-t border-border/60 align-top"
                            >
                                <td className="px-4 py-3">#{item.id}</td>
                                <td className="px-4 py-3">
                                    <Input
                                        value={item.name || ''}
                                        placeholder="Имя"
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
                                </td>
                                <td className="px-4 py-3">
                                    <Input
                                        value={item.email}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              email: event
                                                                  .target.value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </td>
                                <td className="space-y-2 px-4 py-3">
                                    <Badge
                                        variant={
                                            item.role === 'admin'
                                                ? 'default'
                                                : 'muted'
                                        }
                                    >
                                        {getRoleLabel(item.role)}
                                    </Badge>
                                    <select
                                        className="h-10 w-full rounded-lg border border-border px-2"
                                        value={item.role}
                                        onChange={(event) =>
                                            setList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              role: event.target
                                                                  .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        <option value="user">
                                            Пользователь
                                        </option>
                                        <option value="admin">
                                            Администратор
                                        </option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    {formatDate(item.created_at)}
                                </td>
                                <td className="px-4 py-3">
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingId === item.id}
                                        onClick={() => saveUser(item)}
                                    >
                                        Сохранить
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {filteredItems.length === 0 ? (
                            <tr>
                                <td
                                    className="px-4 py-8 text-center text-muted-foreground"
                                    colSpan={6}
                                >
                                    По заданному запросу пользователей не
                                    найдено.
                                </td>
                            </tr>
                        ) : null}
                    </tbody>
                </table>
            </div>
        </AdminLayout>
    );
}
