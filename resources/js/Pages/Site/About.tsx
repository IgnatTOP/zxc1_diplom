import { mediaUrl } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

type Props = {
    content: Record<string, string>;
    team: Array<{
        id: number;
        name: string;
        experience: string;
        photo?: string | null;
    }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function About({ content, team, meta }: Props) {
    const principles = [
        {
            title: 'Методика',
            text: 'Комбинируем технику, физподготовку и сценическую практику без перегруза.',
        },
        {
            title: 'Атмосфера',
            text: 'В группе поддержка и уважение. Новички адаптируются быстро.',
        },
        {
            title: 'Прозрачность',
            text: 'Расписание, оплаты, новости и коммуникация всегда под рукой в личном кабинете.',
        },
    ];

    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <section className="rounded-3xl border border-border bg-surface/40 p-8">
                    <p className="dw-kicker">О студии</p>
                    <h1 className="mt-3 font-title text-3xl">
                        Создаем пространство, где прогресс виден каждую неделю
                    </h1>
                    <p className="mt-4 max-w-3xl text-muted-foreground">
                        {content.main_text ||
                            'DanceWave объединяет учеников разных возрастов. Мы делаем обучение понятным, безопасным и результативным: от первых шагов в танце до уверенного выступления на сцене.'}
                    </p>
                </section>
            </Reveal>

            <Reveal className="mt-8" delayMs={60}>
                <Stagger className="grid gap-4 md:grid-cols-3">
                    {principles.map((item) => (
                        <Card key={item.title}>
                            <CardContent className="space-y-2 p-5">
                                <h2 className="font-semibold">{item.title}</h2>
                                <p className="text-sm text-muted-foreground">
                                    {item.text}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </Stagger>
            </Reveal>

            <Reveal className="mt-8" delayMs={100}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="grid gap-3 p-5 md:grid-cols-3">
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Тренировок в неделю
                            </p>
                            <p className="mt-1 font-title text-3xl text-brand-dark">
                                40+
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Средний размер группы
                            </p>
                            <p className="mt-1 font-title text-3xl text-brand-dark">
                                12
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Поддержка в чате
                            </p>
                            <p className="mt-1 font-title text-3xl text-brand-dark">
                                7/7
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>

            <Reveal className="mt-8" delayMs={140}>
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <p className="dw-kicker">Команда</p>
                        <h2 className="mt-2 font-title text-2xl">
                            Педагоги и кураторы направлений
                        </h2>
                    </div>
                </div>
            </Reveal>

            <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {team.map((person) => (
                    <Card key={person.id}>
                        <CardContent className="space-y-3 p-5">
                            {person.photo ? (
                                <img
                                    src={mediaUrl(person.photo) || undefined}
                                    alt={person.name}
                                    className="h-44 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="h-44 rounded-xl bg-brand/20" />
                            )}
                            <h3 className="font-semibold">{person.name}</h3>
                            <p className="text-sm text-muted-foreground">
                                {person.experience}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </Stagger>
        </SiteLayout>
    );
}
