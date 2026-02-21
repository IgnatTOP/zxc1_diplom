import { PayNowForm } from '@/features/pay-now/ui/PayNowForm';
import { formatDate, formatMoney } from '@/shared/lib/utils';
import type { EnrollmentDto } from '@/shared/types/domain';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { router } from '@inertiajs/react';
import {
    CalendarDays,
    Clock,
    CreditCard,
    Layers,
    Newspaper,
    Sparkles,
} from 'lucide-react';
import { useMemo } from 'react';

type Enrollment = {
    id: number;
    group_id: number;
    section_id: number;
    status: string;
    next_payment_due_at: string | null;
    billing_amount_cents: number;
    billing_period_days: number;
    currency: string;
    group?: { id: number; name: string };
    section?: { id: number; name: string };
};

type Props = {
    enrollments: Enrollment[];
    schedule: Array<{
        id: number;
        day_of_week: string;
        start_time: string;
        instructor: string;
        group?: { id: number; name: string };
    }>;
    payments: Array<{
        id: number;
        amount_cents: number;
        currency: string;
        paid_at: string | null;
        payment_method?: {
            brand?: string | null;
            last4?: string | null;
        } | null;
        enrollment?: { group?: { name?: string } | null } | null;
    }>;
    upcomingPayments: Enrollment[];
    sectionNews: Array<{
        id: number;
        title: string;
        summary?: string | null;
        published_at?: string | null;
        section?: { name: string };
    }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Portal({
    enrollments,
    schedule,
    payments,
    upcomingPayments,
    sectionNews,
    meta,
}: Props) {
    const paymentEnrollments = useMemo<EnrollmentDto[]>(
        () =>
            enrollments
                .filter((item) => item.status === 'active')
                .map((item) => ({
                    id: item.id,
                    groupId: item.group_id,
                    groupName: item.group?.name || `Группа #${item.group_id}`,
                    sectionId: item.section_id,
                    sectionName: item.section?.name || `Секция #${item.section_id}`,
                    nextPaymentDueAt: item.next_payment_due_at,
                    billingAmount: item.billing_amount_cents,
                    currency: item.currency,
                    status: item.status,
                })),
        [enrollments],
    );

    const activeCount = enrollments.filter(
        (item) => item.status === 'active',
    ).length;

    return (
        <SiteLayout meta={meta}>
            <div className="space-y-6">
                {/* ─── Hero ─── */}
                <Reveal>
                    <div className="rounded-2xl bg-gradient-to-br from-brand/10 via-brand/5 to-transparent p-6 lg:p-8">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/15">
                                <Sparkles className="h-5 w-5 text-brand-dark" />
                            </div>
                            <div>
                                <h1 className="font-title text-xl font-bold tracking-tight lg:text-2xl">
                                    Личный кабинет
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Управляйте занятиями, оплатой и расписанием
                                </p>
                            </div>
                        </div>
                    </div>
                </Reveal>

                {/* ─── Stats ─── */}
                <Reveal delayMs={50}>
                    <section className="grid gap-3 sm:grid-cols-3">
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-3 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950/40">
                                    <Layers className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <p className="font-title text-2xl font-bold">
                                        {activeCount}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Активные группы
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-3 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-950/40">
                                    <CreditCard className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <p className="font-title text-2xl font-bold">
                                        {upcomingPayments.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Ближайшие платежи
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="transition-shadow hover:shadow-md">
                            <CardContent className="flex items-center gap-3 p-5">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950/40">
                                    <Newspaper className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-title text-2xl font-bold">
                                        {sectionNews.length}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Новости секций
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </section>
                </Reveal>

                {/* ─── Tabs ─── */}
                <Tabs defaultValue="groups">
                    <TabsList>
                        <TabsTrigger value="groups">Мои группы</TabsTrigger>
                        <TabsTrigger value="schedule">
                            Моё расписание
                        </TabsTrigger>
                        <TabsTrigger value="payments">Платежи</TabsTrigger>
                        <TabsTrigger value="news">Новости</TabsTrigger>
                    </TabsList>

                    <TabsContent value="groups">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Привязка к группам</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Stagger>
                                        {enrollments.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-border/80 p-3 transition-shadow hover:shadow-sm"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="text-sm font-semibold">
                                                            {item.group?.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {item.section?.name}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            item.status === 'active'
                                                                ? 'success'
                                                                : item.status === 'pending'
                                                                    ? 'warning'
                                                                    : 'muted'
                                                        }
                                                    >
                                                        {item.status === 'active' && '✅ Активно'}
                                                        {item.status === 'pending' && (
                                                            <><Clock className="mr-1 h-3 w-3" /> Ожидает подтверждения</>
                                                        )}
                                                        {item.status === 'cancelled' && 'Отменено'}
                                                        {!['active', 'pending', 'cancelled'].includes(item.status) && item.status}
                                                    </Badge>
                                                </div>
                                                {item.status === 'pending' && (
                                                    <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">
                                                        Администратор подтвердит вашу запись в ближайшее время
                                                    </p>
                                                )}
                                                {item.status === 'active' && item.next_payment_due_at && (
                                                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                                                        <CalendarDays className="h-3 w-3" />
                                                        Следующий платеж:{' '}
                                                        {formatDate(
                                                            item.next_payment_due_at,
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                        {enrollments.length === 0 && (
                                            <div className="space-y-2 py-6 text-center">
                                                <p className="text-sm text-muted-foreground">
                                                    Вы пока не записаны ни в одну группу.
                                                </p>
                                                <p className="text-xs text-muted-foreground/80">
                                                    Перейдите на страницу{' '}
                                                    <a href="/directions" className="font-medium text-brand-dark underline underline-offset-2">Направления</a>{' '}
                                                    и нажмите «Записаться»
                                                </p>
                                            </div>
                                        )}
                                    </Stagger>
                                </CardContent>
                            </Card>

                            <PayNowForm
                                enrollments={paymentEnrollments}
                                onSuccess={() =>
                                    router.reload({
                                        only: [
                                            'enrollments',
                                            'payments',
                                            'upcomingPayments',
                                        ],
                                    })
                                }
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="schedule">
                        <Card>
                            <CardHeader>
                                <CardTitle>Персональное расписание</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {schedule.length > 0 ? (
                                    <div className="overflow-x-auto rounded-xl border border-border/80">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-surface/70 text-xs uppercase text-muted-foreground">
                                                <tr>
                                                    <th className="px-4 py-3">
                                                        День
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Время
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Группа
                                                    </th>
                                                    <th className="px-4 py-3">
                                                        Тренер
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {schedule.map((item) => (
                                                    <tr
                                                        key={item.id}
                                                        className="border-t border-border/60 transition-colors hover:bg-brand/5"
                                                    >
                                                        <td className="px-4 py-3 font-medium">
                                                            {item.day_of_week}
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            <Badge variant="muted">
                                                                {String(
                                                                    item.start_time,
                                                                ).slice(0, 5)}
                                                            </Badge>
                                                        </td>
                                                        <td className="px-4 py-3">
                                                            {item.group?.name}
                                                        </td>
                                                        <td className="px-4 py-3 text-muted-foreground">
                                                            {item.instructor}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="py-6 text-center text-sm text-muted-foreground">
                                        Расписание пока пустое.
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="payments">
                        <div className="grid gap-4 lg:grid-cols-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Ближайшие платежи</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Stagger>
                                        {upcomingPayments.map((item) => (
                                            <div
                                                key={item.id}
                                                className="flex items-center justify-between rounded-xl border border-border/80 p-3"
                                            >
                                                <div>
                                                    <p className="text-sm font-semibold">
                                                        {item.group?.name}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {formatDate(
                                                            item.next_payment_due_at,
                                                        )}
                                                    </p>
                                                </div>
                                                <span className="font-title text-sm font-bold">
                                                    {formatMoney(
                                                        item.billing_amount_cents,
                                                        item.currency,
                                                    )}
                                                </span>
                                            </div>
                                        ))}
                                        {upcomingPayments.length === 0 && (
                                            <p className="py-6 text-center text-sm text-muted-foreground">
                                                Нет предстоящих платежей.
                                            </p>
                                        )}
                                    </Stagger>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>История оплат</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Stagger>
                                        {payments.map((item) => (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-border/80 p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-semibold">
                                                        {formatMoney(
                                                            item.amount_cents,
                                                            item.currency,
                                                        )}
                                                    </p>
                                                    <Badge variant="success">
                                                        Успешно
                                                    </Badge>
                                                </div>
                                                <p className="mt-1 text-xs text-muted-foreground">
                                                    {formatDate(item.paid_at)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.payment_method
                                                        ?.brand || 'card'}{' '}
                                                    ••••{' '}
                                                    {item.payment_method
                                                        ?.last4 || '----'}
                                                </p>
                                            </div>
                                        ))}
                                        {payments.length === 0 && (
                                            <p className="py-6 text-center text-sm text-muted-foreground">
                                                История оплат пуста.
                                            </p>
                                        )}
                                    </Stagger>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="news">
                        <Card>
                            <CardHeader>
                                <CardTitle>Новости секций</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Stagger>
                                    {sectionNews.map((item) => (
                                        <article
                                            key={item.id}
                                            className="rounded-xl border border-border/80 p-3 transition-shadow hover:shadow-sm"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="text-sm font-semibold">
                                                    {item.title}
                                                </h3>
                                                <Badge variant="muted">
                                                    {item.section?.name}
                                                </Badge>
                                            </div>
                                            <p className="mt-1.5 text-sm text-muted-foreground">
                                                {item.summary ||
                                                    'Подробнее в секции новостей.'}
                                            </p>
                                            <p className="mt-1 text-xs text-muted-foreground">
                                                {formatDate(item.published_at)}
                                            </p>
                                        </article>
                                    ))}
                                    {sectionNews.length === 0 && (
                                        <p className="py-6 text-center text-sm text-muted-foreground">
                                            Новостей пока нет.
                                        </p>
                                    )}
                                </Stagger>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SiteLayout>
    );
}
