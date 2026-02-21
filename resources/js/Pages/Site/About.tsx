import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import {
    Award,
    Clock,
    Eye,
    Heart,
    Layers,
    Shield,
    Sparkles,
    Star,
    Users,
} from 'lucide-react';

type TeamMember = {
    id: number;
    name: string;
    experience: string;
    photo?: string | null;
};

type Props = {
    team: TeamMember[];
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function About({ team, meta }: Props) {
    const principles = [
        {
            icon: Eye,
            title: 'Метод',
            text: 'Программы адаптируются под возраст, уровень и цели ученика. Прогресс отслеживается педагогом.',
        },
        {
            icon: Heart,
            title: 'Атмосфера',
            text: 'Дружелюбная среда без диктатуры и давления — мотивация через интерес и вовлечённость.',
        },
        {
            icon: Shield,
            title: 'Прозрачность',
            text: 'Личный кабинет, понятные тарифы, расписание и история платежей — открыто и удобно.',
        },
    ];

    const stats = [
        { value: '40+', label: 'занятий в неделю', icon: Clock },
        { value: '10–15', label: 'человек в группе', icon: Users },
        { value: '24/7', label: 'поддержка онлайн', icon: Headphones },
        { value: '8+', label: 'направлений', icon: Layers },
    ];

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative">
                        <Badge variant="default" className="mb-4">
                            <Sparkles className="mr-1 h-3 w-3" />О студии
                        </Badge>
                        <h1 className="max-w-2xl font-title text-3xl font-bold leading-tight lg:text-4xl">
                            Больше, чем танцы —{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                система развития
                            </span>
                        </h1>
                        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                            DanceWave — студия с удобным IT-сопровождением: от
                            записи на пробное занятие до управления платежами и
                            расписанием через личный кабинет.
                        </p>
                    </div>
                </section>
            </Reveal>

            {/* ─── Stats ─── */}
            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((item) => {
                    const Icon = item.icon;
                    return (
                        <Card
                            key={item.label}
                            className="border-brand/10 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/25 hover:shadow-md hover:shadow-brand/5"
                        >
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
                                    <Icon className="h-5 w-5 text-brand-dark" />
                                </div>
                                <div>
                                    <p className="font-title text-2xl font-bold text-brand-dark">
                                        {item.value}
                                    </p>
                                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                        {item.label}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stagger>

            {/* ─── Principles ─── */}
            <Reveal className="mt-16">
                <div className="text-center">
                    <p className="dw-kicker mx-auto">Принципы</p>
                    <h2 className="mx-auto mt-3 max-w-lg font-title text-2xl lg:text-3xl">
                        На чём строится DanceWave
                    </h2>
                </div>

                <Stagger className="mt-8 grid gap-5 md:grid-cols-3">
                    {principles.map((item) => {
                        const Icon = item.icon;
                        return (
                            <Card
                                key={item.title}
                                className="group relative overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/30 hover:shadow-lg hover:shadow-brand/10"
                            >
                                <div className="h-1 bg-gradient-to-r from-brand to-brand-dark" />
                                <div className="absolute right-0 top-0 h-16 w-16 rounded-bl-full bg-brand/5 transition-colors group-hover:bg-brand/10" />
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

            {/* ─── Team ─── */}
            <Reveal className="mt-16" delayMs={60}>
                <div className="text-center">
                    <p className="dw-kicker mx-auto">Команда</p>
                    <h2 className="mx-auto mt-3 max-w-lg font-title text-2xl lg:text-3xl">
                        Педагоги DanceWave
                    </h2>
                    <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
                        Опытные тренеры с реальным сценическим и педагогическим
                        опытом
                    </p>
                </div>

                <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {team.map((person) => (
                        <Card
                            key={person.id}
                            className="group overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10"
                        >
                            {person.photo ? (
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={
                                            mediaUrl(person.photo) || undefined
                                        }
                                        alt={person.name}
                                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                                    <div className="absolute bottom-3 left-4">
                                        <Badge className="bg-white/20 text-white backdrop-blur-sm">
                                            <Award className="mr-1 h-3 w-3" />
                                            {person.experience}
                                        </Badge>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex h-56 items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5">
                                    <span className="font-title text-5xl font-bold text-brand/40">
                                        {person.name.charAt(0).toUpperCase()}
                                    </span>
                                </div>
                            )}
                            <CardContent className="p-5">
                                <h3 className="font-semibold">{person.name}</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {person.experience}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </Stagger>

                {team.length === 0 && (
                    <Card className="mt-8">
                        <CardContent className="py-10 text-center text-muted-foreground">
                            Информация о педагогах скоро появится
                        </CardContent>
                    </Card>
                )}
            </Reveal>
        </SiteLayout>
    );
}

function Headphones(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            {...props}
        >
            <path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" />
        </svg>
    );
}
