import { SeoHead } from '@/shared/ui/seo-head';
import { Input } from '@/shared/ui/input';
import { isDarkTheme, setTheme } from '@/shared/lib/theme';
import type { PageProps } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    CreditCard,
    ExternalLink,
    FileText,
    HeadphonesIcon,
    Home,
    Image,
    Info,
    Layers,
    LogOut,
    Menu,
    Moon,
    Newspaper,
    Search,
    Send,
    Sun,
    Users,
    X,
} from 'lucide-react';
import {
    PropsWithChildren,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

type NavGroup = 'main' | 'students' | 'training' | 'content' | 'integration';

type AdminLink = {
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    group: NavGroup;
    keywords: string[];
};

const links: AdminLink[] = [
    {
        href: '/admin',
        label: 'Дашборд',
        icon: Home,
        group: 'main',
        keywords: ['главная', 'dashboard', 'обзор'],
    },
    {
        href: '/admin/applications',
        label: 'Заявки',
        icon: FileText,
        group: 'students',
        keywords: ['лиды', 'клиенты', 'запросы'],
    },
    {
        href: '/admin/users',
        label: 'Пользователи',
        icon: Users,
        group: 'students',
        keywords: ['аккаунты', 'роли'],
    },
    {
        href: '/admin/support',
        label: 'Поддержка',
        icon: HeadphonesIcon,
        group: 'students',
        keywords: ['чат', 'тикеты', 'support'],
    },
    {
        href: '/admin/billing',
        label: 'Оплаты',
        icon: CreditCard,
        group: 'students',
        keywords: ['платежи', 'billing'],
    },
    {
        href: '/admin/groups',
        label: 'Группы',
        icon: Layers,
        group: 'training',
        keywords: ['состав', 'набор', 'классы'],
    },
    {
        href: '/admin/schedule',
        label: 'Расписание',
        icon: CalendarDays,
        group: 'training',
        keywords: ['занятия', 'время', 'дни'],
    },
    {
        href: '/admin/sections',
        label: 'Секции',
        icon: BookOpen,
        group: 'content',
        keywords: ['направления', 'категории'],
    },
    {
        href: '/admin/section-news',
        label: 'Новости секций',
        icon: Newspaper,
        group: 'content',
        keywords: ['анонсы', 'публикации'],
    },
    {
        href: '/admin/gallery',
        label: 'Галерея',
        icon: Image,
        group: 'content',
        keywords: ['фото', 'изображения'],
    },
    {
        href: '/admin/about',
        label: 'О клубе',
        icon: Info,
        group: 'content',
        keywords: ['команда', 'контент'],
    },
    {
        href: '/admin/blog',
        label: 'Блог',
        icon: FileText,
        group: 'content',
        keywords: ['статьи', 'посты'],
    },
    {
        href: '/admin/telegram',
        label: 'Telegram',
        icon: Send,
        group: 'integration',
        keywords: ['бот', 'интеграция', 'webhook'],
    },
];

const groupTitles: Record<NavGroup, string> = {
    main: 'Главное',
    students: 'Клиенты и сервис',
    training: 'Тренировочный процесс',
    content: 'Контент сайта',
    integration: 'Интеграции',
};

function isActive(currentUrl: string, href: string) {
    if (href === '/admin') return currentUrl === '/admin';
    return currentUrl.startsWith(href);
}

export function AdminLayout({
    title,
    children,
}: PropsWithChildren<{ title: string }>) {
    const page = usePage<PageProps>();
    const user = page.props.auth.user;
    const currentUrl = page.url;

    const [mobileOpen, setMobileOpen] = useState(false);
    const [navQuery, setNavQuery] = useState('');
    const [isDarkMode, setIsDarkMode] = useState<boolean>(() =>
        isDarkTheme(),
    );
    const searchRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        const handler = () => setIsDarkMode(isDarkTheme());
        window.addEventListener('dw-theme-change', handler);
        return () => window.removeEventListener('dw-theme-change', handler);
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            const target = event.target as HTMLElement | null;
            const inEditableField = Boolean(
                target?.closest('input, textarea, select, [contenteditable="true"]'),
            );

            if (event.key === '/' && !inEditableField) {
                event.preventDefault();
                searchRef.current?.focus();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, []);

    const groupedLinks = useMemo(() => {
        const normalizedQuery = navQuery.trim().toLowerCase();

        const filteredLinks = links.filter((link) => {
            if (!normalizedQuery) return true;

            const haystack = [link.label, link.href, ...link.keywords]
                .join(' ')
                .toLowerCase();
            return haystack.includes(normalizedQuery);
        });

        return (Object.keys(groupTitles) as NavGroup[])
            .map((group) => ({
                group,
                title: groupTitles[group],
                items: filteredLinks.filter((link) => link.group === group),
            }))
            .filter((section) => section.items.length > 0);
    }, [navQuery]);

    const toggleTheme = () => {
        const nextTheme = isDarkMode ? 'light' : 'dark';
        setTheme(nextTheme);
        setIsDarkMode(nextTheme === 'dark');
    };

    return (
        <>
            <SeoHead meta={{ title: `${title} — Админ-панель` }} />

            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            <div className="flex min-h-screen bg-background text-foreground">
                <aside
                    className={`
                        fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-border bg-card
                        transition-transform duration-300 ease-in-out
                        lg:static lg:translate-x-0
                        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    `}
                >
                    <div className="flex h-16 items-center justify-between border-b border-border bg-gradient-to-r from-brand/8 to-transparent px-5">
                        <Link
                            href="/admin"
                            className="flex items-center gap-2 text-lg font-bold tracking-tight"
                        >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand/15 text-sm font-black text-brand-dark">
                                DW
                            </span>
                            <span className="bg-gradient-to-r from-brand-dark to-brand bg-clip-text text-transparent">
                                Admin
                            </span>
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(false)}
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-brand/10 lg:hidden"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="border-b border-border px-4 py-3">
                        <div className="relative">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                ref={searchRef}
                                value={navQuery}
                                onChange={(event) => setNavQuery(event.target.value)}
                                placeholder="Поиск раздела (/)..."
                                className="h-10 pl-9"
                            />
                        </div>
                    </div>

                    <nav className="flex-1 overflow-y-auto px-3 py-4">
                        {groupedLinks.map((section) => (
                            <div key={section.group} className="mb-4 last:mb-0">
                                <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                                    {section.title}
                                </p>
                                <ul className="space-y-1">
                                    {section.items.map((link) => {
                                        const active = isActive(currentUrl, link.href);
                                        const Icon = link.icon;
                                        return (
                                            <li key={link.href}>
                                                <Link
                                                    href={link.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`
                                                        group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors
                                                        ${active
                                                            ? 'bg-brand/15 text-brand-dark'
                                                            : 'text-foreground/75 hover:bg-brand/10 hover:text-foreground'
                                                        }
                                                    `}
                                                >
                                                    <Icon
                                                        className={`h-5 w-5 shrink-0 ${active ? 'text-brand-dark' : 'text-muted-foreground group-hover:text-foreground'}`}
                                                    />
                                                    {link.label}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        ))}

                        {groupedLinks.length === 0 ? (
                            <p className="rounded-xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
                                По запросу ничего не найдено.
                            </p>
                        ) : null}
                    </nav>

                    <div className="space-y-3 border-t border-border px-4 py-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand/10 text-sm font-bold text-brand-dark">
                                {(user?.name ?? user?.email ?? 'A')
                                    .charAt(0)
                                    .toUpperCase()}
                            </div>
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-medium">
                                    {user?.name ?? 'Администратор'}
                                </p>
                                <p className="truncate text-xs text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <Link
                                href="/"
                                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-brand/10"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                                На сайт
                            </Link>
                            <Link
                                href="/logout"
                                method="post"
                                as="button"
                                className="inline-flex h-9 items-center justify-center gap-1 rounded-lg border border-border bg-background px-3 text-xs font-semibold text-foreground hover:bg-red-100 hover:text-red-700 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                            >
                                <LogOut className="h-3.5 w-3.5" />
                                Выйти
                            </Link>
                        </div>
                    </div>
                </aside>

                <div className="flex flex-1 flex-col">
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border bg-card/85 px-4 backdrop-blur-md lg:px-6">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="rounded-lg p-2 text-muted-foreground hover:bg-brand/10 lg:hidden"
                        >
                            <Menu className="h-5 w-5" />
                        </button>

                        <h1 className="font-title text-lg font-bold tracking-tight">{title}</h1>

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                type="button"
                                onClick={toggleTheme}
                                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 text-sm font-semibold text-foreground transition-colors hover:bg-brand/10"
                                aria-label={isDarkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
                            >
                                {isDarkMode ? (
                                    <Sun className="h-4 w-4" />
                                ) : (
                                    <Moon className="h-4 w-4" />
                                )}
                                <span className="hidden sm:inline">
                                    {isDarkMode ? 'Светлая' : 'Тёмная'}
                                </span>
                            </button>
                        </div>
                    </header>

                    <main className="flex-1 space-y-4 p-4 lg:p-6">{children}</main>
                </div>
            </div>
        </>
    );
}
