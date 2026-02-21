export type AppTheme = 'light' | 'dark' | 'system';

type ResolvedTheme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'dw-theme';

function resolveTheme(theme: AppTheme): ResolvedTheme {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }

    return theme;
}

function applyResolvedTheme(theme: ResolvedTheme): void {
    const root = document.documentElement;
    root.classList.toggle('dark', theme === 'dark');
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
}

export function getStoredTheme(): AppTheme {
    if (typeof window === 'undefined') {
        return 'system';
    }

    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (value === 'light' || value === 'dark' || value === 'system') {
        return value;
    }

    return 'system';
}

export function applyTheme(theme: AppTheme): ResolvedTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    const resolved = resolveTheme(theme);
    applyResolvedTheme(resolved);

    window.dispatchEvent(
        new CustomEvent('dw-theme-change', {
            detail: {
                theme,
                resolved,
            },
        }),
    );

    return resolved;
}

export function setTheme(theme: AppTheme): ResolvedTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    return applyTheme(theme);
}

export function initTheme(): ResolvedTheme {
    if (typeof window === 'undefined') {
        return 'light';
    }

    return applyTheme(getStoredTheme());
}

export function subscribeToSystemThemeChange(
    callback: (resolved: ResolvedTheme) => void,
): () => void {
    if (typeof window === 'undefined') {
        return () => undefined;
    }

    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const handler = () => {
        if (getStoredTheme() === 'system') {
            callback(applyTheme('system'));
        }
    };

    media.addEventListener('change', handler);

    return () => {
        media.removeEventListener('change', handler);
    };
}

export function isDarkTheme(): boolean {
    if (typeof window === 'undefined') {
        return false;
    }

    return document.documentElement.classList.contains('dark');
}
