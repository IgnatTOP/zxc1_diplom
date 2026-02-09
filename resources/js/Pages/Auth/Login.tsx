import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function Login({
    status,
    canResetPassword,
}: {
    status?: string;
    canResetPassword: boolean;
}) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false as boolean,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Вход" />

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <div className="mb-6">
                <h1 className="font-title text-2xl">Вход в кабинет</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Введите данные аккаунта, чтобы открыть персональное
                    расписание и платежи.
                </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" />

                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        autoComplete="username"
                        isFocused={true}
                        onChange={(e) => setData('email', e.target.value)}
                    />

                    <InputError message={errors.email} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="Пароль" />

                    <TextInput
                        id="password"
                        type="password"
                        name="password"
                        value={data.password}
                        className="mt-1 block w-full"
                        autoComplete="current-password"
                        onChange={(e) => setData('password', e.target.value)}
                    />

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="block">
                    <label className="flex items-center">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) =>
                                setData('remember', e.target.checked || false)
                            }
                        />
                        <span className="ms-2 text-sm text-muted-foreground">
                            Запомнить меня
                        </span>
                    </label>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2">
                    {canResetPassword && (
                        <Link
                            href={route('password.request')}
                            className="text-sm font-medium text-brand-dark underline underline-offset-4"
                        >
                            Забыли пароль?
                        </Link>
                    )}

                    <PrimaryButton disabled={processing}>
                        {processing ? 'Входим...' : 'Войти'}
                    </PrimaryButton>
                </div>

                <p className="pt-2 text-sm text-muted-foreground">
                    Нет аккаунта?{' '}
                    <Link
                        href={route('register')}
                        className="font-semibold text-brand-dark underline underline-offset-4"
                    >
                        Зарегистрироваться
                    </Link>
                </p>
            </form>
        </GuestLayout>
    );
}
