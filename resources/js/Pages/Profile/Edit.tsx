import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({
    mustVerifyEmail,
    status,
}: PageProps<{ mustVerifyEmail: boolean; status?: string }>) {
    return (
        <AuthenticatedLayout
            header={
                <div>
                    <p className="dw-kicker">Account Settings</p>
                    <h2 className="mt-3 font-title text-2xl text-brand-dark">
                        Настройки профиля
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Управляйте персональными данными и безопасностью
                        аккаунта DanceWave.
                    </p>
                </div>
            }
        >
            <Head title="Настройки профиля" />

            <div className="dw-page-enter pb-10">
                <div className="mx-auto max-w-4xl space-y-5">
                    <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-2xl"
                        />
                    </div>

                    <div className="rounded-3xl border border-border bg-card/90 p-6 shadow-sm sm:p-8">
                        <UpdatePasswordForm className="max-w-2xl" />
                    </div>

                    <div className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 shadow-sm sm:p-8">
                        <DeleteUserForm className="max-w-2xl" />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
