import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { BookOpen, Clock, Share2 } from 'lucide-react';

type Props = {
    post: {
        id: number;
        title: string;
        excerpt?: string | null;
        content: string;
        featured_image?: string | null;
    };
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function BlogPost({ post, meta }: Props) {
    const textContent = post.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const readingMinutes = Math.max(1, Math.ceil(textContent.length / 1200));

    return (
        <SiteLayout meta={meta}>
            <article className="mx-auto max-w-3xl space-y-8">
                <Reveal>
                    <div className="space-y-4">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="default">
                                <BookOpen className="mr-1 h-3 w-3" />
                                Блог DanceWave
                            </Badge>
                            <Badge variant="muted">
                                <Clock className="mr-1 h-3 w-3" />
                                Чтение: {readingMinutes} мин
                            </Badge>
                        </div>
                        <h1 className="font-title text-3xl font-bold leading-tight lg:text-4xl">
                            {post.title}
                        </h1>
                        {post.excerpt && (
                            <p className="text-lg leading-relaxed text-muted-foreground">
                                {post.excerpt}
                            </p>
                        )}
                    </div>
                </Reveal>

                {post.featured_image && (
                    <Reveal delayMs={80}>
                        <div className="overflow-hidden rounded-2xl border border-brand/10 shadow-lg shadow-brand/5">
                            <img
                                src={mediaUrl(post.featured_image) || undefined}
                                alt={post.title}
                                className="w-full object-cover"
                            />
                        </div>
                    </Reveal>
                )}

                <Reveal delayMs={120}>
                    <div
                        className="prose prose-slate max-w-none leading-7 prose-headings:font-title prose-a:text-brand-dark prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </Reveal>

                <Reveal delayMs={160}>
                    <Card className="border-brand/20 bg-gradient-to-br from-brand/8 to-transparent">
                        <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
                            <p className="text-sm text-muted-foreground">
                                Понравился материал? Сохраните страницу и
                                проверьте раздел новостей в личном кабинете.
                            </p>
                            <button
                                className="inline-flex items-center gap-2 rounded-xl border border-brand/20 px-4 py-2 text-sm font-medium text-brand-dark transition-colors hover:bg-brand/10"
                                onClick={() => {
                                    navigator.clipboard?.writeText(
                                        window.location.href,
                                    );
                                }}
                            >
                                <Share2 className="h-3.5 w-3.5" />
                                Скопировать ссылку
                            </button>
                        </CardContent>
                    </Card>
                </Reveal>
            </article>
        </SiteLayout>
    );
}
