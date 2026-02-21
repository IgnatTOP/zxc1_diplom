import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import {
    CalendarDays,
    Clock,
    Layers,
    Sparkles,
} from 'lucide-react';

type ScheduleSlot = {
    id: number;
    day_of_week: string;
    start_time: string;
    end_time?: string | null;
    instructor: string;
    group?: { name?: string } | null;
    section?: { name?: string } | null;
};

type Props = {
    slots?: ScheduleSlot[];
    items?: ScheduleSlot[];
    meta?: { title?: string; description?: string; canonical?: string };
};

const dayOrder = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

export default function Schedule({ slots, items, meta }: Props) {
    const safeSlots = Array.isArray(slots)
        ? slots
        : Array.isArray(items)
          ? items
          : [];

    const totalSlots = safeSlots.length;
    const uniqueDays = [...new Set(safeSlots.map((s) => s.day_of_week))];
    const uniqueSections = [
        ...new Set(
            safeSlots
                .map((s) => s.section?.name)
                .filter(Boolean),
        ),
    ];

    // Group by day
    const grouped = dayOrder
        .filter((day) => safeSlots.some((s) => s.day_of_week === day))
        .map((day) => ({
            day,
            items: safeSlots
                .filter((s) => s.day_of_week === day)
                .sort((a, b) => a.start_time.localeCompare(b.start_time)),
        }));

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative">
                        <Badge variant="default" className="mb-4">
                            <CalendarDays className="mr-1 h-3 w-3" />
                            Расписание
                        </Badge>
                        <h1 className="max-w-xl font-title text-3xl font-bold leading-tight lg:text-4xl">
                            Расписание{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                занятий
                            </span>
                        </h1>
                        <p className="mt-3 max-w-lg text-base leading-relaxed text-muted-foreground">
                            Актуальное расписание на текущую неделю. Время
                            занятий может меняться — следите за обновлениями в
                            личном кабинете.
                        </p>
                    </div>
                </section>
            </Reveal>

            {/* ─── Stats ─── */}
            <Stagger className="mt-6 grid gap-4 sm:grid-cols-3">
                <Card className="border-brand/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
                            <CalendarDays className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div>
                            <p className="font-title text-2xl font-bold text-brand-dark">
                                {totalSlots}
                            </p>
                            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                активных слотов
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-brand/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
                            <Sparkles className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div>
                            <p className="font-title text-2xl font-bold text-brand-dark">
                                {uniqueDays.length}
                            </p>
                            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                дней в неделе
                            </p>
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-brand/10 transition-all hover:-translate-y-0.5 hover:shadow-md hover:shadow-brand/5">
                    <CardContent className="flex items-center gap-4 p-5">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand/20 to-brand/5">
                            <Layers className="h-5 w-5 text-brand-dark" />
                        </div>
                        <div>
                            <p className="font-title text-2xl font-bold text-brand-dark">
                                {uniqueSections.length}
                            </p>
                            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                направлений
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </Stagger>

            {/* ─── Schedule by Day ─── */}
            <div className="mt-8 space-y-5">
                {grouped.map(({ day, items }) => (
                    <Reveal key={day}>
                        <Card className="overflow-hidden border-brand/10">
                            {/* Day header */}
                            <div className="flex items-center gap-3 border-b border-brand/10 bg-gradient-to-r from-brand/8 to-transparent px-6 py-3.5">
                                <CalendarDays className="h-4 w-4 text-brand-dark" />
                                <h2 className="font-title text-base font-semibold">
                                    {day}
                                </h2>
                                <Badge variant="muted" className="ml-auto">
                                    {items.length}{' '}
                                    {items.length === 1 ? 'занятие' : 'занятий'}
                                </Badge>
                            </div>

                            {/* Slots */}
                            <CardContent className="divide-y divide-border/60 p-0">
                                {items.map((slot) => (
                                    <div
                                        key={slot.id}
                                        className="flex items-center gap-4 px-6 py-3.5 transition-colors hover:bg-surface/50"
                                    >
                                        {/* Time */}
                                        <div className="flex h-10 w-16 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                                            <span className="font-title text-sm font-bold text-brand-dark">
                                                {String(slot.start_time).slice(
                                                    0,
                                                    5,
                                                )}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">
                                                {slot.group?.name ||
                                                    slot.section?.name ||
                                                    'Занятие'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                {slot.instructor}
                                                {slot.section?.name &&
                                                    slot.group?.name &&
                                                    ` · ${slot.section.name}`}
                                            </p>
                                        </div>

                                        {/* End time */}
                                        {slot.end_time && (
                                            <div className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex">
                                                <Clock className="h-3 w-3" />
                                                до{' '}
                                                {String(slot.end_time).slice(
                                                    0,
                                                    5,
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </Reveal>
                ))}
            </div>

            {safeSlots.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Расписание пока не опубликовано
                    </CardContent>
                </Card>
            )}
        </SiteLayout>
    );
}
