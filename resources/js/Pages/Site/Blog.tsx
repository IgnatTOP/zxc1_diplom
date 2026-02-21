import { formatShortDate, mediaUrl } from '@/shared/lib/utils';
import { Badge } from '@/shared/ui/badge';
import { Card, CardContent } from '@/shared/ui/card';
import { Reveal, Stagger } from '@/shared/ui/motion';
import { SiteLayout } from '@/widgets/site/SiteLayout';
import { Link } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    CalendarDays,
    Sparkles,
} from 'lucide-react';

type Post = {
    id: number;
    title: string;
    slug: string;
    excerpt?: string | null;
    featured_image?: string | null;
    published_at?: string | null;
};

type Props = {
    posts: Post[];
    meta?: { title?: string; description?: string; canonical?: string };
};

export default function Blog({ posts, meta }: Props) {
    const [featured, ...rest] = posts;

    return (
        <SiteLayout meta={meta}>
            {/* ─── Hero ─── */}
            <Reveal>
                <section className="relative overflow-hidden rounded-3xl border border-brand/20 p-8 lg:p-12">
                    <div className="absolute inset-0 bg-gradient-to-br from-brand/12 via-brand/5 to-transparent" />
                    <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-brand/10 blur-[80px]" />
                    <div className="relative">
                        <Badge variant="default" className="mb-4">
                            <BookOpen className="mr-1 h-3 w-3" />
                            Блог
                        </Badge>
                        <h1 className="max-w-xl font-title text-3xl font-bold leading-tight lg:text-4xl">
                            Статьи и{' '}
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                новости
                            </span>
                        </h1>
                        <p className="mt-2 max-w-lg text-base leading-relaxed text-muted-foreground">
                            Полезные материалы о танцах, расписание мероприятий и
                            анонсы студии DanceWave.
                        </p>
                    </div>
                </section>
            </Reveal>

            {/* ─── Featured Post ─── */}
            {featured && (
                <Reveal className="mt-8">
                    <Link href={`/blog/${featured.slug}`}>
                        <Card className="group overflow-hidden border-brand/10 transition-all duration-300 hover:border-brand/25 hover:shadow-xl hover:shadow-brand/10">
                            <div className="grid gap-0 lg:grid-cols-[1.3fr_1fr]">
                                {featured.featured_image ? (
                                    <div className="relative h-60 overflow-hidden lg:h-full">
                                        <img
                                            src={
                                                mediaUrl(
                                                    featured.featured_image,
                                                ) || undefined
                                            }
                                            alt={featured.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-black/10" />
                                        <Badge className="absolute left-4 top-4 bg-white/20 text-white backdrop-blur-sm">
                                            <Sparkles className="mr-1 h-3 w-3" />
                                            Рекомендуем
                                        </Badge>
                                    </div>
                                ) : (
                                    <div className="flex h-60 items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5 lg:h-full">
                                        <BookOpen className="h-12 w-12 text-brand/30" />
                                    </div>
                                )}
                                <CardContent className="flex flex-col justify-center space-y-3 p-6 lg:p-8">
                                    {featured.published_at && (
                                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                            <CalendarDays className="h-3 w-3" />
                                            {formatShortDate(
                                                featured.published_at,
                                            )}
                                        </div>
                                    )}
                                    <h2 className="font-title text-xl font-semibold transition-colors group-hover:text-brand-dark lg:text-2xl">
                                        {featured.title}
                                    </h2>
                                    {featured.excerpt && (
                                        <p className="text-sm leading-relaxed text-muted-foreground">
                                            {featured.excerpt}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-1 text-sm font-semibold text-brand-dark">
                                        Читать статью
                                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                                    </p>
                                </CardContent>
                            </div>
                        </Card>
                    </Link>
                </Reveal>
            )}

            {/* ─── Posts Grid ─── */}
            {rest.length > 0 && (
                <Stagger className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {rest.map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`}>
                            <Card className="group h-full overflow-hidden border-brand/10 transition-all duration-300 hover:-translate-y-1 hover:border-brand/25 hover:shadow-lg hover:shadow-brand/10">
                                {post.featured_image ? (
                                    <div className="relative h-44 overflow-hidden">
                                        <img
                                            src={
                                                mediaUrl(
                                                    post.featured_image,
                                                ) || undefined
                                            }
                                            alt={post.title}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                                        {post.published_at && (
                                            <Badge className="absolute right-3 top-3 bg-white/20 text-white backdrop-blur-sm">
                                                <CalendarDays className="mr-1 h-3 w-3" />
                                                {formatShortDate(
                                                    post.published_at,
                                                )}
                                            </Badge>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex h-44 items-center justify-center bg-gradient-to-br from-brand/15 to-brand/5">
                                        <BookOpen className="h-8 w-8 text-brand/30" />
                                    </div>
                                )}
                                <CardContent className="space-y-2 p-5">
                                    <h3 className="font-semibold transition-colors group-hover:text-brand-dark">
                                        {post.title}
                                    </h3>
                                    {post.excerpt && (
                                        <p className="line-clamp-2 text-sm text-muted-foreground">
                                            {post.excerpt}
                                        </p>
                                    )}
                                    <p className="flex items-center gap-1 pt-1 text-xs font-semibold text-brand-dark">
                                        Читать
                                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                                    </p>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </Stagger>
            )}

            {posts.length === 0 && (
                <Card className="mt-8">
                    <CardContent className="py-12 text-center text-muted-foreground">
                        Публикации скоро появятся
                    </CardContent>
                </Card>
            )}
        </SiteLayout>
    );
}
