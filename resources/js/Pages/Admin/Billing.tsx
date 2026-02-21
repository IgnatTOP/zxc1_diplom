import { apiPatch } from '@/shared/api/http';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    AlertTriangle,
    CheckCircle2,
    CreditCard,
    Receipt,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';

/* ─── types ─── */
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

/* ─── helpers ─── */
function toDateTimeLocal(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function formatMoney(cents: number, currency = 'RUB'): string {
    const rub = Math.round(cents / 100);
    return `${rub.toLocaleString('ru-RU')} ${currency === 'RUB' ? '₽' : currency}`;
}

function formatShort(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function isDue(value?: string | null): boolean {
    if (!value) return false;
    const d = new Date(value);
    return !Number.isNaN(d.getTime()) && d < new Date();
}

function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Не удалось выполнить запрос.';
}

const enrollmentStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
    active: 'success',
    paused: 'warning',
    completed: 'muted',
    cancelled: 'destructive',
};

const paymentStatusVariant: Record<string, 'success' | 'warning' | 'destructive' | 'muted'> = {
    success: 'success',
    pending: 'warning',
    failed: 'destructive',
    refunded: 'muted',
};

/* ─── component ─── */
export default function Billing({ enrollments = [], payments = [] }: Props) {
    const [tab, setTab] = useState<'enrollments' | 'payments'>('enrollments');
    const [enrollmentList, setEnrollmentList] = useState(enrollments);
    const [paymentList, setPaymentList] = useState(payments);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [notice, setNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

    /* ── Stats ── */
    const totalBilled = useMemo(
        () => enrollmentList.reduce((s, e) => s + e.billing_amount_cents, 0),
        [enrollmentList],
    );
    const overdueCount = useMemo(
        () => enrollmentList.filter((e) => isDue(e.next_payment_due_at) && e.status === 'active').length,
        [enrollmentList],
    );
    const paidTotal = useMemo(
        () => paymentList.filter((p) => p.status === 'success').reduce((s, p) => s + p.amount_cents, 0),
        [paymentList],
    );

    /* ── Filtered ── */
    const filteredEnrollments = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return enrollmentList;
        return enrollmentList.filter((e) =>
            [e.user?.email, e.user?.name, e.group?.name, String(e.id)].join(' ').toLowerCase().includes(q),
        );
    }, [enrollmentList, query]);

    const filteredPayments = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return paymentList;
        return paymentList.filter((p) =>
            [p.user?.email, p.enrollment?.group?.name, String(p.id)].join(' ').toLowerCase().includes(q),
        );
    }, [paymentList, query]);

    /* ── Save enrollment ── */
    const saveEnrollment = async (item: EnrollmentItem) => {
        setSavingId(`e-${item.id}`);
        setNotice(null);
        try {
            const payload = await apiPatch<{ ok: boolean; item: EnrollmentItem }>(
                `/api/v1/admin/billing/enrollments/${item.id}`,
                {
                    status: item.status,
                    billingAmountCents: item.billing_amount_cents,
                    billingPeriodDays: item.billing_period_days,
                    currency: item.currency,
                    startedAt: toIsoDateTime(toDateTimeLocal(item.started_at)),
                    endedAt: toIsoDateTime(toDateTimeLocal(item.ended_at)),
                    nextPaymentDueAt: toIsoDateTime(toDateTimeLocal(item.next_payment_due_at)),
                },
            );
            setEnrollmentList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({ tone: 'success', text: `Начисление #${item.id} обновлено.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    /* ── Save payment ── */
    const savePayment = async (item: PaymentItem) => {
        setSavingId(`p-${item.id}`);
        setNotice(null);
        try {
            const payload = await apiPatch<{ ok: boolean; item: PaymentItem }>(
                `/api/v1/admin/billing/payments/${item.id}`,
                {
                    amountCents: item.amount_cents,
                    currency: item.currency,
                    status: item.status,
                    dueAt: toIsoDateTime(toDateTimeLocal(item.due_at)),
                    paidAt: toIsoDateTime(toDateTimeLocal(item.paid_at)),
                    gateway: item.gateway || null,
                },
            );
            setPaymentList((prev) =>
                prev.map((row) => (row.id === item.id ? payload.item : row)),
            );
            setNotice({ tone: 'success', text: `Транзакция #${item.id} обновлена.` });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Биллинг">
            {notice && (
                <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
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
            )}

            {/* ─── Summary Stats ─── */}
            <div className="grid gap-3 sm:grid-cols-3">
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                            <CreditCard className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <p className="font-title text-xl font-bold">
                                {formatMoney(totalBilled)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Начислено всего
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                            <Receipt className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div>
                            <p className="font-title text-xl font-bold">
                                {formatMoney(paidTotal)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Оплачено
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="font-title text-xl font-bold">
                                {overdueCount}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Просрочено
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* ─── Tabs + Search ─── */}
            <Card>
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex gap-1 rounded-xl bg-surface p-1">
                        <button
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'enrollments'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setTab('enrollments')}
                        >
                            Начисления ({enrollmentList.length})
                        </button>
                        <button
                            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'payments'
                                    ? 'bg-card text-foreground shadow-sm'
                                    : 'text-muted-foreground hover:text-foreground'
                                }`}
                            onClick={() => setTab('payments')}
                        >
                            Транзакции ({paymentList.length})
                        </button>
                    </div>
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            className="pl-9"
                            value={query}
                            placeholder="Поиск..."
                            onChange={(e) => setQuery(e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* ─── Enrollments ─── */}
            {tab === 'enrollments' && (
                <div className="grid gap-3 xl:grid-cols-2">
                    {filteredEnrollments.map((item) => (
                        <Card
                            key={item.id}
                            className={`overflow-hidden transition-shadow hover:shadow-md ${isDue(item.next_payment_due_at) && item.status === 'active'
                                    ? 'border-l-4 border-l-amber-400'
                                    : ''
                                }`}
                        >
                            <CardContent className="space-y-3 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Начисление #{item.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.user?.email || '—'} · {item.group?.name || '—'}
                                        </p>
                                    </div>
                                    <Badge variant={enrollmentStatusVariant[item.status] || 'muted'}>
                                        {item.status}
                                    </Badge>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Статус</label>
                                        <AdminSelect
                                            value={item.status}
                                            onChange={(e) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, status: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        >
                                            <option value="active">active</option>
                                            <option value="paused">paused</option>
                                            <option value="completed">completed</option>
                                            <option value="cancelled">cancelled</option>
                                        </AdminSelect>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">
                                            Сумма (коп.) / Период (дн.)
                                        </label>
                                        <div className="flex gap-2">
                                            <Input
                                                type="number"
                                                value={item.billing_amount_cents}
                                                onChange={(e) =>
                                                    setEnrollmentList((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? { ...row, billing_amount_cents: Number(e.target.value) }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                            <Input
                                                type="number"
                                                className="w-20"
                                                value={item.billing_period_days}
                                                onChange={(e) =>
                                                    setEnrollmentList((prev) =>
                                                        prev.map((row) =>
                                                            row.id === item.id
                                                                ? { ...row, billing_period_days: Number(e.target.value) }
                                                                : row,
                                                        ),
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Начало</label>
                                        <Input
                                            type="datetime-local"
                                            value={toDateTimeLocal(item.started_at)}
                                            onChange={(e) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, started_at: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Окончание</label>
                                        <Input
                                            type="datetime-local"
                                            value={toDateTimeLocal(item.ended_at)}
                                            onChange={(e) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, ended_at: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">
                                            След. оплата{' '}
                                            {isDue(item.next_payment_due_at) && item.status === 'active' && (
                                                <span className="text-amber-500">⚠ просрочено</span>
                                            )}
                                        </label>
                                        <Input
                                            type="datetime-local"
                                            value={toDateTimeLocal(item.next_payment_due_at)}
                                            onChange={(e) =>
                                                setEnrollmentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, next_payment_due_at: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        {formatMoney(item.billing_amount_cents, item.currency)} / {item.billing_period_days} дн.
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingId === `e-${item.id}`}
                                        onClick={() => saveEnrollment(item)}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredEnrollments.length === 0 && (
                        <Card className="xl:col-span-2">
                            <CardContent className="py-10 text-center text-muted-foreground">
                                {enrollmentList.length === 0
                                    ? 'Начислений нет.'
                                    : 'По фильтру ничего не найдено.'}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}

            {/* ─── Payments ─── */}
            {tab === 'payments' && (
                <div className="grid gap-3 xl:grid-cols-2">
                    {filteredPayments.map((item) => (
                        <Card
                            key={item.id}
                            className="overflow-hidden transition-shadow hover:shadow-md"
                        >
                            <CardContent className="space-y-3 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <div>
                                        <p className="text-sm font-semibold">
                                            Транзакция #{item.id}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.user?.email || '—'} · {item.enrollment?.group?.name || '—'}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Badge variant={paymentStatusVariant[item.status] || 'muted'}>
                                            {item.status}
                                        </Badge>
                                        {(item.gateway === 'mock' || !item.gateway) && (
                                            <Badge variant="warning">Demo</Badge>
                                        )}
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Сумма (коп.)</label>
                                        <Input
                                            type="number"
                                            value={item.amount_cents}
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, amount_cents: Number(e.target.value) }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Статус</label>
                                        <AdminSelect
                                            value={item.status}
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, status: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        >
                                            <option value="success">success</option>
                                            <option value="pending">pending</option>
                                            <option value="failed">failed</option>
                                            <option value="refunded">refunded</option>
                                        </AdminSelect>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Дата начисления</label>
                                        <Input
                                            type="datetime-local"
                                            value={toDateTimeLocal(item.due_at)}
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, due_at: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Дата оплаты</label>
                                        <Input
                                            type="datetime-local"
                                            value={toDateTimeLocal(item.paid_at)}
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, paid_at: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Валюта</label>
                                        <AdminSelect
                                            value={item.currency}
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, currency: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        >
                                            <option value="RUB">RUB</option>
                                            <option value="USD">USD</option>
                                            <option value="EUR">EUR</option>
                                        </AdminSelect>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">Gateway</label>
                                        <Input
                                            value={item.gateway || ''}
                                            placeholder="mock"
                                            onChange={(e) =>
                                                setPaymentList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? { ...row, gateway: e.target.value }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        {formatMoney(item.amount_cents, item.currency)} · {formatShort(item.paid_at)}
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingId === `p-${item.id}`}
                                        onClick={() => savePayment(item)}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {filteredPayments.length === 0 && (
                        <Card className="xl:col-span-2">
                            <CardContent className="py-10 text-center text-muted-foreground">
                                {paymentList.length === 0
                                    ? 'Транзакций нет.'
                                    : 'По фильтру ничего не найдено.'}
                            </CardContent>
                        </Card>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
