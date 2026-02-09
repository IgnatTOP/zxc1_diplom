type BadgeTone = 'default' | 'success' | 'warning' | 'destructive' | 'muted';

type StatusMeta = {
    label: string;
    tone: BadgeTone;
};

const applicationStatusMap: Record<string, StatusMeta> = {
    pending: { label: 'Новая', tone: 'warning' },
    assigned: { label: 'Назначена', tone: 'success' },
    rejected: { label: 'Отклонена', tone: 'destructive' },
    processed: { label: 'Обработана', tone: 'default' },
};

const supportStatusMap: Record<string, StatusMeta> = {
    open: { label: 'Открыт', tone: 'warning' },
    in_progress: { label: 'В работе', tone: 'default' },
    closed: { label: 'Закрыт', tone: 'muted' },
    resolved: { label: 'Решён', tone: 'success' },
};

const roleLabels: Record<string, string> = {
    admin: 'Администратор',
    user: 'Пользователь',
};

const senderTypeLabels: Record<string, string> = {
    admin: 'Админ',
    user: 'Пользователь',
    guest: 'Гость',
};

const messageSourceLabels: Record<string, string> = {
    admin: 'Админка',
    web: 'Сайт',
    telegram: 'Telegram',
};

const dashboardStatsLabels: Record<string, string> = {
    users: 'Пользователи',
    applications: 'Заявки',
    groups: 'Группы',
    activeGroups: 'Активные группы',
    scheduleItems: 'Активные занятия',
    blogPosts: 'Посты блога',
    sectionNews: 'Новости секций',
    galleryItems: 'Элементы галереи',
    supportOpen: 'Открытые чаты поддержки',
    enrollments: 'Записи в группы',
};

export function getApplicationStatusMeta(status?: string | null): StatusMeta {
    if (!status) {
        return { label: 'Не задан', tone: 'muted' };
    }

    const normalized = status.toLowerCase();

    return (
        applicationStatusMap[normalized] ?? {
            label: status,
            tone: 'muted',
        }
    );
}

export function getSupportStatusMeta(status?: string | null): StatusMeta {
    if (!status) {
        return { label: 'Не задан', tone: 'muted' };
    }

    const normalized = status.toLowerCase();

    return (
        supportStatusMap[normalized] ?? {
            label: status,
            tone: 'muted',
        }
    );
}

export function getRoleLabel(role?: string | null): string {
    if (!role) {
        return 'Роль не указана';
    }

    return roleLabels[role.toLowerCase()] ?? role;
}

export function getSenderTypeLabel(type?: string | null): string {
    if (!type) {
        return 'Неизвестно';
    }

    return senderTypeLabels[type.toLowerCase()] ?? type;
}

export function getMessageSourceLabel(source?: string | null): string {
    if (!source) {
        return 'Неизвестно';
    }

    return messageSourceLabels[source.toLowerCase()] ?? source;
}

export function getDashboardStatLabel(key: string): string {
    return dashboardStatsLabels[key] ?? key;
}
