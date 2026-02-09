import { mediaUrl } from '@/shared/lib/utils';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

type Props = {
    items: Array<{
        id: number;
        filename: string;
        title?: string | null;
        alt_text?: string | null;
    }>;
    collages: Array<{
        id: number;
        title: string;
        main_image: string;
        photos?: string[] | null;
    }>;
    layout: 'grid' | 'masonry' | string;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Gallery({ items, collages, meta }: Props) {
    const gallery = items.length
        ? items.map((item) => ({
              id: `item-${item.id}`,
              title: item.title || 'Фото',
              image: mediaUrl(item.filename),
              alt: item.alt_text || item.title || 'Gallery image',
          }))
        : collages.flatMap((collage) => [
              {
                  id: `collage-main-${collage.id}`,
                  title: collage.title,
                  image: mediaUrl(collage.main_image),
                  alt: collage.title,
              },
              ...(collage.photos || []).map((photo, index) => ({
                  id: `collage-${collage.id}-${index}`,
                  title: collage.title,
                  image: mediaUrl(photo),
                  alt: `${collage.title} ${index + 1}`,
              })),
          ]);

    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <h1 className="font-title text-3xl">Галерея</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Фото с тренировок, выступлений и мероприятий студии.
                    Обновляется по мере появления новых коллажей и альбомов.
                </p>
            </Reveal>

            <Reveal className="mt-6" delayMs={70}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="grid gap-3 p-5 sm:grid-cols-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                Всего материалов
                            </p>
                            <p className="mt-1 font-title text-2xl text-brand-dark">
                                {gallery.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">
                                Коллажей
                            </p>
                            <p className="mt-1 font-title text-2xl text-brand-dark">
                                {collages.length}
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-muted-foreground">
                                Для новых учеников: в галерее можно оценить
                                формат занятий и атмосферу в группах.
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </Reveal>

            <Stagger className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {gallery.map((item) => (
                    <Card key={item.id}>
                        <CardContent className="p-2">
                            {item.image ? (
                                <img
                                    src={item.image}
                                    alt={item.alt}
                                    className="h-40 w-full rounded-xl object-cover transition-transform duration-300 hover:scale-[1.03] sm:h-48"
                                />
                            ) : (
                                <div className="h-40 rounded-xl bg-brand/20 sm:h-48" />
                            )}
                            <p className="px-1 pb-1 pt-2 text-xs text-muted-foreground">
                                {item.title}
                            </p>
                        </CardContent>
                    </Card>
                ))}
            </Stagger>
        </SiteLayout>
    );
}
