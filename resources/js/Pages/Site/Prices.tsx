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

type GroupPrice = {
    id: number;
    section_id: number;
    name: string;
    level: string;
    style?: string | null;
    billing_amount_cents: number;
    billing_period_days: number;
    currency: string;
};

type SectionPrice = {
    id: number;
    name: string;
    slug: string;
    groups: GroupPrice[];
};

type Props = {
    sections: SectionPrice[];
    enrollableGroups?: EnrollableGroup[];
    meta?: { title?: string; description?: string; canonical?: string };
};

const formatMoney = (cents: number) => {
    const rub = Math.round(cents / 100);
    return rub.toLocaleString('ru-RU');
};

export default function Prices({ sections = [], enrollableGroups = [], meta }: Props) {
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<EnrollableGroup | null>(null);

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

            {/* ─── Groups Pricing ─── */}
            {sections.map((section) => {
                if (!section.groups || section.groups.length === 0) return null;

                return (
                    <div key={section.id} className="mt-12 first:mt-8">
                        <h2 className="mb-6 font-title text-2xl font-bold">{section.name}</h2>
                        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {section.groups.map((group) => {
                                return (
                                    <Card
                                        key={group.id}
                                        className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg border-brand/10 hover:border-brand/25 hover:shadow-brand/10"
                                    >
                                        <div className="h-1 bg-gradient-to-r from-brand/40 to-brand/20" />

                                        <CardContent className="space-y-5 p-6 flex flex-col h-full">
                                            <div className="flex-1">
                                                <h3 className="font-title text-lg font-semibold">
                                                    {group.name}
                                                </h3>
                                                <div className="mt-1 flex flex-wrap gap-2 text-xs text-muted-foreground">
                                                    <Badge variant="muted" className="font-normal text-[10px] uppercase">
                                                        {group.level || 'Любой уровень'}
                                                    </Badge>
                                                    {group.style && (
                                                        <Badge variant="muted" className="font-normal text-[10px] bg-brand/5">
                                                            {group.style}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <div className="flex items-baseline gap-1">
                                                    <span className="font-title text-4xl font-bold text-brand-dark">
                                                        {formatMoney(group.billing_amount_cents || 0)}
                                                    </span>
                                                    <span className="text-sm font-medium text-muted-foreground">
                                                        {group.currency === 'KZT' ? '₸' : '₽'}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground ml-1">
                                                        / {group.billing_period_days} дней
                                                    </span>
                                                </div>
                                            </div>

                                            <Button
                                                className="w-full mt-4"
                                                variant="outline"
                                                onClick={() => {
                                                    const eGroup = enrollableGroups.find(g => g.id === group.id);
                                                    if (eGroup) setSelectedGroup(eGroup);
                                                    setEnrollOpen(true);
                                                }}
                                            >
                                                Записаться
                                                <ArrowRight className="ml-2 h-4 w-4" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </Stagger>
                    </div>
                );
            })}

            {sections.every(s => !s.groups || s.groups.length === 0) && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Цены на группы в разработке
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
                onOpenChange={(v) => {
                    setEnrollOpen(v);
                    if (!v) setTimeout(() => setSelectedGroup(null), 300);
                }}
                groups={enrollableGroups}
                preselectedGroupId={selectedGroup?.id}
            />
        </SiteLayout>
    );
}
