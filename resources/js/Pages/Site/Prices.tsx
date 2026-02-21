import { EnrollModal, type EnrollableGroup } from '@/features/enroll/ui/EnrollModal';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import {
    ArrowRight,
    Check,
    CreditCard,
    Shield,
    Sparkles,
    Star,
} from 'lucide-react';
import { useState } from 'react';

type Tariff = {
    id: number;
    title: string;
    amount: number;
    period: string;
    features?: string[];
};

type Props = {
    tariffs: Tariff[];
    enrollableGroups?: EnrollableGroup[];
    meta?: { title?: string; description?: string; canonical?: string };
};

const formatMoney = (cents: number) => {
    const rub = Math.round(cents / 100);
    return rub.toLocaleString('ru-RU');
};

export default function Prices({ tariffs, enrollableGroups = [], meta }: Props) {
    const [enrollOpen, setEnrollOpen] = useState(false);
    // The "recommended" tariff is the second one if available, otherwise the first
    const recommendedIndex = tariffs.length >= 2 ? 1 : 0;

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative text-center">
                        <Badge variant="default" className="mx-auto mb-4">
                            <CreditCard className="mr-1 h-3 w-3" />
                            Тарифы
                        </Badge>
                        <h1 className="mx-auto max-w-lg font-title text-3xl font-bold leading-tight lg:text-4xl">
                            Прозрачные{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                цены
                            </span>
                        </h1>
                        <p className="mx-auto mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                            Оплата через личный кабинет. Безопасная форма, история
                            платежей и автоматические напоминания.
                        </p>
                    </div>
                </section>
            </Reveal>

            {/* ─── Tariffs ─── */}
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {tariffs.map((tariff, i) => {
                    const isRecommended = i === recommendedIndex;
                    return (
                        <Card
                            key={tariff.id}
                            className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isRecommended
                                ? 'border-brand/40 shadow-md shadow-brand/10 hover:border-brand/60 hover:shadow-brand/15'
                                : 'border-brand/10 hover:border-brand/25 hover:shadow-brand/10'
                                }`}
                        >
                            {/* Accent bar */}
                            <div
                                className={`h-1 ${isRecommended
                                    ? 'bg-gradient-to-r from-brand via-brand-dark to-brand'
                                    : 'bg-gradient-to-r from-brand/40 to-brand/20'
                                    }`}
                            />
                            {isRecommended && (
                                <div className="absolute -right-8 top-6 rotate-45 bg-brand px-10 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                                    выбор №1
                                </div>
                            )}

                            <CardContent className="space-y-5 p-6">
                                <div>
                                    <h3 className="font-title text-lg font-semibold">
                                        {tariff.title}
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        {tariff.period}
                                    </p>
                                </div>

                                <div className="flex items-baseline gap-1">
                                    <span className="font-title text-4xl font-bold text-brand-dark">
                                        {formatMoney(tariff.amount)}
                                    </span>
                                    <span className="text-sm text-muted-foreground">
                                        ₽
                                    </span>
                                </div>

                                {/* Features */}
                                {tariff.features &&
                                    tariff.features.length > 0 && (
                                        <ul className="space-y-2">
                                            {tariff.features.map(
                                                (feature, fi) => (
                                                    <li
                                                        key={fi}
                                                        className="flex items-start gap-2 text-sm"
                                                    >
                                                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                                                        <span>{feature}</span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}

                                <Button
                                    className="w-full"
                                    variant={
                                        isRecommended ? 'default' : 'outline'
                                    }
                                    onClick={() => setEnrollOpen(true)}
                                >
                                    Записаться
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })}
            </Stagger>

            {tariffs.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Тарифы скоро будут опубликованы
                    </CardContent>
                </Card>
            )}

            {/* ─── Guarantees ─── */}
            <Reveal className="mt-12">
                <Card className="border-brand/15 bg-gradient-to-br from-brand/5 to-transparent">
                    <CardContent className="grid gap-6 p-6 sm:grid-cols-3">
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                                <Shield className="h-5 w-5 text-brand-dark" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">
                                    Безопасная оплата
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Защищённая форма — данные карты не
                                    сохраняются на сервере
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                                <Star className="h-5 w-5 text-brand-dark" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">
                                    История платежей
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Вся информация о платежах доступна в вашем
                                    личном кабинете
                                </p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/15">
                                <Sparkles className="h-5 w-5 text-brand-dark" />
                            </div>
                            <div>
                                <h4 className="text-sm font-semibold">
                                    Пробное занятие
                                </h4>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Первое занятие можно попробовать до покупки
                                    абонемента
                                </p>
                            </div>
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
