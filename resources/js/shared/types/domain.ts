export type EnrollmentDto = {
    id: number;
    groupId: number;
    groupName: string;
    sectionId: number;
    sectionName: string;
    nextPaymentDueAt: string | null;
    billingAmount: number;
    currency: 'RUB' | string;
    status: 'active' | 'paused' | 'cancelled' | string;
};

export type PaymentDto = {
    id: number;
    enrollmentId: number;
    amount: number;
    currency: 'RUB' | string;
    status: 'success' | string;
    paidAt: string | null;
    cardBrand: string | null;
    cardLast4: string | null;
};

export type SectionNewsDto = {
    id: number;
    sectionId: number;
    sectionName: string;
    title: string;
    slug: string;
    summary: string | null;
    publishedAt: string | null;
};

export type SupportMessageDto = {
    id: number;
    conversationId: number;
    senderType: 'guest' | 'user' | 'admin';
    source: 'web' | 'admin' | 'telegram';
    body: string;
    sentAt: string | null;
};

export type SupportConversationDto = {
    id: number;
    status: string;
    guestToken?: string | null;
    userId?: number | null;
};
