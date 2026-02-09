import { Config } from 'ziggy-js';

export interface User {
    id: number;
    name: string | null;
    email: string;
    role?: 'admin' | 'user' | string;
    email_verified_at?: string;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User | null;
    };
    ziggy: Config & { location: string };
};
