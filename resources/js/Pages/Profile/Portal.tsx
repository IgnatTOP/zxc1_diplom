import { PayNowForm } from '@/features/pay-now/ui/PayNowForm';
import { formatDate, formatMoney } from '@/shared/lib/utils';
import type { EnrollmentDto } from '@/shared/types/domain';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { router } from '@inertiajs/react';
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
            enrollments.map((item) => ({
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

    return (
        <SiteLayout meta={meta}>
            <div className="space-y-6">
                <Reveal>
                    <section className="grid gap-4 lg:grid-cols-3">
                        <Card>
                            <CardContent className="p-5">
                                <p className="text-sm text-muted-foreground">
                                    Активные группы
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {
                                        enrollments.filter(
                                            (item) => item.status === 'active',
                                        ).length
                                    }
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5">
                                <p className="text-sm text-muted-foreground">
                                    Ближайшие платежи
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {upcomingPayments.length}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="p-5">
                                <p className="text-sm text-muted-foreground">
                                    Новостей по вашим секциям
                                </p>
                                <p className="mt-2 text-3xl font-bold">
                                    {sectionNews.length}
                                </p>
                            </CardContent>
                        </Card>
                    </section>
                </Reveal>

                <Reveal delayMs={70}>
                    <Card className="border-brand/20 bg-brand/5">
                        <CardContent className="p-4 text-sm text-muted-foreground">
                            В кабинете вы можете вести несколько групп сразу,
                            быстро оплачивать занятия, отслеживать историю
                            платежей и общаться с поддержкой в правом нижнем
                            углу сайта.
                        </CardContent>
                    </Card>
                </Reveal>

                <Tabs defaultValue="groups">
                    <TabsList>
                        <TabsTrigger value="groups">Мои группы</TabsTrigger>
                        <TabsTrigger value="schedule">
                            Мое расписание
                        </TabsTrigger>
                        <TabsTrigger value="payments">Платежи</TabsTrigger>
                        <TabsTrigger value="news">Новости секций</TabsTrigger>
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
                                                className="rounded-xl border border-border p-3"
                                            >
                                                <div className="flex flex-wrap items-center justify-between gap-2">
                                                    <div>
                                                        <p className="font-medium">
                                                            {item.group?.name}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {item.section?.name}
                                                        </p>
                                                    </div>
                                                    <Badge
                                                        variant={
                                                            item.status ===
                                                            'active'
                                                                ? 'success'
                                                                : 'warning'
                                                        }
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </div>
                                                <p className="mt-2 text-sm text-muted-foreground">
                                                    Следующий платеж:{' '}
                                                    {formatDate(
                                                        item.next_payment_due_at,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
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
                                <div className="overflow-x-auto rounded-xl border border-border">
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
                                                    className="border-t border-border"
                                                >
                                                    <td className="px-4 py-3">
                                                        {item.day_of_week}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {String(
                                                            item.start_time,
                                                        ).slice(0, 5)}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.group?.name}
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        {item.instructor}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
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
                                                className="rounded-lg border border-border p-3"
                                            >
                                                <p className="font-medium">
                                                    {item.group?.name}
                                                </p>
                                                <p className="text-sm text-muted-foreground">
                                                    {formatDate(
                                                        item.next_payment_due_at,
                                                    )}
                                                </p>
                                                <p className="text-sm">
                                                    {formatMoney(
                                                        item.billing_amount_cents,
                                                        item.currency,
                                                    )}
                                                </p>
                                            </div>
                                        ))}
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
                                                className="rounded-lg border border-border p-3"
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-medium">
                                                        {formatMoney(
                                                            item.amount_cents,
                                                            item.currency,
                                                        )}
                                                    </p>
                                                    <Badge variant="success">
                                                        Успешно
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
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
                                            className="rounded-xl border border-border p-3"
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <h3 className="font-medium">
                                                    {item.title}
                                                </h3>
                                                <Badge variant="muted">
                                                    {item.section?.name}
                                                </Badge>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">
                                                {item.summary ||
                                                    'Подробнее в секции новостей.'}
                                            </p>
                                            <p className="mt-2 text-xs text-muted-foreground">
                                                {formatDate(item.published_at)}
                                            </p>
                                        </article>
                                    ))}
                                </Stagger>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </SiteLayout>
    );
}
