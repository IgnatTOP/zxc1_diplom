import { SeoHead } from '@/shared/ui/seo-head';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';

const links = [
    { href: '/admin', label: 'Дашборд' },
    { href: '/admin/applications', label: 'Заявки' },
    { href: '/admin/groups', label: 'Группы' },
    { href: '/admin/schedule', label: 'Расписание' },
    { href: '/admin/sections', label: 'Секции' },
    { href: '/admin/section-news', label: 'Новости секций' },
    { href: '/admin/support', label: 'Поддержка' },
    { href: '/admin/billing', label: 'Биллинг' },
    { href: '/admin/users', label: 'Пользователи' },
    { href: '/admin/blog', label: 'Блог' },
    { href: '/admin/gallery', label: 'Галерея' },
    { href: '/admin/about', label: 'О нас' },
];

type Props = PropsWithChildren<{
    title: string;
}>;

export function AdminLayout({ title, children }: Props) {
    const page = usePage<PageProps>();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const currentUrl = page.url.split('?')[0];

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-brand/10">
            <SeoHead meta={{ title: `${title} — Админка DanceWave` }} />
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="dw-orb absolute -left-10 top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
                <div className="dw-orb absolute -right-14 top-80 h-72 w-72 rounded-full bg-brand-dark/10 blur-3xl" />
            </div>

            <div className="mx-auto w-full max-w-[1500px] px-4 py-6 sm:px-6 lg:px-8">
                <div className="mb-4 flex items-center justify-between rounded-2xl border border-border bg-card/90 px-4 py-3 shadow-sm lg:hidden">
                    <Link
                        href="/"
                        className="font-title text-xl text-brand-dark"
                    >
                        DanceWave
                    </Link>
                    <button
                        type="button"
                        className="rounded-lg border border-border p-2 text-muted-foreground"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        aria-label="Переключить меню админки"
                    >
                        {isMenuOpen ? (
                            <X className="h-5 w-5" />
                        ) : (
                            <Menu className="h-5 w-5" />
                        )}
                    </button>
                </div>

                <div className="grid items-start gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
                    <aside
                        className={`${isMenuOpen ? 'block' : 'hidden'} lg:block`}
                    >
                        <div className="dw-scale-in rounded-3xl border border-border bg-card/95 p-5 shadow-sm lg:sticky lg:top-6">
                            <div className="mb-5 border-b border-border pb-4">
                                <p className="dw-kicker">Панель управления</p>
                                <p className="mt-3 font-title text-2xl text-brand-dark">
                                    Админка
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    Управление секциями, расписанием, заявками,
                                    новостями и пользователями.
                                </p>
                            </div>

                            <nav className="space-y-1.5">
                                {links.map((link) => {
                                    const active =
                                        link.href === '/admin'
                                            ? currentUrl === link.href
                                            : currentUrl.startsWith(link.href);
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className={`block rounded-xl px-3 py-2.5 text-sm transition ${
                                                active
                                                    ? 'bg-brand/15 font-semibold text-brand-dark shadow-sm'
                                                    : 'text-foreground hover:bg-surface'
                                            }`}
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    );
                                })}
                            </nav>

                            <div className="mt-6 space-y-3 border-t border-border pt-4">
                                <div className="rounded-xl border border-border bg-surface/60 p-3">
                                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                        Вы вошли как
                                    </p>
                                    <p className="mt-1 text-sm font-semibold">
                                        {page.props.auth.user?.name ||
                                            'Администратор'}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {page.props.auth.user?.email ||
                                            'Без email'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <Link
                                        href="/"
                                        className="rounded-lg border border-border px-3 py-2 text-center text-sm font-medium text-foreground transition hover:bg-surface"
                                    >
                                        Сайт
                                    </Link>
                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="rounded-lg border border-border px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-surface hover:text-foreground"
                                    >
                                        Выйти
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    <div className="min-w-0 space-y-4">
                        <header className="dw-scale-in rounded-3xl border border-border bg-card/90 p-5 shadow-sm">
                            <p className="dw-kicker">Админ-панель</p>
                            <h1 className="mt-3 font-title text-2xl text-brand-dark md:text-3xl">
                                {title}
                            </h1>
                            <p className="mt-2 text-sm text-muted-foreground">
                                Единая рабочая зона для управления заявками,
                                расписанием, секциями и пользователями.
                            </p>
                        </header>
                        <div className="dw-page-enter space-y-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
