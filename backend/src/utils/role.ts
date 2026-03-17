// Role and Status types for SQLite compatibility
export type Role = 'USER' | 'ADMIN';
export type KYCStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'UNVERIFIED';
export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type FulfillmentStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type CommissionStatus = 'PENDING' | 'PAID' | 'CANCELLED';

export type ApiRole = 'admin' | 'user';

export const toApiRole = (role: Role | string | null | undefined): ApiRole => {
    if (!role) return 'user';
    return role.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'user';
};

export const toDbRole = (role: string): Role => {
    return (role.toLowerCase() === 'admin' ? 'ADMIN' : 'USER') as Role;
};
