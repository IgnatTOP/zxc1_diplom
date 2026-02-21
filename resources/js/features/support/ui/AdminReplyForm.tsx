import { apiPost } from '@/shared/api/http';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { Send } from 'lucide-react';
import { FormEvent, KeyboardEvent, useState } from 'react';

type Props = {
    conversationId: number;
    onSent: (message: {
        id: number;
        body: string;
        sender_type: string;
        sent_at?: string | null;
        source?: string;
    }) => void;
};

export function AdminReplyForm({ conversationId, onSent }: Props) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);

    const submit = async () => {
        if (!text.trim() || sending) {
            return;
        }

        setSending(true);
        setErrorText(null);
        try {
            const payload = await apiPost<{
                ok: boolean;
                message: {
                    id: number;
                    body: string;
                    sender_type: string;
                    sent_at?: string | null;
                    source?: string;
                };
            }>('/api/v1/admin/support/messages', {
                conversationId,
                body: text,
            });
            setText('');
            onSent(payload.message);
        } catch (error) {
            setErrorText(
                error instanceof Error && error.message
                    ? error.message
                    : 'Не удалось отправить сообщение.',
            );
        } finally {
            setSending(false);
        }
    };

    const onSubmit = (event: FormEvent) => {
        event.preventDefault();
        submit();
    };

    const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
            event.preventDefault();
            submit();
        }
    };

    return (
        <div className="space-y-2 border-t border-border/50 bg-background/80 p-3">
            {errorText ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-300">
                    {errorText}
                </p>
            ) : null}
            <form className="flex items-end gap-2" onSubmit={onSubmit}>
                <Textarea
                    rows={2}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                    onKeyDown={onKeyDown}
                    placeholder="Введите ответ… (Ctrl+Enter — отправить)"
                    className="min-h-[44px] flex-1 resize-none rounded-xl border-border/60 bg-surface/60 text-sm focus-visible:ring-brand/30"
                />
                <Button
                    type="submit"
                    size="icon"
                    disabled={sending || !text.trim()}
                    className="h-10 w-10 shrink-0 rounded-xl"
                >
                    <Send className="h-4 w-4" />
                </Button>
            </form>
        </div>
    );
}
