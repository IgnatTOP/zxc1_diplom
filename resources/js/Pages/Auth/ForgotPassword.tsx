import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function ForgotPassword({ status }: { status?: string }) {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('password.email'));
    };

    return (
        <GuestLayout>
            <Head title="Восстановление пароля" />

            <div className="mb-6">
                <h1 className="font-title text-2xl">Восстановление доступа</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Укажите email аккаунта. Мы отправим ссылку для установки
                    нового пароля.
                </p>
            </div>

            {status && (
                <div className="mb-4 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-4">
                <div>
                    <InputLabel htmlFor="email" value="Email" />
                    <TextInput
                        id="email"
                        type="email"
                        name="email"
                        value={data.email}
                        className="mt-1 block w-full"
                        isFocused={true}
                        autoComplete="username"
                        onChange={(e) => setData('email', e.target.value)}
                    />
                </div>

                <InputError message={errors.email} className="mt-2" />

                <div className="flex items-center justify-between gap-3 pt-2">
                    <Link
                        href={route('login')}
                        className="text-sm font-medium text-brand-dark underline underline-offset-4"
                    >
                        Вернуться ко входу
                    </Link>

                    <PrimaryButton disabled={processing}>
                        {processing ? 'Отправляем...' : 'Отправить ссылку'}
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
