import type { PageProps } from '@/types';
import { SupportWidget } from '@/widgets/support/SupportWidget';
import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { PropsWithChildren, ReactNode, useMemo, useState } from 'react';

export default function Authenticated({
    header,
    children,
}: PropsWithChildren<{ header?: ReactNode }>) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;
    const currentUrl = page.url;

    const [showMenu, setShowMenu] = useState(false);
    const links = useMemo(
        () =>
            [
                { href: '/profile', label: 'Кабинет' },
                { href: '/profile/settings', label: 'Настройки' },
                ...(user?.role === 'admin'
                    ? [{ href: '/admin', label: 'Админка' }]
                    : []),
            ] as Array<{ href: string; label: string }>,
        [user?.role],
    );

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-brand/10">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="dw-orb absolute left-0 top-20 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
                <div className="dw-orb absolute -right-10 top-72 h-72 w-72 rounded-full bg-brand-dark/10 blur-3xl" />
            </div>

            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="font-title text-xl font-bold text-brand-dark"
                    >
                        DanceWave
                    </Link>

                    <nav className="hidden items-center gap-2 lg:flex">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                                    currentUrl.startsWith(link.href)
                                        ? 'bg-brand/15 text-brand-dark'
                                        : 'text-foreground hover:bg-brand/10 hover:text-brand-dark'
                                }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="text-right">
                            <p className="text-sm font-semibold">
                                {user?.name || 'Пользователь'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {user?.email || ''}
                            </p>
                        </div>
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="rounded-lg border border-border px-3 py-2 text-sm text-muted-foreground transition hover:bg-surface hover:text-foreground"
                        >
                            Выйти
                        </Link>
                    </div>

                    <button
                        type="button"
                        className="rounded-lg border border-border p-2 text-muted-foreground lg:hidden"
                        onClick={() => setShowMenu((value) => !value)}
                        aria-label="Открыть меню"
                    >
                        <Menu className="h-5 w-5" />
                    </button>
                </div>
                {showMenu ? (
                    <div className="space-y-1 border-t border-border px-4 py-3 lg:hidden">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`block rounded-lg px-3 py-2 text-sm ${
                                    currentUrl.startsWith(link.href)
                                        ? 'bg-brand/15 text-brand-dark'
                                        : 'text-foreground hover:bg-brand/10'
                                }`}
                                onClick={() => setShowMenu(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="block w-full rounded-lg border border-border px-3 py-2 text-left text-sm text-muted-foreground hover:bg-surface"
                        >
                            Выйти
                        </Link>
                    </div>
                ) : null}
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {header ? (
                    <div className="mb-6 rounded-2xl border border-border bg-card/85 p-5 shadow-sm">
                        {header}
                    </div>
                ) : null}
                {children}
            </main>
            <SupportWidget />
        </div>
    );
}
