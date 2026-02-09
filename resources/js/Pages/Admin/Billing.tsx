import { apiPatch } from '@/shared/api/http';
import { formatDate, formatMoney } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { useMemo, useState } from 'react';

type EnrollmentItem = {
    id: number;
    status: string;
    started_at?: string | null;
    ended_at?: string | null;
    next_payment_due_at?: string | null;
    billing_amount_cents: number;
    billing_period_days: number;
    currency: string;
    user?: { name?: string | null; email: string };
    group?: { name: string };
};

type PaymentItem = {
    id: number;
    amount_cents: number;
    currency: string;
    status: string;
    due_at?: string | null;
    paid_at?: string | null;
    gateway?: string | null;
    user?: { email: string };
    enrollment?: { group?: { name: string } };
};

type Props = {
    enrollments: EnrollmentItem[];
    payments: PaymentItem[];
};

function toDateTimeLocal(value?: string | null): string {
    if (!value) {
        return '';
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
        return '';
    }

    const local = new Date(
        parsed.getTime() - parsed.getTimezoneOffset() * 60000,
    );
    return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
    if (!value) {
        return null;
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function normalizeEnrollment(item: EnrollmentItem): EnrollmentItem {
    return {
        ...item,
        started_at: toDateTimeLocal(item.started_at),
        ended_at: toDateTimeLocal(item.ended_at),
        next_payment_due_at: toDateTimeLocal(item.next_payment_due_at),
    };
}

function normalizePayment(item: PaymentItem): PaymentItem {
    return {
        ...item,
        due_at: toDateTimeLocal(item.due_at),
        paid_at: toDateTimeLocal(item.paid_at),
        gateway: item.gateway || '',
    };
}

function getDueStatus(nextPaymentDate?: string | null) {
    if (!nextPaymentDate) {
        return { label: 'Дата не указана', tone: 'muted' as const };
    }

    const now = new Date();
    const dueDate = new Date(nextPaymentDate);
    const diffDays =
        (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays < 0) {
        return { label: 'Просрочен', tone: 'destructive' as const };
    }
    if (diffDays <= 7) {
        return { label: 'Скоро платеж', tone: 'warning' as const };
    }
    return { label: 'По графику', tone: 'success' as const };
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

export default function Billing({ enrollments, payments }: Props) {
    const [enrollmentList, setEnrollmentList] = useState<EnrollmentItem[]>(() =>
        enrollments.map(normalizeEnrollment),
    );
    const [paymentList, setPaymentList] = useState<PaymentItem[]>(() =>
        payments.map(normalizePayment),
    );
    const [query, setQuery] = useState('');
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const filteredEnrollments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return enrollmentList;
        }

        return enrollmentList.filter((item) =>
            [item.user?.email, item.group?.name, item.status]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [enrollmentList, query]);

    const filteredPayments = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase();
        if (!normalizedQuery) {
            return paymentList;
        }

        return paymentList.filter((item) =>
            [item.user?.email, item.enrollment?.group?.name, item.status]
                .join(' ')
                .toLowerCase()
                .includes(normalizedQuery),
        );
    }, [paymentList, query]);

    const saveEnrollment = async (item: EnrollmentItem) => {
        setNotice(null);
        setSavingKey(`enrollment-${item.id}`);

        try {
            const payload = await apiPatch<{
                ok: boolean;
                item: EnrollmentItem;
            }>(`/api/v1/admin/billing/enrollments/${item.id}`, {
                status: item.status,
                startedAt: toIsoDateTime(item.started_at || ''),
                endedAt: toIsoDateTime(item.ended_at || ''),
                nextPaymentDueAt: toIsoDateTime(item.next_payment_due_at || ''),
                billingAmountCents: item.billing_amount_cents,
                billingPeriodDays: item.billing_period_days,
                currency: item.currency,
            });

            setEnrollmentList((prev) =>
                prev.map((row) =>
                    row.id === item.id
                        ? normalizeEnrollment(payload.item)
                        : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Начисление #${item.id} обновлено.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };

    const savePayment = async (item: PaymentItem) => {
        setNotice(null);
        setSavingKey(`payment-${item.id}`);

        try {
            const payload = await apiPatch<{ ok: boolean; item: PaymentItem }>(
                `/api/v1/admin/billing/payments/${item.id}`,
                {
                    amountCents: item.amount_cents,
                    currency: item.currency,
                    status: item.status,
                    dueAt: toIsoDateTime(item.due_at || ''),
                    paidAt: toIsoDateTime(item.paid_at || ''),
                    gateway: item.gateway || null,
                },
            );

            setPaymentList((prev) =>
                prev.map((row) =>
                    row.id === item.id ? normalizePayment(payload.item) : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Платёж #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <AdminLayout title="Биллинг">
            <Card>
                <CardContent className="flex flex-col gap-3 pt-6 lg:flex-row lg:items-center lg:justify-between">
                    <p className="text-sm text-muted-foreground">
                        Записей по начислениям: {enrollmentList.length} ·
                        Транзакций: {paymentList.length}
                    </p>
                    <Input
                        className="max-w-md"
                        value={query}
                        placeholder="Поиск по email, группе, статусу"
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </CardContent>
            </Card>

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

            <div className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Начисления и абонементы</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {filteredEnrollments.map((item) => {
                            const dueStatus = getDueStatus(
                                item.next_payment_due_at,
                            );

                            return (
                                <div
                                    key={item.id}
                                    className="space-y-2 rounded-xl border border-border p-3"
                                >
                                    <div className="flex items-start justify-between gap-2">
                                        <div>
                                            <p className="font-medium">
                                                {item.user?.email}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.group?.name ||
                                                    'Без группы'}
                                            </p>
                                        </div>
                                        <Badge variant={dueStatus.tone}>
                                            {dueStatus.label}
                                        </Badge>
                                    </div>
                                    <p className="text-sm">
                                        {formatMoney(
                                            item.billing_amount_cents,
                                            item.currency,
                                        )}
                                    </p>
                                    <div className="grid gap-2 md:grid-cols-2">
                                        <select
                                            className="h-10 rounded-lg border border-border px-2"
                                            value={item.status}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  status: event
                                                                      .target
                                                                      .value,
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        >
                                            <option value="active">
                                                Активен
                                            </option>
                                            <option value="paused">
                                                На паузе
                                            </option>
                                            <option value="completed">
                                                Завершён
                                            </option>
                                            <option value="cancelled">
                                                Отменён
                                            </option>
                                        </select>
                                        <Input
                                            value={item.currency}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  currency:
                                                                      event.target.value.toUpperCase(),
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={item.billing_amount_cents}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  billing_amount_cents:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        <Input
                                            type="number"
                                            value={item.billing_period_days}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  billing_period_days:
                                                                      Number(
                                                                          event
                                                                              .target
                                                                              .value,
                                                                      ),
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        <Input
                                            type="datetime-local"
                                            value={item.started_at || ''}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  started_at:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        <Input
                                            type="datetime-local"
                                            value={item.ended_at || ''}
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  ended_at:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                        <Input
                                            className="md:col-span-2"
                                            type="datetime-local"
                                            value={
                                                item.next_payment_due_at || ''
                                            }
                                            onChange={(event) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                  ...row,
                                                                  next_payment_due_at:
                                                                      event
                                                                          .target
                                                                          .value,
                                                              }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Срок оплаты:{' '}
                                        {formatDate(item.next_payment_due_at)}
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={
                                            savingKey ===
                                            `enrollment-${item.id}`
                                        }
                                        onClick={() => saveEnrollment(item)}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            );
                        })}
                        {filteredEnrollments.length === 0 ? (
                            <p className="rounded-lg border border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                Данные по начислениям не найдены.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Транзакции</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {filteredPayments.map((item) => (
                            <div
                                key={item.id}
                                className="space-y-2 rounded-xl border border-border p-3"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <p className="font-medium">
                                            {item.user?.email}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.enrollment?.group?.name ||
                                                'Без группы'}
                                        </p>
                                    </div>
                                    <Badge variant="muted">{item.status}</Badge>
                                </div>
                                <p className="text-sm">
                                    {formatMoney(
                                        item.amount_cents,
                                        item.currency,
                                    )}
                                </p>
                                <div className="grid gap-2 md:grid-cols-2">
                                    <Input
                                        type="number"
                                        value={item.amount_cents}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              amount_cents:
                                                                  Number(
                                                                      event
                                                                          .target
                                                                          .value,
                                                                  ),
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        value={item.currency}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              currency:
                                                                  event.target.value.toUpperCase(),
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <select
                                        className="h-10 rounded-lg border border-border px-2"
                                        value={item.status}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
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
                                        <option value="success">Успешно</option>
                                        <option value="pending">
                                            В обработке
                                        </option>
                                        <option value="failed">Ошибка</option>
                                        <option value="refunded">
                                            Возврат
                                        </option>
                                    </select>
                                    <Input
                                        value={item.gateway || ''}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              gateway:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="datetime-local"
                                        value={item.due_at || ''}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              due_at: event
                                                                  .target.value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                    <Input
                                        type="datetime-local"
                                        value={item.paid_at || ''}
                                        onChange={(event) =>
                                            setPaymentList((prev) =>
                                                prev.map((row) =>
                                                    row.id === item.id
                                                        ? {
                                                              ...row,
                                                              paid_at:
                                                                  event.target
                                                                      .value,
                                                          }
                                                        : row,
                                                ),
                                            )
                                        }
                                    />
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Оплачен: {formatDate(item.paid_at)}
                                </p>
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={
                                        savingKey === `payment-${item.id}`
                                    }
                                    onClick={() => savePayment(item)}
                                >
                                    Сохранить
                                </Button>
                            </div>
                        ))}
                        {filteredPayments.length === 0 ? (
                            <p className="rounded-lg border border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                Транзакции не найдены.
                            </p>
                        ) : null}
                    </CardContent>
                </Card>
            </div>
        </AdminLayout>
    );
}
