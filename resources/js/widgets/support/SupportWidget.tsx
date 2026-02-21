import { apiGet, apiPost } from '@/shared/api/http';
import { cn, formatShortDate } from '@/shared/lib/utils';
import type {
    SupportConversationDto,
    SupportMessageDto,
} from '@/shared/types/domain';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { MessageCircle, Send, X } from 'lucide-react';
import { KeyboardEvent, useEffect, useMemo, useRef, useState } from 'react';

type SupportCurrentResponse = {
    ok: boolean;
    conversation: SupportConversationDto;
    messages: SupportMessageDto[];
    guestToken?: string;
    realtime?: {
        userChannel?: string | null;
        guestChannel?: string | null;
    };
};

export function SupportWidget() {
    const page = usePage<PageProps>();
    const auth = page.props.auth;
    const currentUrl = page.url;
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [body, setBody] = useState('');
    const [conversation, setConversation] =
        useState<SupportConversationDto | null>(null);
    const [messages, setMessages] = useState<SupportMessageDto[]>([]);
    const [guestToken, setGuestToken] = useState<string | null>(null);
    const [realtime, setRealtime] =
        useState<SupportCurrentResponse['realtime']>();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isHidden = useMemo(
        () => currentUrl.startsWith('/admin'),
        [currentUrl],
    );

    /* Auto-scroll on new messages */
    useEffect(() => {
        if (open) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages.length, open]);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        const fromStorage = localStorage.getItem('dw_guest_token');
        if (fromStorage) {
            setGuestToken(fromStorage);
        }
    }, []);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            setLoading(true);
            try {
                const response = await apiGet<SupportCurrentResponse>(
                    '/api/v1/support/current',
                    {
                        headers: guestToken
                            ? { 'X-Guest-Token': guestToken }
                            : undefined,
                    },
                );

                if (cancelled) {
                    return;
                }

                setConversation(response.conversation);
                setMessages(response.messages);
                setRealtime(response.realtime);

                if (response.guestToken) {
                    setGuestToken(response.guestToken);
                    localStorage.setItem('dw_guest_token', response.guestToken);
                }
            } catch {
                if (!cancelled) {
                    setMessages([]);
                }
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        };

        load();

        return () => {
            cancelled = true;
        };
    }, [guestToken]);

    useEffect(() => {
        if (!conversation || !window.Echo) {
            return;
        }

        const channelName = auth.user
            ? realtime?.userChannel
            : realtime?.guestChannel;
        if (!channelName) {
            return;
        }

        const channel = auth.user
            ? window.Echo.private(channelName)
            : window.Echo.channel(channelName);

        channel.listen(
            '.support.message.created',
            (event: {
                message: SupportMessageDto;
                conversation: { id: number };
            }) => {
                if (
                    !event?.message ||
                    event.conversation?.id !== conversation.id
                ) {
                    return;
                }

                setMessages((prev) => {
                    if (prev.some((item) => item.id === event.message.id)) {
                        return prev;
                    }
                    return [...prev, event.message];
                });
            },
        );

        return () => {
            window.Echo?.leave(channelName);
        };
    }, [auth.user, conversation, realtime]);

    const onSend = async () => {
        if (!body.trim() || !conversation || sending) {
            return;
        }

        setSending(true);

        try {
            const response = await apiPost<{
                ok: boolean;
                message: SupportMessageDto;
            }>(
                '/api/v1/support/messages',
                {
                    conversationId: conversation.id,
                    body,
                    guestToken,
                },
                {
                    headers: guestToken
                        ? { 'X-Guest-Token': guestToken }
                        : undefined,
                },
            );

            if (response.message) {
                setMessages((prev) => {
                    if (prev.some((item) => item.id === response.message.id)) {
                        return prev;
                    }
                    return [...prev, response.message];
                });
            }

            setBody('');
        } finally {
            setSending(false);
        }
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
        }
    };

    if (isHidden) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {!open ? (
                /* ─── FAB ─── */
                <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label="Открыть чат поддержки"
                    className="group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark shadow-lg shadow-brand/25 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-brand/30"
                >
                    <MessageCircle className="h-6 w-6 text-white transition-transform duration-300 group-hover:scale-110" />
                    {/* Pulse ring */}
                    <span className="absolute inset-0 animate-ping rounded-full bg-brand/20" style={{ animationDuration: '3s' }} />
                </button>
            ) : (
                /* ─── Chat panel ─── */
                <div className="dw-scale-in flex w-[min(92vw,400px)] flex-col overflow-hidden rounded-2xl border border-brand/20 bg-card shadow-2xl shadow-brand/10">
                    {/* Header */}
                    <div className="flex items-center justify-between bg-gradient-to-r from-brand to-brand-dark px-4 py-3">
                        <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                                <MessageCircle className="h-4 w-4 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-white">Техподдержка</p>
                                <div className="flex items-center gap-1.5">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                                    <span className="text-[10px] text-white/80">Онлайн</span>
                                </div>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setOpen(false)}
                            aria-label="Закрыть"
                            className="rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/15 hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-surface/30 to-background" style={{ maxHeight: '340px', minHeight: '200px' }}>
                        <div className="space-y-2 p-3">
                            {loading ? (
                                <div className="flex items-center justify-center py-10">
                                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center gap-2 py-8 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand/10">
                                        <MessageCircle className="h-6 w-6 text-brand/50" />
                                    </div>
                                    <p className="text-sm font-medium text-foreground">Задайте вопрос</p>
                                    <p className="max-w-[220px] text-xs text-muted-foreground">
                                        Мы ответим в этом окне или через Telegram. Среднее время ответа — до 15 минут.
                                    </p>
                                </div>
                            ) : (
                                messages.map((message) => {
                                    const mine =
                                        message.senderType === 'user' ||
                                        message.senderType === 'guest';
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'flex',
                                                mine ? 'justify-end' : 'justify-start',
                                            )}
                                        >
                                            <div
                                                className={cn(
                                                    'dw-fade-up relative max-w-[80%] rounded-2xl px-3.5 py-2 text-sm shadow-sm',
                                                    mine
                                                        ? 'rounded-br-md bg-gradient-to-br from-brand/20 to-brand/10 text-foreground'
                                                        : 'rounded-bl-md border border-border/50 bg-card text-foreground',
                                                )}
                                            >
                                                {!mine && (
                                                    <p className="mb-0.5 text-[10px] font-medium text-brand-dark">
                                                        Поддержка
                                                    </p>
                                                )}
                                                <p className="whitespace-pre-wrap leading-relaxed">{message.body}</p>
                                                <p className={cn(
                                                    'mt-1 text-[10px]',
                                                    mine ? 'text-right text-muted-foreground/60' : 'text-muted-foreground/60',
                                                )}>
                                                    {formatShortDate(message.sentAt)}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input area */}
                    <div className="border-t border-border/50 bg-background/80 p-3">
                        <div className="flex items-end gap-2">
                            <Textarea
                                value={body}
                                onChange={(event) => setBody(event.target.value)}
                                onKeyDown={onKeyDown}
                                placeholder="Ваш вопрос…"
                                rows={2}
                                className="min-h-[40px] flex-1 resize-none rounded-xl border-border/50 bg-surface/50 text-sm focus-visible:ring-brand/30"
                            />
                            <Button
                                type="button"
                                size="icon"
                                onClick={onSend}
                                disabled={sending || !body.trim()}
                                className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-brand to-brand-dark shadow-sm hover:shadow-md"
                            >
                                <Send className="h-4 w-4 text-white" />
                            </Button>
                        </div>
                        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60">
                            Enter — отправить · Shift+Enter — перенос
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}
