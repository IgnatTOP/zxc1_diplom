import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { Link } from '@inertiajs/react';

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
};

export default function Home({
    sections,
    schedulePreview,
    team,
    collage,
    meta,
}: Props) {
    const heroImage =
        mediaUrl(collage?.main_image) ||
        'https://images.unsplash.com/photo-1519925610903-381054cc2a1c?q=80&w=1600&auto=format&fit=crop';

    const highlights = [
        { value: `${sections.length}+`, label: 'направлений' },
        { value: `${team.length}+`, label: 'педагогов' },
        { value: `${schedulePreview.length}+`, label: 'занятий в неделю' },
    ];

    const values = [
        {
            title: 'Гибкий формат',
            text: 'Группы по возрасту и уровню, возможность быстро перейти в подходящий поток.',
        },
        {
            title: 'Сильный преподавательский состав',
            text: 'Тренеры с реальным сценическим и педагогическим опытом.',
        },
        {
            title: 'Прозрачный кабинет',
            text: 'Расписание, платежи, новости секций и чат поддержки в одном месте.',
        },
    ];

    return (
        <SiteLayout meta={meta}>
            <section className="dw-hero-pattern relative overflow-hidden rounded-3xl border border-brand/20 bg-gradient-to-br from-brand/15 via-brand/5 to-background p-8 lg:p-12">
                <div className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
                    <Reveal className="space-y-6">
                        <Badge variant="default">DanceWave 2.0</Badge>
                        <h1 className="font-title text-4xl font-bold leading-tight lg:text-5xl">
                            Двигайся в ритме, а не по шаблону
                        </h1>
                        <p className="max-w-xl text-base text-muted-foreground lg:text-lg">
                            Студия для детей, подростков и взрослых с удобным
                            кабинетом, персональным расписанием, оплатой и
                            поддержкой в одном интерфейсе.
                        </p>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/register">Записаться онлайн</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/schedule">
                                    Посмотреть расписание
                                </Link>
                            </Button>
                        </div>
                        <div className="grid max-w-xl gap-3 sm:grid-cols-3">
                            {highlights.map((item) => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-brand/25 bg-white/70 p-3"
                                >
                                    <p className="font-title text-xl font-bold text-brand-dark">
                                        {item.value}
                                    </p>
                                    <p className="mt-1 text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                        {item.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                    <Reveal delayMs={120}>
                        <img
                            src={heroImage}
                            alt="DanceWave"
                            className="h-full min-h-[280px] w-full rounded-2xl object-cover shadow-xl"
                        />
                    </Reveal>
                </div>
            </section>

            <Reveal className="mt-12">
                <p className="dw-kicker">Почему DanceWave</p>
                <h2 className="mt-4 font-title text-2xl">
                    Комфортная система обучения и сопровождения
                </h2>
                <Stagger className="mt-5 grid gap-4 md:grid-cols-3">
                    {values.map((item) => (
                        <Card key={item.title}>
                            <CardContent className="space-y-2 p-5">
                                <h3 className="font-semibold">{item.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                    {item.text}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </Stagger>
            </Reveal>

            <Reveal className="mt-12" delayMs={40}>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-title text-2xl">Направления</h2>
                    <Link
                        href="/directions"
                        className="text-sm text-brand-dark"
                    >
                        Все секции
                    </Link>
                </div>
                <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {sections.map((section) => (
                        <Card key={section.id}>
                            <CardContent className="space-y-3 p-5">
                                <h3 className="font-semibold">
                                    {section.name}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {section.description ||
                                        'Группы по уровню, возрасту и личным целям.'}
                                </p>
                                <p className="text-xs uppercase tracking-[0.1em] text-brand-dark">
                                    Пробное занятие доступно
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </Stagger>
            </Reveal>

            <section className="mt-12 grid gap-6 lg:grid-cols-2">
                <Reveal delayMs={40}>
                    <Card>
                        <CardContent className="p-5">
                            <h2 className="mb-1 font-title text-xl">
                                Ближайшие занятия
                            </h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Самые актуальные слоты по группам на этой
                                неделе.
                            </p>
                            <Stagger className="space-y-3">
                                {schedulePreview.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center justify-between rounded-xl border border-border p-3"
                                    >
                                        <div>
                                            <p className="font-medium">
                                                {item.day_of_week}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {item.group?.name ||
                                                    item.instructor}
                                            </p>
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
                        </CardContent>
                    </Card>
                </Reveal>

                <Reveal delayMs={100}>
                    <Card>
                        <CardContent className="p-5">
                            <h2 className="mb-1 font-title text-xl">Команда</h2>
                            <p className="mb-4 text-sm text-muted-foreground">
                                Педагоги, которые ведут группы к сценическому
                                результату, сохраняя комфорт и безопасность.
                            </p>
                            <Stagger className="space-y-3">
                                {team.map((person) => (
                                    <div
                                        key={person.id}
                                        className="flex items-center gap-3 rounded-xl border border-border p-3"
                                    >
                                        {person.photo ? (
                                            <img
                                                src={
                                                    mediaUrl(person.photo) ||
                                                    undefined
                                                }
                                                alt={person.name}
                                                className="h-12 w-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="h-12 w-12 rounded-full bg-brand/20" />
                                        )}
                                        <div>
                                            <p className="font-medium">
                                                {person.name}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {person.experience}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </Stagger>
                        </CardContent>
                    </Card>
                </Reveal>
            </section>

            <Reveal className="mt-12" delayMs={120}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
                        <div>
                            <p className="dw-kicker">Готовы начать?</p>
                            <h2 className="mt-3 font-title text-2xl">
                                Оставьте заявку и получите подбор группы за 15
                                минут
                            </h2>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Администратор свяжется с вами, поможет с выбором
                                секции и назначит пробное занятие.
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-3">
                            <Button asChild>
                                <Link href="/register">Создать аккаунт</Link>
                            </Button>
                            <Button asChild variant="outline">
                                <Link href="/prices">Посмотреть тарифы</Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>
        </SiteLayout>
    );
}
