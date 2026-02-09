import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

type Props = {
    tariffs: Array<{ title: string; amount: number; period: string }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Prices({ tariffs, meta }: Props) {
    const points = [
        'Оплата по каждой группе отдельно',
        'История платежей и ближайший платеж в личном кабинете',
        'Платежная форма с безопасным хранением только маски карты',
    ];

    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <h1 className="font-title text-3xl">Цены</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Прозрачные тарифы для каждой группы. Модель оплаты сделана
                    так, чтобы вы всегда видели сумму, дату и историю операций.
                </p>
            </Reveal>

            <Reveal className="mt-6" delayMs={60}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="grid gap-2 p-5 md:grid-cols-3">
                        {points.map((point) => (
                            <p
                                key={point}
                                className="text-sm leading-relaxed text-muted-foreground"
                            >
                                {point}
                            </p>
                        ))}
                    </CardContent>
                </Card>
            </Reveal>

            <Stagger className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {tariffs.map((tariff) => (
                    <Card
                        key={tariff.title}
                        className="h-full border-brand/20 transition-transform duration-200 hover:-translate-y-1"
                    >
                        <CardContent className="flex h-full flex-col space-y-3 p-6">
                            <p className="dw-kicker">Тариф</p>
                            <h2 className="font-title text-xl">
                                {tariff.title}
                            </h2>
                            <p className="text-3xl font-bold">
                                {tariff.amount} ₽
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {tariff.period}
                            </p>
                            <ul className="mt-auto space-y-1 pt-2 text-sm text-muted-foreground">
                                <li>• Онлайн-оплата в кабинете</li>
                                <li>• Напоминание о ближайшем платеже</li>
                                <li>• История операций по группе</li>
                            </ul>
                        </CardContent>
                    </Card>
                ))}
            </Stagger>
        </SiteLayout>
    );
}
