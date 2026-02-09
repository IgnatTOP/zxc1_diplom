import { AdminReplyForm } from '@/features/support/ui/AdminReplyForm';
import { apiPatch } from '@/shared/api/http';
import {
    getMessageSourceLabel,
    getSenderTypeLabel,
    getSupportStatusMeta,
} from '@/shared/lib/admin-labels';
import { formatDate, formatShortDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { useEffect, useMemo, useState } from 'react';

type Message = {
    id: number;
    sender_type: 'guest' | 'user' | 'admin';
    source: 'web' | 'admin' | 'telegram';
    body: string;
    sent_at?: string | null;
};

type Conversation = {
    id: number;
    status: string;
    assigned_admin_id?: number | null;
    assignedAdmin?: {
        id: number;
        name?: string | null;
        email?: string | null;
    } | null;
    user?: { id: number; name?: string | null; email?: string | null } | null;
    guest_token?: string | null;
    last_message_at?: string | null;
    messages?: Message[];
};

type Props = {
    items: Conversation[];
    admins: Array<{ id: number; name?: string | null; email: string }>;
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Support({ items, admins }: Props) {
    const [conversations, setConversations] = useState<Conversation[]>(items);
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [activeId, setActiveId] = useState<number | null>(
        items[0]?.id ?? null,
    );
    const [savingConversationId, setSavingConversationId] = useState<
        number | null
    >(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const statusOptions = useMemo(
        () =>
            Array.from(
                new Set(conversations.map((item) => item.status.toLowerCase())),
            ),
        [conversations],
    );

    const filteredConversations = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();

        return conversations.filter((conversation) => {
            const statusMatches =
                statusFilter === 'all' ||
                conversation.status.toLowerCase() === statusFilter;
            if (!statusMatches) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            const haystack = [
                conversation.id,
                conversation.user?.name,
                conversation.user?.email,
                conversation.guest_token,
                conversation.messages?.at(-1)?.body,
            ]
                .join(' ')
                .toLowerCase();

            return haystack.includes(normalizedQuery);
        });
    }, [conversations, query, statusFilter]);

    useEffect(() => {
        if (!filteredConversations.length) {
            if (activeId !== null) {
                setActiveId(null);
            }
            return;
        }

        if (
            activeId === null ||
            !filteredConversations.some(
                (conversation) => conversation.id === activeId,
            )
        ) {
            setActiveId(filteredConversations[0].id);
        }
    }, [activeId, filteredConversations]);

    const activeConversation = useMemo(
        () =>
            conversations.find(
                (conversation) => conversation.id === activeId,
            ) ?? null,
        [activeId, conversations],
    );

    const updateConversation = async (conversation: Conversation) => {
        setNotice(null);
        setSavingConversationId(conversation.id);

        try {
            const payload = await apiPatch<{ ok: boolean; item: Conversation }>(
                `/api/v1/admin/support/conversations/${conversation.id}`,
                {
                    status: conversation.status,
                    assignedAdminId: conversation.assigned_admin_id || null,
                },
            );

            setConversations((prev) =>
                prev.map((row) =>
                    row.id === conversation.id ? payload.item : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Диалог #${conversation.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingConversationId(null);
        }
    };

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channel = window.Echo.private('support.admin');
        channel.listen(
            '.support.message.created',
            (event: { conversation: { id: number }; message: Message }) => {
                setConversations((prev) => {
                    return prev.map((conversation) => {
                        if (conversation.id !== event.conversation.id) {
                            return conversation;
                        }

                        const messages = conversation.messages || [];
                        if (
                            messages.some(
                                (item) => item.id === event.message.id,
                            )
                        ) {
                            return conversation;
                        }

                        return {
                            ...conversation,
                            status: 'open',
                            last_message_at:
                                event.message.sent_at ||
                                conversation.last_message_at,
                            messages: [...messages, event.message],
                        };
                    });
                });
            },
        );

        return () => {
            window.Echo?.leave('support.admin');
        };
    }, []);

    return (
        <AdminLayout title="Поддержка">
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
            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
                <Card>
                    <CardHeader className="space-y-3">
                        <CardTitle>Диалоги</CardTitle>
                        <Input
                            value={query}
                            placeholder="Поиск по email, токену, тексту"
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                onClick={() => setStatusFilter('all')}
                                className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                    statusFilter === 'all'
                                        ? 'border-brand bg-brand/10 text-brand-dark'
                                        : 'border-border text-muted-foreground'
                                }`}
                            >
                                Все
                            </button>
                            {statusOptions.map((status) => {
                                const meta = getSupportStatusMeta(status);
                                return (
                                    <button
                                        type="button"
                                        key={status}
                                        onClick={() => setStatusFilter(status)}
                                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
                                            statusFilter === status
                                                ? 'border-brand bg-brand/10 text-brand-dark'
                                                : 'border-border text-muted-foreground'
                                        }`}
                                    >
                                        {meta.label}
                                    </button>
                                );
                            })}
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {filteredConversations.map((conversation) => {
                            const isActive = conversation.id === activeId;
                            const meta = getSupportStatusMeta(
                                conversation.status,
                            );
                            const lastMessage =
                                conversation.messages?.at(-1)?.body || '';

                            return (
                                <button
                                    type="button"
                                    key={conversation.id}
                                    onClick={() => setActiveId(conversation.id)}
                                    className={`w-full rounded-xl border p-3 text-left transition ${
                                        isActive
                                            ? 'border-brand bg-brand/5'
                                            : 'border-border bg-card hover:bg-surface/70'
                                    }`}
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">
                                                Диалог #{conversation.id}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {conversation.user?.email ||
                                                    `Гость ${conversation.guest_token?.slice(0, 8) || ''}`}
                                            </p>
                                        </div>
                                        <Badge variant={meta.tone}>
                                            {meta.label}
                                        </Badge>
                                    </div>
                                    <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
                                        {lastMessage || 'Сообщений пока нет'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Ответственный:{' '}
                                        {conversation.assignedAdmin?.name ||
                                            conversation.assignedAdmin?.email ||
                                            'не назначен'}
                                    </p>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {formatShortDate(
                                            conversation.last_message_at,
                                        )}
                                    </p>
                                </button>
                            );
                        })}
                        {filteredConversations.length === 0 ? (
                            <p className="rounded-lg border border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                Диалоги по заданным параметрам не найдены.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>
                            {activeConversation
                                ? `Диалог #${activeConversation.id}`
                                : 'Выберите диалог'}
                        </CardTitle>
                        {activeConversation ? (
                            <div className="space-y-3">
                                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                    <Badge
                                        variant={
                                            getSupportStatusMeta(
                                                activeConversation.status,
                                            ).tone
                                        }
                                    >
                                        {
                                            getSupportStatusMeta(
                                                activeConversation.status,
                                            ).label
                                        }
                                    </Badge>
                                    <span>
                                        Последняя активность:{' '}
                                        {formatDate(
                                            activeConversation.last_message_at,
                                        )}
                                    </span>
                                </div>

                                <div className="grid gap-2 md:grid-cols-[220px_1fr_auto]">
                                    <select
                                        className="h-10 rounded-lg border border-border px-2 text-sm"
                                        value={activeConversation.status}
                                        onChange={(event) =>
                                            setConversations((prev) =>
                                                prev.map((row) =>
                                                    row.id ===
                                                    activeConversation.id
                                                        ? {
                                                              ...row,
                                                              status: event
                                                                  .target.value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        <option value="open">Открыт</option>
                                        <option value="in_progress">
                                            В работе
                                        </option>
                                        <option value="closed">Закрыт</option>
                                        <option value="resolved">Решён</option>
                                    </select>
                                    <select
                                        className="h-10 rounded-lg border border-border px-2 text-sm"
                                        value={
                                            activeConversation.assigned_admin_id ??
                                            ''
                                        }
                                        onChange={(event) =>
                                            setConversations((prev) =>
                                                prev.map((row) =>
                                                    row.id ===
                                                    activeConversation.id
                                                        ? {
                                                              ...row,
                                                              assigned_admin_id:
                                                                  event.target
                                                                      .value
                                                                      ? Number(
                                                                            event
                                                                                .target
                                                                                .value,
                                                                        )
                                                                      : null,
                                                              assignedAdmin:
                                                                  event.target
                                                                      .value
                                                                      ? admins.find(
                                                                            (
                                                                                admin,
                                                                            ) =>
                                                                                admin.id ===
                                                                                Number(
                                                                                    event
                                                                                        .target
                                                                                        .value,
                                                                                ),
                                                                        ) ||
                                                                        null
                                                                      : null,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    >
                                        <option value="">
                                            Админ не назначен
                                        </option>
                                        {admins.map((admin) => (
                                            <option
                                                key={admin.id}
                                                value={admin.id}
                                            >
                                                {admin.name || admin.email}
                                            </option>
                                        ))}
                                    </select>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            savingConversationId ===
                                            activeConversation.id
                                        }
                                        onClick={() =>
                                            updateConversation(
                                                activeConversation,
                                            )
                                        }
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </div>
                        ) : null}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="max-h-[560px] space-y-2 overflow-y-auto rounded-xl border border-border p-3">
                            {(activeConversation?.messages || []).map(
                                (message) => (
                                    <div
                                        key={message.id}
                                        className={`max-w-[88%] rounded-lg p-3 text-sm ${
                                            message.sender_type === 'admin'
                                                ? 'ml-auto bg-emerald-100'
                                                : 'bg-surface/80'
                                        }`}
                                    >
                                        <p className="whitespace-pre-wrap">
                                            {message.body}
                                        </p>
                                        <p className="mt-2 text-xs text-muted-foreground">
                                            {getSenderTypeLabel(
                                                message.sender_type,
                                            )}{' '}
                                            ·{' '}
                                            {getMessageSourceLabel(
                                                message.source,
                                            )}{' '}
                                            · {formatDate(message.sent_at)}
                                        </p>
                                    </div>
                                ),
                            )}
                            {!activeConversation?.messages?.length ? (
                                <p className="py-6 text-center text-sm text-muted-foreground">
                                    В этом диалоге пока нет сообщений.
                                </p>
                            ) : null}
                        </div>

                        {activeConversation ? (
                            <AdminReplyForm
                                conversationId={activeConversation.id}
                                onSent={() => {
                                    // optimistic updates rely on websocket event
                                }}
                            />
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
