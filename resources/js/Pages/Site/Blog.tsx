import { formatShortDate, mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { Link } from '@inertiajs/react';

type Props = {
    posts: Array<{
        id: number;
        slug: string;
        title: string;
        excerpt?: string | null;
        featured_image?: string | null;
        published_date?: string | null;
    }>;
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Blog({ posts, meta }: Props) {
    return (
        <SiteLayout meta={meta}>
            <Reveal>
                <h1 className="font-title text-3xl">Блог</h1>
                <p className="mt-2 max-w-3xl text-muted-foreground">
                    Полезные материалы о тренировках, подготовке к выступлениям
                    и жизни студии. Новые публикации автоматически появляются в
                    личном кабинете по вашей секции.
                </p>
            </Reveal>

            <Reveal className="mt-6" delayMs={60}>
                <Card className="border-brand/20 bg-brand/5">
                    <CardContent className="p-5 text-sm text-muted-foreground">
                        Совет: добавляйте интересные статьи в закладки браузера,
                        а в карточках новостей секций в кабинете всегда
                        проверяйте ближайшие анонсы мероприятий.
                    </CardContent>
                </Card>
            </Reveal>

            <Stagger className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {posts.map((post) => (
                    <Card key={post.id}>
                        <CardContent className="space-y-3 p-4">
                            {post.featured_image ? (
                                <img
                                    src={
                                        mediaUrl(post.featured_image) ||
                                        undefined
                                    }
                                    alt={post.title}
                                    className="h-44 w-full rounded-xl object-cover"
                                />
                            ) : (
                                <div className="h-44 rounded-xl bg-brand/20" />
                            )}
                            <Badge variant="muted">
                                {formatShortDate(post.published_date)}
                            </Badge>
                            <h2 className="line-clamp-2 font-semibold">
                                {post.title}
                            </h2>
                            <p className="line-clamp-3 text-sm text-muted-foreground">
                                {post.excerpt || 'Читать подробнее в статье.'}
                            </p>
                            <Link
                                href={`/blog/${post.slug || `post-${post.id}`}`}
                                className="text-sm font-semibold text-brand-dark"
                            >
                                Читать статью
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </Stagger>
        </SiteLayout>
    );
}
