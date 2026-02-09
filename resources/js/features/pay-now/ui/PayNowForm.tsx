import { apiPost } from '@/shared/api/http';
import { formatMoney } from '@/shared/lib/utils';
import type { EnrollmentDto } from '@/shared/types/domain';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { FormEvent, useMemo, useState } from 'react';

type Props = {
    enrollments: EnrollmentDto[];
    onSuccess: () => void;
};

export function PayNowForm({ enrollments, onSuccess }: Props) {
    const [enrollmentId, setEnrollmentId] = useState<number | null>(
        enrollments[0]?.id ?? null,
    );
    const [cardNumber, setCardNumber] = useState('');
    const [cardHolder, setCardHolder] = useState('');
    const [expMonth, setExpMonth] = useState('');
    const [expYear, setExpYear] = useState('');
    const [cvv, setCvv] = useState('');
    const [sending, setSending] = useState(false);
    const [message, setMessage] = useState<string | null>(null);

    const selected = useMemo(
        () => enrollments.find((item) => item.id === enrollmentId) ?? null,
        [enrollmentId, enrollments],
    );

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!enrollmentId) {
            return;
        }

        setSending(true);
        setMessage(null);

        try {
            const response = await apiPost<{
                ok: boolean;
                paymentId: number;
                nextDueAt: string | null;
            }>('/api/v1/payments/checkout', {
                enrollmentId,
                cardNumber,
                cardHolder,
                expMonth: Number(expMonth),
                expYear: Number(expYear),
                cvv,
            });

            setMessage(`Платеж #${response.paymentId} успешно проведен.`);
            setCardNumber('');
            setCardHolder('');
            setExpMonth('');
            setExpYear('');
            setCvv('');
            onSuccess();
        } catch {
            setMessage('Ошибка оплаты. Проверьте данные карты.');
        } finally {
            setSending(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Оплата на сайте (mock)</CardTitle>
            </CardHeader>
            <CardContent>
                <form className="space-y-3" onSubmit={submit}>
                    <label className="block space-y-1 text-sm">
                        <span>Группа</span>
                        <select
                            className="h-11 w-full rounded-xl border border-border bg-background px-3"
                            value={enrollmentId ?? ''}
                            onChange={(event) =>
                                setEnrollmentId(Number(event.target.value))
                            }
                        >
                            {enrollments.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.groupName} ·{' '}
                                    {formatMoney(
                                        item.billingAmount,
                                        item.currency,
                                    )}
                                </option>
                            ))}
                        </select>
                    </label>

                    <Input
                        placeholder="Номер карты"
                        value={cardNumber}
                        onChange={(event) => setCardNumber(event.target.value)}
                        required
                    />
                    <Input
                        placeholder="Держатель карты"
                        value={cardHolder}
                        onChange={(event) => setCardHolder(event.target.value)}
                        required
                    />
                    <div className="grid grid-cols-2 gap-3">
                        <Input
                            placeholder="Месяц"
                            value={expMonth}
                            onChange={(event) =>
                                setExpMonth(event.target.value)
                            }
                            required
                        />
                        <Input
                            placeholder="Год"
                            value={expYear}
                            onChange={(event) => setExpYear(event.target.value)}
                            required
                        />
                    </div>
                    <Input
                        placeholder="CVV"
                        value={cvv}
                        onChange={(event) => setCvv(event.target.value)}
                        required
                    />

                    {selected ? (
                        <p className="text-sm text-muted-foreground">
                            К списанию:{' '}
                            {formatMoney(
                                selected.billingAmount,
                                selected.currency,
                            )}
                        </p>
                    ) : null}
                    {message ? (
                        <p className="text-sm text-brand-dark">{message}</p>
                    ) : null}

                    <Button type="submit" className="w-full" disabled={sending}>
                        {sending ? 'Проводим платеж...' : 'Оплатить'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
