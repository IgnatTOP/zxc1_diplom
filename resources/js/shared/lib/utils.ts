import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatMoney(cents: number, currency = 'RUB') {
    return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency,
        maximumFractionDigits: 0,
    }).format(cents / 100);
}

export function formatDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString('ru-RU', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
}

export function formatShortDate(value?: string | null) {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleDateString('ru-RU');
}

export function mediaUrl(path?: string | null) {
    if (!path) {
        return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }

    if (path.startsWith('/')) {
        return path;
    }

    return `/storage/${path}`;
}
