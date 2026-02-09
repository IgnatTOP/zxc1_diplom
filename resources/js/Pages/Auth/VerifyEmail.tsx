import PrimaryButton from '@/Components/PrimaryButton';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function VerifyEmail({ status }: { status?: string }) {
    const { post, processing } = useForm({});

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('verification.send'));
    };

    return (
        <GuestLayout>
            <Head title="Подтверждение email" />

            <div className="mb-6">
                <h1 className="font-title text-2xl">Подтвердите email</h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Мы отправили письмо с ссылкой активации. После подтверждения
                    станут доступны все функции кабинета.
                </p>
            </div>

            {status === 'verification-link-sent' && (
                <div className="mb-4 rounded-xl bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-700">
                    Новая ссылка подтверждения отправлена на вашу почту.
                </div>
            )}

            <form onSubmit={submit}>
                <div className="flex items-center justify-between gap-3">
                    <PrimaryButton disabled={processing}>
                        {processing
                            ? 'Отправляем...'
                            : 'Отправить письмо повторно'}
                    </PrimaryButton>

                    <Link
                        href={route('logout')}
                        method="post"
                        as="button"
                        className="text-sm font-medium text-brand-dark underline underline-offset-4"
                    >
                        Выйти
                    </Link>
                </div>
            </form>
        </GuestLayout>
    );
}
