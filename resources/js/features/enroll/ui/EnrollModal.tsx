import { apiPost } from '@/shared/api/http';
import { Button } from '@/shared/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/shared/ui/dialog';
import { Input } from '@/shared/ui/input';
import { usePage } from '@inertiajs/react';
import {
    AlertCircle,
    CheckCircle2,
    Loader2,
    Music,
    Send,
    Sparkles,
    User2,
} from 'lucide-react';
import { FormEvent, useCallback, useState } from 'react';

export type EnrollableGroup = {
    id: number;
    section_id: number;
    name: string;
    level: string | null;
    style: string | null;
    billing_amount_cents: number;
    currency: string;
    section?: { id: number; name: string } | null;
};

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    groups: EnrollableGroup[];
    /** Pre-select a specific group */
    preselectedGroupId?: number | null;
};

type Step = 'form' | 'sending' | 'success' | 'error';

export function EnrollModal({
    open,
    onOpenChange,
    groups,
    preselectedGroupId,
}: Props) {
    const page = usePage();
    const auth = (page.props as { auth: { user: { id: number; name: string | null; email: string } | null } }).auth;
    const isAuth = !!auth.user;

    const [step, setStep] = useState<Step>('form');
    const [groupId, setGroupId] = useState<number | ''>(preselectedGroupId ?? (groups[0]?.id ?? ''));
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [email, setEmail] = useState('');
    const [comment, setComment] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    const resetForm = useCallback(() => {
        setStep('form');
        setName('');
        setPhone('');
        setEmail('');
        setComment('');
        setErrorMsg('');
    }, []);

    const handleOpenChange = useCallback(
        (value: boolean) => {
            if (!value) {
                resetForm();
            }
            onOpenChange(value);
        },
        [onOpenChange, resetForm],
    );

    const selectedGroup = groups.find((g) => g.id === groupId);

    const submit = async (event: FormEvent) => {
        event.preventDefault();
        setStep('sending');
        setErrorMsg('');

        try {
            if (isAuth) {
                await apiPost('/api/v1/enrollments/apply', {
                    groupId,
                    phone: phone || undefined,
                    comment: comment || undefined,
                });
            } else {
                await apiPost('/api/v1/applications', {
                    name,
                    phone,
                    email: email || undefined,
                    groupId: groupId || undefined,
                    comment: comment || undefined,
                });
            }
            setStep('success');
        } catch (err: unknown) {
            const msg =
                err && typeof err === 'object' && 'message' in err
                    ? (err as { message: string }).message
                    : 'Произошла ошибка. Попробуйте ещё раз.';
            setErrorMsg(msg);
            setStep('error');
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent className="max-w-md">
                {/* ── SUCCESS STEP ── */}
                {step === 'success' && (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                            <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-title text-xl font-bold">
                                Заявка принята!
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {isAuth
                                    ? 'Ваша запись ожидает подтверждения. Вы увидите статус в личном кабинете.'
                                    : 'Мы свяжемся с вами в ближайшее время для подтверждения записи.'}
                            </p>
                        </div>

                        {/* ── What happens next ── */}
                        <div className="w-full space-y-2 rounded-xl bg-surface/60 p-4 text-left">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Что дальше
                            </p>
                            <div className="space-y-2.5">
                                <StepIndicator
                                    num={1}
                                    done
                                    label="Заявка отправлена"
                                />
                                <StepIndicator
                                    num={2}
                                    label="Администратор подтвердит запись"
                                />
                                <StepIndicator
                                    num={3}
                                    label={
                                        isAuth
                                            ? 'Группа появится в личном кабинете'
                                            : 'Вам позвонят или напишут'
                                    }
                                />
                            </div>
                        </div>

                        <Button
                            className="mt-2 w-full"
                            onClick={() => handleOpenChange(false)}
                        >
                            <Sparkles className="mr-1.5 h-4 w-4" />
                            Понятно
                        </Button>
                    </div>
                )}

                {/* ── ERROR STEP ── */}
                {step === 'error' && (
                    <div className="flex flex-col items-center gap-4 py-6 text-center">
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/40">
                            <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-1.5">
                            <h3 className="font-title text-xl font-bold">
                                Ошибка
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                {errorMsg}
                            </p>
                        </div>
                        <Button
                            variant="outline"
                            className="mt-2 w-full"
                            onClick={() => setStep('form')}
                        >
                            Попробовать снова
                        </Button>
                    </div>
                )}

                {/* ── FORM STEP ── */}
                {(step === 'form' || step === 'sending') && (
                    <>
                        <DialogHeader>
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand/10">
                                    <Music className="h-4 w-4 text-brand-dark" />
                                </div>
                                <div>
                                    <DialogTitle>
                                        Записаться в группу
                                    </DialogTitle>
                                    <DialogDescription>
                                        {isAuth
                                            ? 'Выберите группу — мы подтвердим запись'
                                            : 'Заполните форму — мы свяжемся с вами'}
                                    </DialogDescription>
                                </div>
                            </div>
                        </DialogHeader>

                        <form
                            className="mt-4 space-y-3"
                            onSubmit={submit}
                        >
                            {/* Group selector */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Группа
                                </label>
                                <select
                                    className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm transition-colors focus:border-brand/40 focus:outline-none focus:ring-2 focus:ring-brand/15"
                                    value={groupId}
                                    onChange={(e) =>
                                        setGroupId(
                                            e.target.value
                                                ? Number(e.target.value)
                                                : '',
                                        )
                                    }
                                    required
                                >
                                    <option value="" disabled>
                                        Выберите группу…
                                    </option>
                                    {groups.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.section?.name
                                                ? `${g.section.name} · `
                                                : ''}
                                            {g.name}
                                            {g.level ? ` (${g.level})` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Selected group info */}
                            {selectedGroup && (
                                <div className="rounded-xl bg-brand/5 px-3 py-2.5 text-[13px] text-muted-foreground">
                                    <span className="font-medium text-foreground">
                                        {selectedGroup.section?.name} ·{' '}
                                        {selectedGroup.name}
                                    </span>
                                    {selectedGroup.billing_amount_cents > 0 && (
                                        <span className="ml-1.5">
                                            —{' '}
                                            {(
                                                selectedGroup.billing_amount_cents /
                                                100
                                            ).toLocaleString('ru-RU')}{' '}
                                            ₽/мес
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Guest-only fields */}
                            {!isAuth && (
                                <>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Ваше имя
                                        </label>
                                        <Input
                                            placeholder="Иван Петров"
                                            value={name}
                                            onChange={(e) =>
                                                setName(e.target.value)
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground">
                                            Email{' '}
                                            <span className="text-muted-foreground/60">
                                                (необязательно)
                                            </span>
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="ivan@example.com"
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                        />
                                    </div>
                                </>
                            )}

                            {/* Phone — for both */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Телефон{' '}
                                    {isAuth && (
                                        <span className="text-muted-foreground/60">
                                            (необязательно)
                                        </span>
                                    )}
                                </label>
                                <Input
                                    placeholder="+7 (999) 123-45-67"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required={!isAuth}
                                />
                            </div>

                            {/* Comment */}
                            <div className="space-y-1">
                                <label className="text-xs font-medium text-muted-foreground">
                                    Комментарий{' '}
                                    <span className="text-muted-foreground/60">
                                        (необязательно)
                                    </span>
                                </label>
                                <Input
                                    placeholder="Опыт, пожелания…"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                />
                            </div>

                            {/* Auth badge */}
                            {isAuth && (
                                <div className="flex items-center gap-2 rounded-xl bg-emerald-50/80 px-3 py-2 text-xs text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                    <User2 className="h-3.5 w-3.5 shrink-0" />
                                    Вы авторизованы как{' '}
                                    <span className="font-medium">
                                        {auth.user?.email}
                                    </span>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full"
                                disabled={step === 'sending'}
                            >
                                {step === 'sending' ? (
                                    <>
                                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                        Отправляем…
                                    </>
                                ) : (
                                    <>
                                        <Send className="mr-1.5 h-4 w-4" />
                                        Записаться
                                    </>
                                )}
                            </Button>
                        </form>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}

/* ── Step indicator ── */
function StepIndicator({
    num,
    label,
    done,
}: {
    num: number;
    label: string;
    done?: boolean;
}) {
    return (
        <div className="flex items-center gap-2.5">
            <div
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${done
                    ? 'bg-emerald-500 text-white'
                    : 'bg-brand/10 text-brand-dark'
                    }`}
            >
                {done ? '✓' : num}
            </div>
            <span className="text-sm text-foreground">{label}</span>
        </div>
    );
}
