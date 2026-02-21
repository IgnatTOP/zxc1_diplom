import { AdminReplyForm } from '@/features/support/ui/AdminReplyForm';
import { apiPatch } from '@/shared/api/http';
import { AdminSelect } from '@/shared/ui/admin-select';
import {
    getMessageSourceLabel,
    getSenderTypeLabel,
    getSupportStatusMeta,
} from '@/shared/lib/admin-labels';
import { formatDate, formatShortDate } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    CheckCircle2,
    Clock,
    HeadphonesIcon,
    Inbox,
    MessageCircle,
    Search,
    User,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

type AdminItem = {
    id: number;
    name?: string | null;
    email: string;
};

type MessageItem = {
    id: number;
    body: string;
    sender_type: string;
    sent_at?: string | null;
    source?: string;
};

type TicketItem = {
    id: number;
    subject?: string | null;
    status: string;
    priority?: string | null;
    created_at?: string | null;
    updated_at?: string | null;
    assigned_admin_id?: number | null;
    assignedAdmin?: AdminItem | null;
    user?: { name?: string | null; email: string };
    messages?: MessageItem[];
};

type Props = {
    tickets?: TicketItem[];
    items?: TicketItem[];
    admins?: AdminItem[];
};

type SupportRealtimeEvent = {
    conversation?: {
        id?: number;
        status?: string;
        lastMessageAt?: string | null;
    };
    message?: {
        id?: number;
        body?: string;
        senderType?: string;
        source?: string;
        sentAt?: string | null;
    };
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function normalizeTicket(ticket: TicketItem): TicketItem {
    return {
        ...ticket,
        assigned_admin_id: ticket.assigned_admin_id ?? ticket.assignedAdmin?.id ?? null,
        messages: ticket.messages || [],
    };
}

function toRealtimeMessage(event: SupportRealtimeEvent): MessageItem | null {
    if (!event.message?.id || !event.message?.body) {
        return null;
    }

    return {
        id: event.message.id,
        body: event.message.body,
        sender_type: event.message.senderType ?? 'system',
        source: event.message.source,
        sent_at: event.message.sentAt ?? null,
    };
}

function getLastMessagePreview(ticket: TicketItem): string {
    const msgs = ticket.messages || [];
    if (msgs.length === 0) return 'Нет сообщений';
    const last = msgs[msgs.length - 1];
    return last.body.length > 60 ? last.body.slice(0, 60) + '…' : last.body;
}

function getStatusDotColor(status: string): string {
    switch (status) {
        case 'open':
            return 'bg-emerald-500';
        case 'in_progress':
            return 'bg-amber-500';
        case 'resolved':
            return 'bg-blue-500';
        case 'closed':
            return 'bg-gray-400';
        default:
            return 'bg-gray-400';
    }
}

export default function Support({
    tickets,
    items,
    admins = [],
}: Props) {
    const [list, setList] = useState<TicketItem[]>(() =>
        (tickets ?? items ?? []).map(normalizeTicket),
    );
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [savingId, setSavingId] = useState<number | null>(null);
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!window.Echo) {
            return;
        }

        const channelName = 'support.admin';
        const channel = window.Echo.private(channelName);

        channel.listen('.support.message.created', (event: SupportRealtimeEvent) => {
            const conversationId = event.conversation?.id;
            const message = toRealtimeMessage(event);

            if (!conversationId || !message) {
                return;
            }

            setList((prev) =>
                prev.map((ticket) => {
                    if (ticket.id !== conversationId) {
                        return ticket;
                    }

                    if ((ticket.messages || []).some((item) => item.id === message.id)) {
                        return ticket;
                    }

                    return {
                        ...ticket,
                        status: event.conversation?.status ?? ticket.status,
                        updated_at: event.conversation?.lastMessageAt ?? new Date().toISOString(),
                        messages: [...(ticket.messages || []), message],
                    };
                }),
            );
        });

        return () => {
            window.Echo?.leave(channelName);
        };
    }, []);

    /* Auto-scroll when messages change for the selected ticket */
    const selectedTicket = useMemo(
        () => list.find((t) => t.id === selectedId) ?? null,
        [list, selectedId],
    );

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({
                top: scrollContainerRef.current.scrollHeight,
                behavior: 'smooth',
            });
        }
    }, [selectedTicket?.messages?.length]);

    const filteredTickets = useMemo(() => {
        let result = list;

        const normalizedQuery = query.trim().toLowerCase();
        if (normalizedQuery) {
            result = result.filter((ticket) =>
                [
                    ticket.subject,
                    ticket.user?.email,
                    ticket.user?.name,
                    ticket.status,
                ]
                    .join(' ')
                    .toLowerCase()
                    .includes(normalizedQuery),
            );
        }

        if (statusFilter) {
            result = result.filter(
                (ticket) => ticket.status === statusFilter,
            );
        }

        return result;
    }, [list, query, statusFilter]);

    const statusCounts = useMemo(() => {
        return list.reduce<Record<string, number>>((acc, ticket) => {
            const key = ticket.status || 'unknown';
            acc[key] = (acc[key] ?? 0) + 1;
            return acc;
        }, {});
    }, [list]);

    const updateTicket = async (
        ticket: TicketItem,
        patch: { status?: string; assignedAdminId?: number | null },
    ) => {
        setNotice(null);
        setSavingId(ticket.id);

        try {
            const payload = await apiPatch<{
                ok: boolean;
                item: TicketItem;
            }>(`/api/v1/admin/support/conversations/${ticket.id}`, {
                ...patch,
            });

            setList((prev) =>
                prev.map((row) =>
                    row.id === ticket.id
                        ? normalizeTicket(payload.item)
                        : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Тикет #${ticket.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const handleReplySuccess = (ticketId: number, newMessage: MessageItem) => {
        setList((prev) =>
            prev.map((row) =>
                row.id === ticketId
                    ? {
                        ...row,
                        status: 'open',
                        updated_at: new Date().toISOString(),
                        messages: (row.messages || []).some(
                            (item) => item.id === newMessage.id,
                        )
                            ? row.messages || []
                            : [...(row.messages || []), newMessage],
                    }
                    : row,
            ),
        );
        setNotice({ tone: 'success', text: 'Ответ отправлен.' });
    };

    return (
        <AdminLayout title="Поддержка">
            {/* Toast notification */}
            {notice ? (
                <div
                    className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
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

            {/* Two-panel messenger */}
            <div className="flex h-[calc(100vh-180px)] min-h-[500px] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-sm">
                {/* ─── Left: Ticket List ─── */}
                <div className="flex w-80 shrink-0 flex-col border-r border-border/60 lg:w-96">
                    {/* Search & filter header */}
                    <div className="space-y-2 border-b border-border/50 bg-surface/40 p-3">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                                <HeadphonesIcon className="h-4 w-4 text-brand" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-semibold">
                                    Тикетов: {list.length}
                                </p>
                                <p className="text-[10px] text-muted-foreground">
                                    Открыты: {statusCounts.open ?? 0} · В работе: {statusCounts.in_progress ?? 0}
                                </p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="h-8 pl-8 text-xs"
                                value={query}
                                placeholder="Поиск..."
                                onChange={(event) => setQuery(event.target.value)}
                            />
                        </div>
                        <AdminSelect
                            className="h-8 w-full text-xs"
                            value={statusFilter}
                            onChange={(event) => setStatusFilter(event.target.value)}
                        >
                            <option value="">Все статусы</option>
                            <option value="open">Открыт</option>
                            <option value="in_progress">В работе</option>
                            <option value="resolved">Решён</option>
                            <option value="closed">Закрыт</option>
                        </AdminSelect>
                    </div>

                    {/* Ticket list */}
                    <div className="flex-1 overflow-y-auto">
                        {filteredTickets.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-2 py-12 text-center text-muted-foreground">
                                <Inbox className="h-8 w-8 opacity-40" />
                                <p className="text-sm">Тикеты не найдены</p>
                            </div>
                        ) : (
                            filteredTickets.map((ticket) => {
                                const isActive = selectedId === ticket.id;
                                return (
                                    <button
                                        type="button"
                                        key={ticket.id}
                                        onClick={() => setSelectedId(ticket.id)}
                                        className={`group flex w-full items-start gap-3 border-b border-border/30 px-3 py-3 text-left transition-colors ${isActive
                                            ? 'bg-brand/8 border-l-2 border-l-brand'
                                            : 'hover:bg-surface/60'
                                            }`}
                                    >
                                        {/* Avatar */}
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand-dark/20 text-xs font-bold text-brand-dark">
                                            {(ticket.user?.name || ticket.user?.email || '?').charAt(0).toUpperCase()}
                                        </div>

                                        {/* Content */}
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between gap-1">
                                                <p className="truncate text-sm font-semibold">
                                                    {ticket.user?.name || ticket.user?.email || `Тикет #${ticket.id}`}
                                                </p>
                                                <div className={`h-2 w-2 shrink-0 rounded-full ${getStatusDotColor(ticket.status)}`} />
                                            </div>
                                            <p className="truncate text-xs text-muted-foreground">
                                                {ticket.subject || getLastMessagePreview(ticket)}
                                            </p>
                                            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                                <Clock className="h-2.5 w-2.5" />
                                                {formatShortDate(ticket.updated_at)}
                                                <span className="ml-auto text-[10px] opacity-60">
                                                    {(ticket.messages || []).length} сообщ.
                                                </span>
                                            </div>
                                        </div>
                                    </button>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* ─── Right: Chat Panel ─── */}
                <div className="flex flex-1 flex-col">
                    {selectedTicket ? (
                        <>
                            {/* Chat header */}
                            <div className="flex flex-wrap items-center gap-3 border-b border-border/50 bg-surface/30 px-4 py-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand/25 to-brand-dark/25 text-sm font-bold text-brand-dark">
                                    {(selectedTicket.user?.name || selectedTicket.user?.email || '?').charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="font-semibold">
                                        {selectedTicket.user?.name || selectedTicket.user?.email}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        #{selectedTicket.id} · {selectedTicket.subject || 'Без темы'}
                                    </p>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                    <Badge variant={getSupportStatusMeta(selectedTicket.status).tone}>
                                        {getSupportStatusMeta(selectedTicket.status).label}
                                    </Badge>
                                    <AdminSelect
                                        className="h-8 w-36 text-xs"
                                        value={selectedTicket.status}
                                        disabled={savingId === selectedTicket.id}
                                        onChange={(event) =>
                                            updateTicket(selectedTicket, { status: event.target.value })
                                        }
                                    >
                                        <option value="open">Открыт</option>
                                        <option value="in_progress">В работе</option>
                                        <option value="resolved">Решён</option>
                                        <option value="closed">Закрыт</option>
                                    </AdminSelect>
                                    <AdminSelect
                                        className="h-8 w-44 text-xs"
                                        value={selectedTicket.assigned_admin_id ?? ''}
                                        disabled={savingId === selectedTicket.id}
                                        onChange={(event) =>
                                            updateTicket(selectedTicket, {
                                                assignedAdminId:
                                                    event.target.value === ''
                                                        ? null
                                                        : Number(event.target.value),
                                            })
                                        }
                                    >
                                        <option value="">Без ответств.</option>
                                        {admins.map((admin) => (
                                            <option key={admin.id} value={admin.id}>
                                                {admin.name || admin.email}
                                            </option>
                                        ))}
                                    </AdminSelect>
                                </div>
                            </div>

                            {/* Messages */}
                            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4 flex flex-col">
                                <div className="mx-auto w-full max-w-2xl flex-1 flex flex-col pb-2">
                                    {(selectedTicket.messages || []).length === 0 ? (
                                        <p className="py-10 text-center text-sm text-muted-foreground">
                                            Нет сообщений в этом тикете.
                                        </p>
                                    ) : (
                                        (selectedTicket.messages || []).map((msg, index, arr) => {
                                            const isAdmin = msg.sender_type === 'admin';
                                            const isConsecutive = index > 0 && arr[index - 1].sender_type === msg.sender_type;

                                            return (
                                                <div
                                                    key={msg.id}
                                                    className={`flex w-full ${isAdmin ? 'justify-end' : 'justify-start'} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                                                >
                                                    <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isAdmin ? 'items-end' : 'items-start'}`}>
                                                        {/* Header only shown for the first message in a consecutive block */}
                                                        {!isConsecutive && (
                                                            <div className={`mb-1.5 flex items-center gap-2 text-[11px] ${isAdmin ? 'flex-row-reverse text-brand-dark dark:text-brand' : 'text-muted-foreground'}`}>
                                                                <span className="font-semibold">{getSenderTypeLabel(msg.sender_type)}</span>
                                                                {msg.source && (
                                                                    <>
                                                                        <span className="h-1 w-1 rounded-full bg-border"></span>
                                                                        <span className="opacity-70">{getMessageSourceLabel(msg.source)}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        )}

                                                        {/* Bubble */}
                                                        <div
                                                            className={`relative px-4 py-3 text-sm shadow-sm transition-all ${isAdmin
                                                                ? `bg-brand text-white dark:bg-brand-dark dark:text-background ${isConsecutive ? 'rounded-2xl rounded-tr-sm' : 'rounded-2xl rounded-tr-sm rounded-br-md'}`
                                                                : `border border-border/50 bg-surface text-foreground ${isConsecutive ? 'rounded-2xl rounded-tl-sm' : 'rounded-2xl rounded-tl-sm rounded-bl-md'}`
                                                                }`}
                                                        >
                                                            <p className="whitespace-pre-wrap leading-relaxed break-words">
                                                                {msg.body}
                                                            </p>
                                                            <div className={`mt-2 flex items-center gap-1.5 text-[10px] ${isAdmin ? 'text-white/80 dark:text-background/80 justify-end' : 'text-muted-foreground/80 justify-end'}`}>
                                                                <span>{formatDate(msg.sent_at)}</span>
                                                                {isAdmin && <CheckCircle2 className="h-3 w-3" />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Reply form */}
                            <AdminReplyForm
                                conversationId={selectedTicket.id}
                                onSent={(message) =>
                                    handleReplySuccess(selectedTicket.id, message)
                                }
                            />
                        </>
                    ) : (
                        /* Empty state */
                        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-muted-foreground">
                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand/10">
                                <MessageCircle className="h-8 w-8 text-brand/50" />
                            </div>
                            <p className="font-medium">Выберите тикет</p>
                            <p className="max-w-xs text-center text-sm">
                                Выберите беседу слева, чтобы посмотреть сообщения и ответить пользователю.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
