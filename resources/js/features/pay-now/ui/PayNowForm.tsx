import { apiPost } from '@/shared/api/http';
import { formatMoney } from '@/shared/lib/utils';
import type { EnrollmentDto } from '@/shared/types/domain';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import {
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Lock,
    XCircle,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';

type Props = {
    enrollments: EnrollmentDto[];
    onSuccess: () => void;
};

function getPaymentErrorMessage(error: unknown): string {
    if (!(error instanceof Error)) {
        return 'Ошибка оплаты. Проверьте данные карты.';
    }

    const payloadMatch = error.message.match(/\{[\s\S]*\}$/);
    if (!payloadMatch) {
        return 'Ошибка оплаты. Проверьте данные карты.';
    }

    try {
        const payload = JSON.parse(payloadMatch[0]) as {
            message?: string;
            errors?: Record<string, string[]>;
        };
        const firstFieldError = payload.errors
            ? Object.values(payload.errors).flat()[0]
            : null;

        return firstFieldError || payload.message || 'Ошибка оплаты. Проверьте данные карты.';
    } catch {
        return 'Ошибка оплаты. Проверьте данные карты.';
    }
}

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
    const [result, setResult] = useState<{
        type: 'success' | 'error';
        text: string;
    } | null>(null);

    const selected = useMemo(
        () => enrollments.find((item) => item.id === enrollmentId) ?? null,
        [enrollmentId, enrollments],
    );

    const normalizedExpYear = useMemo(() => {
        const raw = Number(expYear);
        if (!Number.isFinite(raw)) {
            return raw;
        }
        if (raw >= 0 && raw <= 99) {
            return 2000 + raw;
        }
        return raw;
    }, [expYear]);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        if (!enrollmentId) {
            return;
        }

        setSending(true);
        setResult(null);

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
                expYear: normalizedExpYear,
                cvv,
            });

            setResult({
                type: 'success',
                text: `Платеж #${response.paymentId} успешно проведен.`,
            });
            setCardNumber('');
            setCardHolder('');
            setExpMonth('');
            setExpYear('');
            setCvv('');
            onSuccess();
        } catch (error) {
            setResult({
                type: 'error',
                text: getPaymentErrorMessage(error),
            });
        } finally {
            setSending(false);
        }
    };

    return (
        <Card className="overflow-hidden">
            <CardHeader className="space-y-3 pb-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                            <CreditCard className="h-4 w-4 text-brand-dark" />
                        </div>
                        <CardTitle>Оплата занятий</CardTitle>
                    </div>
                    <Badge variant="warning">
                        <AlertTriangle className="mr-1 h-3 w-3" />
                        Demo
                    </Badge>
                </div>
                {/* ── Demo Banner ── */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 px-3.5 py-2.5 dark:border-amber-800/40 dark:bg-amber-950/30">
                    <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                        Демо-режим оплаты
                    </p>
                    <p className="mt-0.5 text-[11px] text-amber-600/80 dark:text-amber-500/80">
                        Это тестовый платёжный шлюз. Реальные деньги не
                        списываются. Можно вводить любые данные карты.
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                <form className="space-y-3" onSubmit={submit}>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Группа
                        </label>
                        <select
                            className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm transition-colors focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
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
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Номер карты
                        </label>
                        <Input
                            placeholder="0000 0000 0000 0000"
                            value={cardNumber}
                            onChange={(event) =>
                                setCardNumber(event.target.value)
                            }
                            required
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium text-muted-foreground">
                            Держатель карты
                        </label>
                        <Input
                            placeholder="IVAN PETROV"
                            value={cardHolder}
                            onChange={(event) =>
                                setCardHolder(event.target.value)
                            }
                            required
                        />
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Месяц
                            </label>
                            <Input
                                placeholder="MM"
                                value={expMonth}
                                onChange={(event) =>
                                    setExpMonth(event.target.value)
                                }
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                Год
                            </label>
                            <Input
                                placeholder="YY или YYYY"
                                value={expYear}
                                onChange={(event) =>
                                    setExpYear(event.target.value)
                                }
                                inputMode="numeric"
                                maxLength={4}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-muted-foreground">
                                CVV
                            </label>
                            <Input
                                type="password"
                                placeholder="•••"
                                value={cvv}
                                onChange={(event) => setCvv(event.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {selected && (
                        <div className="rounded-xl bg-surface/60 px-3 py-2.5 text-sm">
                            К списанию:{' '}
                            <span className="font-semibold text-foreground">
                                {formatMoney(
                                    selected.billingAmount,
                                    selected.currency,
                                )}
                            </span>
                        </div>
                    )}

                    {result && (
                        <div
                            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium ${result.type === 'success'
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                                    : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                                }`}
                        >
                            {result.type === 'success' ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0" />
                            ) : (
                                <XCircle className="h-4 w-4 shrink-0" />
                            )}
                            {result.text}
                        </div>
                    )}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={sending}
                    >
                        <Lock className="mr-1.5 h-3.5 w-3.5" />
                        {sending ? 'Проводим платеж...' : 'Оплатить (Demo)'}
                    </Button>

                    <p className="text-center text-[11px] text-muted-foreground">
                        <Lock className="mr-0.5 inline h-3 w-3" />
                        Все данные зашифрованы · Демо-шлюз
                    </p>
                </form>
            </CardContent>
        </Card>
    );
}
