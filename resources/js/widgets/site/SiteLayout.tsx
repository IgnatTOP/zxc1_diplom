import { Button } from '@/shared/ui/button';
import { PageTransition } from '@/shared/ui/motion';
import { SeoHead } from '@/shared/ui/seo-head';
import type { PageProps } from '@/types';
import { SupportWidget } from '@/widgets/support/SupportWidget';
import { Link, usePage } from '@inertiajs/react';
import { Menu } from 'lucide-react';
import { PropsWithChildren, useMemo, useState } from 'react';

type Props = PropsWithChildren<{
    meta?: {
        title?: string;
        description?: string;
        canonical?: string;
    };
}>;

const links = [
    { href: '/', label: 'Главная' },
    { href: '/about', label: 'О нас' },
    { href: '/directions', label: 'Направления' },
    { href: '/schedule', label: 'Расписание' },
    { href: '/gallery', label: 'Галерея' },
    { href: '/blog', label: 'Блог' },
    { href: '/prices', label: 'Цены' },
];

export function SiteLayout({ children, meta }: Props) {
    const page = usePage<PageProps>();
    const [open, setOpen] = useState(false);

    const currentUrl = page.url;
    const user = page.props.auth.user;

    const navLinks = useMemo(
        () =>
            links.map((link) => (
                <Link
                    key={link.href}
                    href={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                        currentUrl === link.href
                            ? 'bg-brand/15 text-brand-dark'
                            : 'text-foreground hover:bg-brand/10 hover:text-brand-dark'
                    }`}
                    onClick={() => setOpen(false)}
                >
                    {link.label}
                </Link>
            )),
        [currentUrl],
    );

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-b from-background via-background to-brand/5 text-foreground">
            <SeoHead meta={meta} />
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="dw-orb absolute -left-20 top-32 h-64 w-64 rounded-full bg-brand/10 blur-3xl" />
                <div className="dw-orb absolute -right-20 top-[26rem] h-72 w-72 rounded-full bg-brand-dark/10 blur-3xl" />
            </div>

            <header className="sticky top-0 z-30 border-b border-border/80 bg-background/85 backdrop-blur-md">
                <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <Link
                        href="/"
                        className="font-title text-xl font-bold tracking-tight text-brand-dark transition-transform duration-200 hover:scale-[1.02]"
                    >
                        DanceWave
                    </Link>

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navLinks}
                    </nav>

                    <div className="hidden items-center gap-2 lg:flex">
                        {user ? (
                            <>
                                {user.role === 'admin' ? (
                                    <Link
                                        href="/admin"
                                        className="text-sm text-muted-foreground hover:text-foreground"
                                    >
                                        Админка
                                    </Link>
                                ) : null}
                                <Link
                                    href="/profile"
                                    className="text-sm text-muted-foreground hover:text-foreground"
                                >
                                    Кабинет
                                </Link>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="text-sm text-muted-foreground hover:text-foreground"
                            >
                                Войти
                            </Link>
                        )}
                    </div>

                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="dw-scale-in lg:hidden"
                        onClick={() => setOpen((value) => !value)}
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                </div>

                {open ? (
                    <nav className="dw-page-enter space-y-1 border-t border-border p-3 lg:hidden">
                        {navLinks}
                    </nav>
                ) : null}
            </header>

            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <PageTransition pageKey={currentUrl}>{children}</PageTransition>
            </main>

            <footer className="border-t border-border/80 bg-surface/20">
                <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-8 text-sm text-muted-foreground sm:px-6 lg:grid-cols-3 lg:px-8">
                    <div>
                        <p className="font-semibold text-foreground">
                            © {new Date().getFullYear()} DanceWave
                        </p>
                        <p className="mt-2">
                            Современная студия танцев с личным кабинетом,
                            поддержкой и прозрачной оплатой.
                        </p>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">
                            Контакты
                        </p>
                        <div className="mt-2 flex flex-col gap-1">
                            <a href="tel:+79991234567">+7 (999) 123-45-67</a>
                            <a href="mailto:hello@dancewave.ru">
                                hello@dancewave.ru
                            </a>
                            <p>Москва, ул. Танцевальная, 12</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold text-foreground">Режим</p>
                        <div className="mt-2 flex flex-col gap-1">
                            <p>Пн-Пт: 09:00-22:00</p>
                            <p>Сб-Вс: 10:00-20:00</p>
                            <p>Поддержка в чате ежедневно</p>
                        </div>
                    </div>
                </div>
            </footer>

            <SupportWidget />
        </div>
    );
}
