import { apiGet, apiPost } from '@/shared/api/http';
import { cn, formatShortDate } from '@/shared/lib/utils';
import type {
    SupportConversationDto,
    SupportMessageDto,
} from '@/shared/types/domain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Textarea } from '@/shared/ui/textarea';
import type { PageProps } from '@/types';
import { usePage } from '@inertiajs/react';
import { MessageCircle, Send, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

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

    const isHidden = useMemo(
        () => currentUrl.startsWith('/admin'),
        [currentUrl],
    );

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

    if (isHidden) {
        return null;
    }

    return (
        <div className="fixed bottom-5 right-5 z-40">
            {!open ? (
                <Button
                    type="button"
                    size="icon"
                    className="dw-support-pulse relative h-14 w-14 rounded-full shadow-xl"
                    onClick={() => setOpen(true)}
                    aria-label="Открыть чат поддержки"
                >
                    <MessageCircle className="h-6 w-6" />
                </Button>
            ) : (
                <Card className="dw-scale-in w-[min(92vw,380px)] border-brand/20 shadow-2xl">
                    <CardHeader className="flex-row items-center justify-between space-y-0 pb-4">
                        <CardTitle className="text-base">
                            Техподдержка
                        </CardTitle>
                        <button
                            type="button"
                            className="rounded-lg p-1 text-muted-foreground hover:bg-surface"
                            onClick={() => setOpen(false)}
                            aria-label="Закрыть"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-border bg-surface/40 p-3">
                            {loading ? (
                                <p className="text-sm text-muted-foreground">
                                    Загрузка...
                                </p>
                            ) : messages.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    Напишите нам. Администратор ответит в этом
                                    окне или через Telegram.
                                </p>
                            ) : (
                                messages.map((message) => {
                                    const mine =
                                        message.senderType === 'user' ||
                                        message.senderType === 'guest';
                                    return (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                'dw-fade-up rounded-lg p-2 text-sm',
                                                mine
                                                    ? 'bg-brand/15'
                                                    : 'bg-card',
                                            )}
                                        >
                                            <p>{message.body}</p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatShortDate(
                                                    message.sentAt,
                                                )}
                                            </p>
                                        </div>
                                    );
                                })
                            )}
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground">
                                Среднее время ответа: до 15 минут в рабочее
                                время.
                            </p>
                            <Textarea
                                value={body}
                                onChange={(event) =>
                                    setBody(event.target.value)
                                }
                                placeholder="Ваш вопрос"
                                rows={3}
                            />
                            <Button
                                type="button"
                                className="w-full"
                                onClick={onSend}
                                disabled={sending || !body.trim()}
                            >
                                <Send className="mr-2 h-4 w-4" />
                                {sending ? 'Отправка...' : 'Отправить'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
