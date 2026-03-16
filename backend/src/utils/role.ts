import { Role } from '@prisma/client';

export type ApiRole = 'admin' | 'user';

export const toApiRole = (role: Role | string | null | undefined): ApiRole => {
    if (!role) return 'user';
    return role.toString().toUpperCase() === 'ADMIN' ? 'admin' : 'user';
};

export const toDbRole = (role: string): Role => {
    return role.toLowerCase() === 'admin' ? 'ADMIN' : 'USER';
};
