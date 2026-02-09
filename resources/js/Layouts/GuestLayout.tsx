import { SupportWidget } from '@/widgets/support/SupportWidget';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren, useMemo } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const page = usePage();
    const currentPath = page.url.split('?')[0];

    const subtitle = useMemo(() => {
        if (currentPath.startsWith('/login')) {
            return 'Войдите в кабинет, чтобы управлять расписанием, оплатами и новостями секций.';
        }
        if (currentPath.startsWith('/register')) {
            return 'Создайте аккаунт за минуту и сразу получите доступ к личному кабинету DanceWave.';
        }
        if (currentPath.startsWith('/forgot-password')) {
            return 'Мы отправим ссылку на почту, чтобы вы быстро восстановили доступ.';
        }
        if (currentPath.startsWith('/reset-password')) {
            return 'Укажите новый пароль для безопасного входа в аккаунт.';
        }
        if (currentPath.startsWith('/verify-email')) {
            return 'Подтвердите email, чтобы активировать все функции кабинета.';
        }
        if (currentPath.startsWith('/confirm-password')) {
            return 'Подтвердите пароль для выполнения защищенного действия.';
        }

        return 'Единая платформа DanceWave для учеников, родителей и администраторов.';
    }, [currentPath]);

    return (
        <div className="relative min-h-screen overflow-x-hidden bg-gradient-to-br from-background via-background to-brand/10 px-4 sm:px-6 lg:px-8">
            <div className="pointer-events-none absolute inset-0 -z-10">
                <div className="dw-orb absolute -left-24 top-24 h-72 w-72 rounded-full bg-brand/15 blur-3xl" />
                <div className="dw-orb absolute -right-16 bottom-16 h-80 w-80 rounded-full bg-brand-dark/10 blur-3xl" />
            </div>

            <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center py-6 sm:py-8">
                <div className="grid w-full items-center gap-8 lg:grid-cols-[1fr_minmax(420px,520px)]">
                    <section className="hidden space-y-6 rounded-3xl border border-brand/20 bg-white/65 p-8 backdrop-blur lg:block">
                        <p className="dw-kicker">DanceWave Account</p>
                        <h1 className="font-title text-4xl leading-tight text-brand-dark">
                            Единый кабинет DanceWave
                        </h1>
                        <p className="max-w-lg text-muted-foreground">
                            {subtitle}
                        </p>
                        <div className="grid max-w-md gap-3">
                            <div className="rounded-xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
                                Персональное расписание по всем группам и
                                секциям.
                            </div>
                            <div className="rounded-xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
                                История платежей, ближайшие даты и быстрый
                                checkout.
                            </div>
                            <div className="rounded-xl border border-border bg-card/80 p-4 text-sm text-muted-foreground">
                                Чат поддержки на сайте и ответы админа из
                                Telegram.
                            </div>
                        </div>
                    </section>

                    <div className="dw-scale-in rounded-3xl border border-border bg-card/95 p-6 shadow-2xl sm:p-8">
                        <div className="mb-6 flex items-center justify-between">
                            <Link
                                href="/"
                                className="font-title text-2xl font-bold text-brand-dark"
                            >
                                DanceWave
                            </Link>
                            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
                                Secure Access
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
            <SupportWidget />
        </div>
    );
}
