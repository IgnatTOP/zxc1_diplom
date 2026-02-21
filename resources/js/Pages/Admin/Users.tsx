import { apiPatch } from '@/shared/api/http';
import { AdminSelect } from '@/shared/ui/admin-select';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Card, CardContent } from '@/shared/ui/card';
import { Input } from '@/shared/ui/input';
import { AdminLayout } from '@/widgets/admin/AdminLayout';
import {
    AlertCircle,
    CheckCircle2,
    Search,
    Shield,
    Users as UsersIcon,
    GraduationCap,
} from 'lucide-react';
import { useMemo, useState } from 'react';

type ScheduleItem = {
    id: number;
    group_id: number;
    instructor: string;
    day_of_week: string;
    start_time: string;
    end_time: string;
};

type GroupOption = {
    id: number;
    name: string;
    section_id: number;
    scheduleItems?: ScheduleItem[];
};

type EnrollmentItem = {
    id: number;
    status: string;
    group_id: number;
    next_payment_due_at?: string | null;
    group?: {
        id: number;
        name: string;
        scheduleItems?: ScheduleItem[];
    };
};

type UserItem = {
    id: number;
    name?: string | null;
    email: string;
    role: string;
    created_at?: string | null;
    enrollments?: EnrollmentItem[];
};

type Props = {
    users?: UserItem[];
    items?: UserItem[];
    groups?: GroupOption[];
};

function getErrorMessage(error: unknown): string {
    return error instanceof Error
        ? error.message
        : 'Не удалось выполнить запрос.';
}

function formatDate(value?: string | null): string {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function toDateTimeLocal(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
}

function toIsoDateTime(value: string): string | null {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

function isDue(value?: string | null): boolean {
    if (!value) return false;
    const d = new Date(value);
    return !Number.isNaN(d.getTime()) && d < new Date();
}

export default function Users({ users, items, groups = [] }: Props) {
    const initialUsers = Array.isArray(users)
        ? users
        : Array.isArray(items)
            ? items
            : [];
    const [list, setList] = useState<UserItem[]>(initialUsers);
    const [savingId, setSavingId] = useState<string | null>(null);
    const [query, setQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'user'>(
        'all',
    );
    const [tab, setTab] = useState<'all' | 'students'>('all');
    const [notice, setNotice] = useState<{
        tone: 'success' | 'error';
        text: string;
    } | null>(null);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        return list.filter((u) => {
            if (tab === 'students') {
                if (!u.enrollments || u.enrollments.length === 0) return false;
            } else {
                if (roleFilter !== 'all' && u.role !== roleFilter) return false;
            }
            if (!q) return true;
            return [u.name, u.email, String(u.id)]
                .join(' ')
                .toLowerCase()
                .includes(q);
        });
    }, [list, query, roleFilter, tab]);

    const adminCount = list.filter((u) => u.role === 'admin').length;
    const studentCount = list.filter(
        (u) => u.enrollments && u.enrollments.length > 0,
    ).length;

    const saveUser = async (item: UserItem) => {
        setSavingId(`u-${item.id}`);
        setNotice(null);
        try {
            const payload = await apiPatch<{ ok: boolean; item: UserItem }>(
                `/api/v1/admin/users/${item.id}`,
                { name: item.name || '', role: item.role },
            );
            // Preserve enrollments as they might not be returned by standard user update
            setList((prev) =>
                prev.map((row) =>
                    row.id === item.id
                        ? { ...payload.item, enrollments: row.enrollments }
                        : row,
                ),
            );
            setNotice({
                tone: 'success',
                text: `Пользователь #${item.id} обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    const saveEnrollment = async (userId: number, enrollment: EnrollmentItem) => {
        setSavingId(`e-${enrollment.id}`);
        setNotice(null);
        try {
            const payload = await apiPatch<{ ok: boolean; item: EnrollmentItem }>(
                `/api/v1/admin/billing/enrollments/${enrollment.id}`,
                {
                    status: enrollment.status,
                    nextPaymentDueAt: toIsoDateTime(
                        toDateTimeLocal(enrollment.next_payment_due_at),
                    ),
                    groupId: enrollment.group_id,
                },
            );

            setList((prev) =>
                prev.map((user) => {
                    if (user.id !== userId) return user;
                    return {
                        ...user,
                        enrollments: user.enrollments?.map((e) =>
                            e.id === enrollment.id ? payload.item : e,
                        ),
                    };
                }),
            );

            setNotice({
                tone: 'success',
                text: `Абонемент #${enrollment.id} пользователя обновлён.`,
            });
        } catch (error) {
            setNotice({ tone: 'error', text: getErrorMessage(error) });
        } finally {
            setSavingId(null);
        }
    };

    return (
        <AdminLayout title="Пользователи">
            {notice && (
                <div
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium ${notice.tone === 'success'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400'
                            : 'bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-400'
                        }`}
                >
                    {notice.tone === 'success' ? (
                        <CheckCircle2 className="h-4 w-4 shrink-0" />
                    ) : (
                        <AlertCircle className="h-4 w-4 shrink-0" />
                    )}
                    {notice.text}
                </div>
            )}

            {/* ─── Stats + Filters ─── */}
            <Card>
                <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-950/40">
                            <UsersIcon className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold">
                                Всего: {list.length}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Администраторов: {adminCount} · Учеников:{' '}
                                {studentCount}
                            </p>
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="flex gap-1 rounded-xl bg-surface p-1">
                            <button
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'all'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setTab('all')}
                            >
                                Все ({list.length})
                            </button>
                            <button
                                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === 'students'
                                        ? 'bg-card text-foreground shadow-sm'
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                onClick={() => setTab('students')}
                            >
                                Ученики ({studentCount})
                            </button>
                        </div>

                        <div className="relative flex-1">
                            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                className="pl-9"
                                value={query}
                                placeholder="Поиск по имени, email"
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>

                        {tab === 'all' && (
                            <AdminSelect
                                className="w-full sm:w-44"
                                value={roleFilter}
                                onChange={(e) =>
                                    setRoleFilter(
                                        e.target.value as
                                        | 'all'
                                        | 'admin'
                                        | 'user',
                                    )
                                }
                            >
                                <option value="all">Все роли</option>
                                <option value="admin">Администраторы</option>
                                <option value="user">Обычные</option>
                            </AdminSelect>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* ─── Users List ─── */}
            <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {filtered.map((item) => (
                    <Card
                        key={item.id}
                        className="transition-shadow hover:shadow-md"
                    >
                        <CardContent className="space-y-3 p-5">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    {/* Avatar */}
                                    <div
                                        className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${sessionStorage.getItem('avatar') ||
                                            (item.role === 'admin'
                                                ? 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-400'
                                                : 'bg-brand/10 text-brand-dark')
                                            }`}
                                    >
                                        {(item.name || item.email)
                                            .charAt(0)
                                            .toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold">
                                            {item.name || 'Без имени'}{' '}
                                            <span className="text-xs font-normal text-muted-foreground">
                                                #{item.id}
                                            </span>
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {item.email}
                                        </p>
                                    </div>
                                </div>
                                <Badge
                                    variant={
                                        item.role === 'admin'
                                            ? 'default'
                                            : 'muted'
                                    }
                                >
                                    {item.role === 'admin' && (
                                        <Shield className="mr-1 h-3 w-3" />
                                    )}
                                    {item.role === 'admin'
                                        ? 'Админ'
                                        : 'Пользователь'}
                                </Badge>
                            </div>

                            {tab === 'all' && (
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">
                                            Имя
                                        </label>
                                        <Input
                                            value={item.name || ''}
                                            placeholder="Имя пользователя"
                                            onChange={(e) =>
                                                setList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                name: e.target
                                                                    .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-muted-foreground">
                                            Роль
                                        </label>
                                        <AdminSelect
                                            value={item.role}
                                            onChange={(e) =>
                                                setList((prev) =>
                                                    prev.map((row) =>
                                                        row.id === item.id
                                                            ? {
                                                                ...row,
                                                                role: e.target
                                                                    .value,
                                                            }
                                                            : row,
                                                    ),
                                                )
                                            }
                                        >
                                            <option value="user">Обычный</option>
                                            <option value="admin">Админ</option>
                                        </AdminSelect>
                                    </div>
                                </div>
                            )}

                            {tab === 'students' &&
                                item.enrollments?.map((enrollment) => {
                                    const sched =
                                        enrollment.group?.scheduleItems || [];
                                    const instructor =
                                        sched.length > 0
                                            ? Array.from(
                                                new Set(
                                                    sched.map(
                                                        (s) => s.instructor,
                                                    ),
                                                ),
                                            )
                                                .filter(Boolean)
                                                .join(', ')
                                            : '—';
                                    const scheduleText =
                                        sched.length > 0
                                            ? sched
                                                .map(
                                                    (s) =>
                                                        `${s.day_of_week} ${s.start_time.slice(0, 5)}`,
                                                )
                                                .join(', ')
                                            : '—';
                                    const overdue =
                                        isDue(enrollment.next_payment_due_at) &&
                                        enrollment.status === 'active';

                                    return (
                                        <div
                                            key={enrollment.id}
                                            className="mt-2 space-y-3 rounded-xl border border-border bg-surface p-3"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <GraduationCap className="h-4 w-4 text-brand-dark" />
                                                    <span className="text-sm font-medium">
                                                        Абонемент #{enrollment.id}
                                                    </span>
                                                </div>
                                                <Badge
                                                    variant={
                                                        enrollment.status ===
                                                            'active'
                                                            ? 'success'
                                                            : 'warning'
                                                    }
                                                >
                                                    {enrollment.status}
                                                </Badge>
                                            </div>

                                            <div className="grid gap-3 sm:grid-cols-2">
                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">
                                                        Группа
                                                    </label>
                                                    <AdminSelect
                                                        value={
                                                            enrollment.group_id
                                                        }
                                                        onChange={(e) => {
                                                            const newGroup =
                                                                groups.find(
                                                                    (g) =>
                                                                        g.id ===
                                                                        Number(
                                                                            e
                                                                                .target
                                                                                .value,
                                                                        ),
                                                                );
                                                            setList((prev) =>
                                                                prev.map((u) => {
                                                                    if (
                                                                        u.id !==
                                                                        item.id
                                                                    )
                                                                        return u;
                                                                    return {
                                                                        ...u,
                                                                        enrollments:
                                                                            u.enrollments?.map(
                                                                                (
                                                                                    enr,
                                                                                ) =>
                                                                                    enr.id ===
                                                                                        enrollment.id
                                                                                        ? {
                                                                                            ...enr,
                                                                                            group_id:
                                                                                                Number(
                                                                                                    e
                                                                                                        .target
                                                                                                        .value,
                                                                                                ),
                                                                                            group: newGroup,
                                                                                        }
                                                                                        : enr,
                                                                            ),
                                                                    };
                                                                }),
                                                            );
                                                        }}
                                                    >
                                                        {groups.map((g) => (
                                                            <option
                                                                key={g.id}
                                                                value={g.id}
                                                            >
                                                                {g.name}
                                                            </option>
                                                        ))}
                                                    </AdminSelect>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-xs text-muted-foreground">
                                                        След. оплата{' '}
                                                        {overdue && (
                                                            <span className="text-amber-500">
                                                                ⚠
                                                            </span>
                                                        )}
                                                    </label>
                                                    <Input
                                                        type="datetime-local"
                                                        value={toDateTimeLocal(
                                                            enrollment.next_payment_due_at,
                                                        )}
                                                        onChange={(e) =>
                                                            setList((prev) =>
                                                                prev.map((u) => {
                                                                    if (
                                                                        u.id !==
                                                                        item.id
                                                                    )
                                                                        return u;
                                                                    return {
                                                                        ...u,
                                                                        enrollments:
                                                                            u.enrollments?.map(
                                                                                (
                                                                                    enr,
                                                                                ) =>
                                                                                    enr.id ===
                                                                                        enrollment.id
                                                                                        ? {
                                                                                            ...enr,
                                                                                            next_payment_due_at:
                                                                                                e
                                                                                                    .target
                                                                                                    .value,
                                                                                        }
                                                                                        : enr,
                                                                            ),
                                                                    };
                                                                }),
                                                            )
                                                        }
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {instructor}
                                                    </p>
                                                    <p>Преподаватель</p>
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-foreground">
                                                        {scheduleText}
                                                    </p>
                                                    <p>Расписание</p>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-2">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    disabled={
                                                        savingId ===
                                                        `e-${enrollment.id}`
                                                    }
                                                    onClick={() =>
                                                        saveEnrollment(
                                                            item.id,
                                                            enrollment,
                                                        )
                                                    }
                                                >
                                                    Сохранить абонемент
                                                </Button>
                                            </div>
                                        </div>
                                    );
                                })}

                            {tab === 'all' && (
                                <div className="flex items-center justify-between border-t border-border/50 pt-3">
                                    <p className="text-xs text-muted-foreground">
                                        Регистрация:{' '}
                                        {formatDate(item.created_at)}
                                    </p>
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={savingId === `u-${item.id}`}
                                        onClick={() => saveUser(item)}
                                    >
                                        Сохранить
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filtered.length === 0 && (
                <Card className="mt-4">
                    <CardContent className="py-10 text-center text-muted-foreground">
                        {list.length === 0
                            ? 'Пользователей пока нет.'
                            : 'По фильтру ничего не найдено.'}
                    </CardContent>
                </Card>
            )}
        </AdminLayout>
    );
}
