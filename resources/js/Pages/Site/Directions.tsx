import { EnrollModal, type EnrollableGroup } from '@/features/enroll/ui/EnrollModal';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import {
    CheckCircle2,
    Layers,
    Music,
    Sparkles,
    Star,
    Users,
    XCircle,
    Zap,
} from 'lucide-react';
import { useState } from 'react';

type Section = {
    id: number;
    name: string;
    slug: string;
    is_active: boolean;
    description?: string | null;
    levels?: string[] | null;
    groups_count?: number;
};

type Props = {
    sections: Section[];
    enrollableGroups?: EnrollableGroup[];
    meta?: { title?: string; description?: string; canonical?: string };
};

const sectionIcons = [Zap, Star, Sparkles, Layers];

export default function Directions({ sections, enrollableGroups = [], meta }: Props) {
    const activeCount = sections.filter((s) => s.is_active).length;
    const [enrollOpen, setEnrollOpen] = useState(false);
    const [preselectedGroup, setPreselectedGroup] = useState<number | null>(null);

    const openEnroll = (sectionId?: number) => {
        const firstGroup = sectionId
            ? enrollableGroups.find((g) => g.section_id === sectionId)
            : undefined;
        setPreselectedGroup(firstGroup?.id ?? null);
        setEnrollOpen(true);
    };

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative">
                        <Badge variant="default" className="mb-4">
                            <Layers className="mr-1 h-3 w-3" />
                            Направления
                        </Badge>
                        <h1 className="max-w-xl font-title text-3xl font-bold leading-tight lg:text-4xl">
                            Найдите{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                своё направление
                            </span>
                        </h1>
                        <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground lg:text-lg">
                            Каждая секция имеет группы по уровню и возрасту.
                            Попробуйте пробное занятие, чтобы определиться с
                            выбором.
                        </p>
                        <div className="mt-4 flex gap-3">
                            <Badge variant="success">
                                <CheckCircle2 className="mr-1 h-3 w-3" />
                                Набор открыт: {activeCount}
                            </Badge>
                            {sections.length - activeCount > 0 && (
                                <Badge variant="muted">
                                    Набор закрыт:{' '}
                                    {sections.length - activeCount}
                                </Badge>
                            )}
                        </div>
                    </div>
                </section>
            </Reveal>

            {/* ─── Grid ─── */}
            <Stagger className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {sections.map((section, i) => {
                    const Icon = sectionIcons[i % sectionIcons.length];
                    const isOpen = section.is_active;

                    return (
                        <Card
                            key={section.id}
                            className={`group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isOpen
                                ? 'border-brand/15 hover:border-brand/30 hover:shadow-brand/10'
                                : 'border-border/60 opacity-80'
                                }`}
                        >
                            {/* Colored top bar */}
                            <div
                                className={`h-1 ${isOpen
                                    ? 'bg-gradient-to-r from-brand to-brand-dark'
                                    : 'bg-muted-foreground/20'
                                    }`}
                            />
                            <div className="absolute right-0 top-0 h-20 w-20 rounded-bl-full bg-brand/5 transition-colors group-hover:bg-brand/10" />

                            <CardContent className="relative space-y-4 p-6">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5 transition-colors group-hover:from-brand/30">
                                        <Icon className="h-5 w-5 text-brand-dark" />
                                    </div>
                                    <Badge
                                        variant={isOpen ? 'success' : 'muted'}
                                    >
                                        {isOpen ? (
                                            <CheckCircle2 className="mr-1 h-3 w-3" />
                                        ) : (
                                            <XCircle className="mr-1 h-3 w-3" />
                                        )}
                                        {isOpen
                                            ? 'Набор открыт'
                                            : 'Набор закрыт'}
                                    </Badge>
                                </div>

                                <div>
                                    <h3 className="font-title text-lg font-semibold">
                                        {section.name}
                                    </h3>
                                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                        {section.description ||
                                            'Описание направления появится в ближайшее время.'}
                                    </p>
                                </div>

                                {/* Levels */}
                                {section.levels && section.levels.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {section.levels.map((level) => (
                                            <span
                                                key={level}
                                                className="inline-flex items-center rounded-lg bg-surface px-2.5 py-1 text-xs font-medium text-muted-foreground"
                                            >
                                                <Star className="mr-1 h-2.5 w-2.5" />
                                                {level}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Groups count */}
                                {section.groups_count != null &&
                                    section.groups_count > 0 && (
                                        <div className="flex items-center gap-2 rounded-xl border border-brand/10 bg-brand/5 px-3 py-2 text-xs font-medium text-brand-dark">
                                            <Users className="h-3.5 w-3.5" />
                                            Активных групп:{' '}
                                            {section.groups_count}
                                        </div>
                                    )}

                                {/* Enroll button */}
                                {isOpen && (
                                    <Button
                                        size="sm"
                                        className="w-full"
                                        onClick={() => openEnroll(section.id)}
                                    >
                                        <Music className="mr-1.5 h-3.5 w-3.5" />
                                        Записаться
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </Stagger>

            {sections.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Направления скоро появятся
                    </CardContent>
                </Card>
            )}

            <EnrollModal
                open={enrollOpen}
                onOpenChange={setEnrollOpen}
                groups={enrollableGroups}
                preselectedGroupId={preselectedGroup}
            />
        </SiteLayout>
    );
}
