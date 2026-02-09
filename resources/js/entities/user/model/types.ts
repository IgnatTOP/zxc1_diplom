export type UserEntity = {
    id: number;
    name: string | null;
    email: string;
    role?: 'admin' | 'user' | string;
};
