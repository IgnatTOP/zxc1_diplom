export type ConversationEntity = {
    id: number;
    status: string;
    user_id?: number | null;
    guest_token?: string | null;
};
