import { EnrollModal, type EnrollableGroup } from '@/features/enroll/ui/EnrollModal';
import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    CalendarDays,
    Clock,
    Headphones,
    Layers,
    Sparkles,
    Star,
    Users,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

type Props = {
    sections: Array<{
        id: number;
        slug: string;
        name: string;
        description?: string | null;
    }>;
    schedulePreview: Array<{
        id: number;
        day_of_week: string;
        start_time: string;
        instructor: string;
        group?: { name?: string };
    }>;
    team: Array<{
        id: number;
        name: string;
        experience: string;
        photo?: string | null;
    }>;
    collage: {
        title: string;
        main_image?: string | null;
    } | null;
    meta?: {
        title?: string;
        description?: string;
        canonical?: string;
    };
    enrollableGroups?: EnrollableGroup[];
};

const sectionIcons = [Zap, Star, Sparkles, Layers];

export default function Home({
    sections,
    schedulePreview,
    team,
    collage,
    meta,
    enrollableGroups = [],
}: Props) {
    const [enrollOpen, setEnrollOpen] = useState(false);
    const heroImage =
        mediaUrl(collage?.main_image) ||
        'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?q=80&w=1600&auto=format&fit=crop';

    const highlights = [
        {
            value: `${sections.length}+`,
            label: 'направлений',
            icon: Layers,
        },
        {
            value: `${team.length}+`,
            label: 'педагогов',
            icon: Users,
        },
        {
            value: `${schedulePreview.length}+`,
            label: 'занятий / нед.',
            icon: CalendarDays,
        },
    ];

    const values = [
        {
            icon: Zap,
            title: 'Гибкий формат',
            text: 'Группы по возрасту и уровню — легко перейти в подходящий поток в любой момент.',
        },
        {
            icon: Star,
            title: 'Сильные педагоги',
            text: 'Тренеры с реальным сценическим и педагогическим опытом, индивидуальный подход к каждому.',
        },
        {
            icon: Headphones,
            title: 'Всё в одном кабинете',
            text: 'Расписание, платежи, новости секций и чат поддержки — всегда под рукой.',
        },
    ];

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <section className="relative overflow-hidden rounded-3xl border border-brand/20">
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-brand/5 to-transparent" />
                <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full bg-brand/15 blur-[100px]" />
                <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-brand-dark/10 blur-[80px]" />

                <div className="relative grid gap-8 p-8 lg:grid-cols-[1.2fr_1fr] lg:p-12">
                    <Reveal className="flex flex-col justify-center space-y-6">
                        <Badge variant="default" className="w-fit">
                            <Sparkles className="mr-1 h-3 w-3" />
                            DanceWave 2.0
                        </Badge>

                        <h1 className="font-title text-4xl font-bold leading-[1.1] tracking-tight lg:text-5xl xl:text-[3.4rem]">
                            Двигайся в ритме,{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                а не по шаблону
                            </span>
                        </h1>

                        <p className="max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                            Студия для детей, подростков и взрослых с удобным
                            личным кабинетом, персональным расписанием, оплатой
                            и поддержкой — всё в одном интерфейсе.
                        </p>

                        <div className="flex flex-wrap gap-3 pt-1">
                            <Button size="lg" onClick={() => setEnrollOpen(true)}>
                                Записаться онлайн
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/schedule">
                                    Расписание занятий
                                </Link>
                            </Button>
                        </div>

                        {/* Stats pills */}
                        <div className="grid max-w-xl gap-3 pt-2 sm:grid-cols-3">
                            {highlights.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div
                                        key={item.label}
                                        className="flex items-center gap-3 rounded-2xl border border-brand/20 bg-white/70 px-4 py-3 backdrop-blur-sm dark:bg-card/50"
                                    >
                                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                                            <Icon className="h-4 w-4 text-brand-dark" />
                                        </div>
                                        <div>
                                            <p className="font-title text-xl font-bold text-brand-dark">
                                                {item.value}
                                            </p>
                                            <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground">
                                                {item.label}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>

                    <Reveal delayMs={120}>
                        <div className="relative overflow-hidden rounded-2xl shadow-2xl shadow-brand/20">
                            <img
                                src={heroImage}
                                alt="DanceWave"
                                className="h-full min-h-[320px] w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ─── Why DanceWave ─── */}
            <Reveal className="mt-16">
                <div className="text-center">
                    <p className="dw-kicker mx-auto">Почему DanceWave</p>
                    <h2 className="mx-auto mt-4 max-w-2xl font-title text-2xl lg:text-3xl">
                        Комфортная система обучения и сопровождения
                    </h2>
                </div>

                <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
                    {values.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={item.title}
                                className="group relative overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10"
                            >
                                <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-brand/5 transition-colors group-hover:bg-brand/10" />
                                <CardContent className="relative space-y-3 p-6">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
                                        <Icon className="h-5 w-5 text-brand-dark" />
                                    </div>
                                    <h3 className="font-title text-lg font-semibold">
                                        {item.title}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {item.text}
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stagger>
            </Reveal>

            {/* ─── Sections ─── */}
            <Reveal className="mt-16" delayMs={40}>
                <div className="mb-6 flex items-end justify-between">
                    <div>
                        <p className="dw-kicker">Направления</p>
                        <h2 className="mt-3 font-title text-2xl">
                            Выбирайте свой стиль
                        </h2>
                    </div>
                    <Link
                        href="/directions"
                        className="group hidden items-center gap-1 text-sm font-semibold text-brand-dark transition-colors hover:text-brand sm:flex"
                    >
                        Все секции
                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                    </Link>
                </div>

                <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {sections.map((section, i) => {
                        const Icon = sectionIcons[i % sectionIcons.length];
                        return (
                            <Card
                                key={section.id}
                                className="group relative overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10"
                            >
                                {/* Colored top bar */}
                                <div className="h-1 bg-gradient-to-r from-brand to-brand-dark" />
                                <CardContent className="space-y-3 p-5">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10 transition-colors group-hover:bg-brand/20">
                                        <Icon className="h-5 w-5 text-brand-dark" />
                                    </div>
                                    <h3 className="font-semibold">
                                        {section.name}
                                    </h3>
                                    <p className="text-sm leading-relaxed text-muted-foreground">
                                        {section.description ||
                                            'Группы по уровню, возрасту и личным целям.'}
                                    </p>
                                    <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.1em] text-brand-dark">
                                        <Sparkles className="h-3 w-3" />
                                        Пробное занятие доступно
                                    </p>
                                </CardContent>
                            </Card>
                        );
                    })}
                </Stagger>

                <Link
                    href="/directions"
                    className="mt-4 flex items-center justify-center gap-1 text-sm font-semibold text-brand-dark sm:hidden"
                >
                    Все секции
                    <ArrowRight className="h-3.5 w-3.5" />
                </Link>
            </Reveal>

            {/* ─── Schedule + Team ─── */}
            <section className="mt-16 grid gap-6 lg:grid-cols-2">
                <Reveal delayMs={40}>
                    <Card className="h-full border-brand/10">
                        <CardContent className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                    <CalendarDays className="h-5 w-5 text-brand-dark" />
                                </div>
                                <div>
                                    <h2 className="font-title text-xl">
                                        Ближайшие занятия
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Актуальные слоты на эту неделю
                                    </p>
                                </div>
                            </div>

                            <Stagger className="space-y-2.5">
                                {schedulePreview.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-border/80 bg-surface/40 p-3.5 transition-colors hover:bg-surface/80"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/10">
                                                <Clock className="h-3.5 w-3.5 text-brand-dark" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">
                                                    {item.day_of_week}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {item.group?.name ||
                                                        item.instructor}
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="muted">
                                            {String(item.start_time).slice(
                                                0,
                                                5,
                                            )}
                                        </Badge>
                                    </div>
                                ))}
                            </Stagger>

                            {schedulePreview.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Расписание скоро появится
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </Reveal>

                <Reveal delayMs={100}>
                    <Card className="h-full border-brand/10">
                        <CardContent className="p-6">
                            <div className="mb-5 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand/10">
                                    <Users className="h-5 w-5 text-brand-dark" />
                                </div>
                                <div>
                                    <h2 className="font-title text-xl">
                                        Команда
                                    </h2>
                                    <p className="text-xs text-muted-foreground">
                                        Педагоги с реальным сценическим опытом
                                    </p>
                                </div>
                            </div>

                            <Stagger className="space-y-2.5">
                                {team.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface/40 p-3.5 transition-colors hover:bg-surface/80"
                                    >
                                        {person.photo ? (
                                            <img
                                                src={
                                                    mediaUrl(person.photo) ||
                                                    undefined
                                                }
                                                alt={person.name}
                                                className="h-11 w-11 rounded-full object-cover ring-2 ring-brand/20"
                                            />
                                        ) : (
                                            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-brand/20 to-brand/10 text-sm font-bold text-brand-dark">
                                                {person.name
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-medium">
                                                {person.name}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {person.experience}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </Stagger>

                            {team.length === 0 && (
                                <p className="py-8 text-center text-sm text-muted-foreground">
                                    Информация о команде скоро появится
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </Reveal>
            </section>

            {/* ─── CTA ─── */}
            <Reveal className="mt-16" delayMs={120}>
                <Card className="relative overflow-hidden border-brand/20 bg-gradient-to-br from-brand/10 via-brand/5 to-transparent">
                    <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-brand/10 blur-[60px]" />
                    <CardContent className="relative flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between">
                        <div className="max-w-lg space-y-3">
                            <p className="dw-kicker">Готовы начать?</p>
                            <h2 className="font-title text-2xl lg:text-3xl">
                                Оставьте заявку и получите подбор группы за 15
                                минут
                            </h2>
                            <p className="text-sm leading-relaxed text-muted-foreground">
                                Администратор свяжется с вами, поможет с выбором
                                секции и назначит пробное занятие.
                            </p>
                        </div>
                        <div className="flex shrink-0 flex-wrap gap-3">
                            <Button asChild size="lg">
                                <Link href="/register">
                                    Создать аккаунт
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="lg">
                                <Link href="/prices">Тарифы</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>

            <EnrollModal
                open={enrollOpen}
                onOpenChange={setEnrollOpen}
                groups={enrollableGroups}
            />
        </SiteLayout>
    );
}
