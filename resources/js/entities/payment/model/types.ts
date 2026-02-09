export type PaymentEntity = {
    id: number;
    amount_cents: number;
    currency: string;
    status: string;
    paid_at?: string | null;
};
