import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    CreditCard,
    Headphones,
    Image,
    Layers,
    LayoutDashboard,
    MessageSquare,
    Sparkles,
    Users,
} from 'lucide-react';

type QuickLink = {
    icon: typeof LayoutDashboard;
    title: string;
    description: string;
    href: string;
    color: string;
    bgColor: string;
};

type Stat = {
    icon: typeof Users;
    label: string;
    value: number | string;
    color: string;
    bgColor: string;
    href?: string;
};

type Props = {
    stats: {
        applications: number;
        support: number;
        users: number;
        enrollments: number;
        groups: number;
        sections: number;
        schedule: number;
        gallery: number;
        news: number;
    };
};

export default function Dashboard({ stats }: Props) {
    const statItems: Stat[] = [
        {
            icon: MessageSquare,
            label: 'Заявки',
            value: stats.applications,
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-950/40',
            href: '/admin/applications',
        },
        {
            icon: Headphones,
            label: 'Поддержка',
            value: stats.support,
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-950/40',
            href: '/admin/support',
        },
        {
            icon: Users,
            label: 'Пользователи',
            value: stats.users,
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-100 dark:bg-violet-950/40',
            href: '/admin/users',
        },
        {
            icon: CreditCard,
            label: 'Записи',
            value: stats.enrollments,
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
            href: '/admin/billing',
        },
        {
            icon: Layers,
            label: 'Группы',
            value: stats.groups,
            color: 'text-pink-600 dark:text-pink-400',
            bgColor: 'bg-pink-100 dark:bg-pink-950/40',
            href: '/admin/groups',
        },
        {
            icon: Sparkles,
            label: 'Секции',
            value: stats.sections,
            color: 'text-brand-dark',
            bgColor: 'bg-brand/10',
            href: '/admin/sections',
        },
        {
            icon: CalendarDays,
            label: 'Расписание',
            value: stats.schedule,
            color: 'text-teal-600 dark:text-teal-400',
            bgColor: 'bg-teal-100 dark:bg-teal-950/40',
            href: '/admin/schedule',
        },
        {
            icon: Image,
            label: 'Галерея',
            value: stats.gallery,
            color: 'text-orange-600 dark:text-orange-400',
            bgColor: 'bg-orange-100 dark:bg-orange-950/40',
            href: '/admin/gallery',
        },
        {
            icon: BookOpen,
            label: 'Новости',
            value: stats.news,
            color: 'text-cyan-600 dark:text-cyan-400',
            bgColor: 'bg-cyan-100 dark:bg-cyan-950/40',
            href: '/admin/section-news',
        },
    ];

    const quickLinks: QuickLink[] = [
        {
            icon: MessageSquare,
            title: 'Проверить заявки',
            description: 'Новые заявки на запись в студию',
            href: '/admin/applications',
            color: 'text-blue-600 dark:text-blue-400',
            bgColor: 'bg-blue-100 dark:bg-blue-950/40',
        },
        {
            icon: Headphones,
            title: 'Ответить на обращения',
            description: 'Чат поддержки пользователей',
            href: '/admin/support',
            color: 'text-amber-600 dark:text-amber-400',
            bgColor: 'bg-amber-100 dark:bg-amber-950/40',
        },
        {
            icon: Users,
            title: 'Управление учениками',
            description: 'Роли, данные, фильтры',
            href: '/admin/users',
            color: 'text-violet-600 dark:text-violet-400',
            bgColor: 'bg-violet-100 dark:bg-violet-950/40',
        },
        {
            icon: CreditCard,
            title: 'Биллинг и оплата',
            description: 'Начисления и транзакции',
            href: '/admin/billing',
            color: 'text-emerald-600 dark:text-emerald-400',
            bgColor: 'bg-emerald-100 dark:bg-emerald-950/40',
        },
    ];

    return (
        <AdminLayout title="Дашборд">
            {/* ─── Stats Grid ─── */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {statItems.map((item) => {
                    const Icon = item.icon;
                    const inner = (
                        <Card
                            className="group transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
                        >
                            <CardContent className="flex items-center gap-4 p-5">
                                <div
                                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${item.bgColor}`}
                                >
                                    <Icon className={`h-5 w-5 ${item.color}`} />
                                </div>
                                <div className="flex-1">
                                    <p className="font-title text-2xl font-bold">
                                        {item.value}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {item.label}
                                    </p>
                                </div>
                                {item.href && (
                                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                                )}
                            </CardContent>
                        </Card>
                    );

                    return item.href ? (
                        <Link key={item.label} href={item.href}>
                            {inner}
                        </Link>
                    ) : (
                        <div key={item.label}>{inner}</div>
                    );
                })}
            </div>

            {/* ─── Quick Start ─── */}
            <div className="mt-6">
                <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                        <LayoutDashboard className="h-4.5 w-4.5 text-brand-dark" />
                    </div>
                    <div>
                        <h2 className="font-title text-lg font-semibold">
                            Быстрый старт
                        </h2>
                        <p className="text-xs text-muted-foreground">
                            Основные действия для управления студией
                        </p>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {quickLinks.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Link key={item.title} href={item.href}>
                                <Card className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                                    <CardContent className="flex items-start gap-3 p-5">
                                        <div
                                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.bgColor}`}
                                        >
                                            <Icon
                                                className={`h-5 w-5 ${item.color}`}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-sm font-semibold transition-colors group-hover:text-brand-dark">
                                                {item.title}
                                            </h3>
                                            <p className="mt-0.5 text-xs text-muted-foreground">
                                                {item.description}
                                            </p>
                                        </div>
                                        <ArrowRight className="mt-1 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                                    </CardContent>
                                </Card>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* ─── System Info ─── */}
            <Card className="mt-6">
                <CardContent className="flex flex-wrap items-center gap-4 p-5">
                    <Badge variant="success">Система работает</Badge>
                    <span className="text-xs text-muted-foreground">
                        DanceWave Admin Panel · Все сервисы активны
                    </span>
                </CardContent>
            </Card>
        </AdminLayout>
    );
}
