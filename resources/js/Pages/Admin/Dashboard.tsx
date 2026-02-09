import { getDashboardStatLabel } from '@/shared/lib/admin-labels';
import { Card, CardContent } from '@/shared/ui/card';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import { useMemo } from 'react';

type Props = {
    stats: Record<string, number>;
};

export default function Dashboard({ stats }: Props) {
    const orderedStats = useMemo(() => {
        const preferredOrder = [
            'applications',
            'supportOpen',
            'users',
            'enrollments',
            'groups',
            'activeGroups',
            'scheduleItems',
            'sectionNews',
            'blogPosts',
            'galleryItems',
        ];

        const ranked = Object.entries(stats).sort(([left], [right]) => {
            const leftIndex = preferredOrder.indexOf(left);
            const rightIndex = preferredOrder.indexOf(right);
            const safeLeft =
                leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
            const safeRight =
                rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
            return safeLeft - safeRight;
        });

        return ranked;
    }, [stats]);

    return (
        <AdminLayout title="Дашборд">
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {orderedStats.map(([key, value]) => (
                    <Card key={key}>
                        <CardContent className="space-y-2 p-4">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                Показатель
                            </p>
                            <p className="text-sm font-medium text-foreground">
                                {getDashboardStatLabel(key)}
                            </p>
                            <p className="text-3xl font-bold">{value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </AdminLayout>
    );
}
