import { mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Reveal } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';

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
            <article className="mx-auto max-w-3xl space-y-6">
                <Reveal>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="muted">Блог DanceWave</Badge>
                        <Badge variant="muted">
                            Чтение: {readingMinutes} мин
                        </Badge>
                    </div>
                    <h1 className="mt-3 font-title text-3xl">{post.title}</h1>
                    {post.excerpt ? (
                        <p className="mt-3 text-lg text-muted-foreground">
                            {post.excerpt}
                        </p>
                    ) : null}
                </Reveal>

                {post.featured_image ? (
                    <Reveal delayMs={80}>
                        <img
                            src={mediaUrl(post.featured_image) || undefined}
                            alt={post.title}
                            className="w-full rounded-2xl object-cover shadow-lg"
                        />
                    </Reveal>
                ) : null}

                <Reveal delayMs={120}>
                    <div
                        className="prose prose-slate max-w-none leading-7"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </Reveal>

                <Reveal delayMs={160}>
                    <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5 text-sm text-muted-foreground">
                        Понравился материал? Сохраните страницу и проверьте
                        раздел новостей секции в личном кабинете, чтобы не
                        пропустить новые публикации и анонсы.
                    </div>
                </Reveal>
            </article>
        </SiteLayout>
    );
}
