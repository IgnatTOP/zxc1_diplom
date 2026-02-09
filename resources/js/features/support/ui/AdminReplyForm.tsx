import { apiPost } from '@/shared/api/http';
import { Button } from '@/shared/ui/button';
import { Textarea } from '@/shared/ui/textarea';
import { FormEvent, useState } from 'react';

type Props = {
    conversationId: number;
    onSent: () => void;
};

export function AdminReplyForm({ conversationId, onSent }: Props) {
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);

    const onSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!text.trim() || sending) {
            return;
        }

        setSending(true);
        try {
            await apiPost('/api/v1/admin/support/messages', {
                conversationId,
                body: text,
            });
            setText('');
            onSent();
        } finally {
            setSending(false);
        }
    };

    return (
        <form className="space-y-2" onSubmit={onSubmit}>
            <Textarea
                rows={4}
                value={text}
                onChange={(event) => setText(event.target.value)}
                placeholder="Ответ пользователю. Enter — перенос строки, отправка кнопкой."
            />
            <Button type="submit" disabled={sending || !text.trim()}>
                {sending ? 'Отправка...' : 'Отправить ответ'}
            </Button>
        </form>
    );
}
