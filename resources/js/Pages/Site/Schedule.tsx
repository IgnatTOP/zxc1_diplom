import { Card, CardContent } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

type Props = {
    items: Array<{
        id: number;
        day_of_week: string;
        start_time: string;
        end_time?: string | null;
        instructor: string;
        group?: {
            id: number;
            name: string;
            section?: { id: number; name: string };
        };
    }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Schedule({ items, meta }: Props) {
    const activeDays = new Set(items.map((item) => item.day_of_week)).size;

    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <h1 className="font-title text-3xl">Расписание</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Актуальная сетка занятий по всем направлениям. Время указано
                    по местному часовому поясу студии.
                </p>
            </Reveal>

            <Reveal className="mt-6" delayMs={60}>
                <div className="grid gap-3 md:grid-cols-3">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Активных слотов
                            </p>
                            <p className="mt-1 font-title text-2xl text-brand-dark">
                                {items.length}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Дней недели
                            </p>
                            <p className="mt-1 font-title text-2xl text-brand-dark">
                                {activeDays}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-muted-foreground">
                                Формат
                            </p>
                            <p className="mt-1 text-sm">
                                Группы 60-90 минут, отслеживание через кабинет
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </Reveal>

            <Reveal className="mt-8" delayMs={100}>
                <div className="overflow-x-auto rounded-2xl border border-border bg-card">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-surface/60 text-xs uppercase text-muted-foreground">
                            <tr>
                                <th className="px-4 py-3">День</th>
                                <th className="px-4 py-3">Время</th>
                                <th className="px-4 py-3">Группа</th>
                                <th className="px-4 py-3">Секция</th>
                                <th className="px-4 py-3">Тренер</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-border"
                                >
                                    <td className="px-4 py-3 font-medium">
                                        {item.day_of_week}
                                    </td>
                                    <td className="px-4 py-3">
                                        {String(item.start_time).slice(0, 5)}
                                        {item.end_time
                                            ? ` - ${String(item.end_time).slice(0, 5)}`
                                            : ''}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.group?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.group?.section?.name || '—'}
                                    </td>
                                    <td className="px-4 py-3">
                                        {item.instructor}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Reveal>

            {items.length === 0 ? (
                <Card className="mt-6">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                        Пока нет активных занятий.
                    </CardContent>
                </Card>
            ) : null}
        </SiteLayout>
    );
}
