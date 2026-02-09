import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

type Props = {
    sections: Array<{
        id: number;
        name: string;
        description?: string | null;
        is_active: boolean;
        active_groups_count?: number;
        groups?: Array<{
            id: number;
            level?: string | null;
        }>;
    }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Directions({ sections, meta }: Props) {
    const levelMap: Record<string, string> = {
        beginner: 'Начальный',
        intermediate: 'Средний',
        advanced: 'Продвинутый',
        novice: 'Начальный',
        pro: 'Продвинутый',
    };

    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <h1 className="font-title text-3xl">Направления</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Выберите секцию, сравните формат занятий и подберите группу
                    по уровню. В каждой секции есть пробное занятие и помощь
                    куратора на старте.
                </p>
            </Reveal>

            <Reveal className="mt-6" delayMs={70}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="grid gap-3 p-5 md:grid-cols-3">
                        <p className="text-sm text-muted-foreground">
                            Все секции включают разминку, технику, связки и
                            сценическую практику.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            При смене уровня администратор переносит вас в
                            подходящую группу без потери истории.
                        </p>
                        <p className="text-sm text-muted-foreground">
                            Доступен личный кабинет: расписание, оплаты, чат
                            поддержки и новости секций.
                        </p>
                    </CardContent>
                </Card>
            </Reveal>

            <Stagger className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {sections.map((section) => {
                    const levels = (section.groups || [])
                        .map((item) => (item.level || '').trim())
                        .map((level) => {
                            const normalized = level.toLowerCase();
                            return levelMap[normalized] || level;
                        })
                        .filter(Boolean)
                        .filter(
                            (level, levelIndex, source) =>
                                source.indexOf(level) === levelIndex,
                        )
                        .slice(0, 3);
                    const levelsText =
                        levels.length > 0
                            ? levels.join(', ')
                            : 'Начальный, Средний, Продвинутый';

                    return (
                        <Card
                            key={section.id}
                            className="h-full border-brand/20 transition-transform duration-200 hover:-translate-y-1"
                        >
                            <CardContent className="flex h-full flex-col space-y-3 p-5">
                                <Badge
                                    variant={
                                        section.is_active ? 'success' : 'muted'
                                    }
                                >
                                    {section.is_active
                                        ? 'Набор открыт'
                                        : 'Набор закрыт'}
                                </Badge>
                                <h3 className="font-semibold">
                                    {section.name}
                                </h3>
                                <p className="min-h-[48px] text-sm text-muted-foreground">
                                    {section.description ||
                                        'Современная программа обучения.'}
                                </p>
                                <div className="mt-auto space-y-2">
                                    <p className="text-xs uppercase tracking-[0.1em] text-brand-dark">
                                        Уровни: {levelsText}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Групп в наборе:{' '}
                                        {section.active_groups_count ?? 0}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stagger>
        </SiteLayout>
    );
}
