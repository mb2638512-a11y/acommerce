import { User } from '../../types';

const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const SECRET_ADMIN_DASHBOARD_EMAIL = normalizeEmail(
    import.meta.env.VITE_ADMIN_DASHBOARD_EMAIL || ''
);

type AdminCandidate = Pick<User, 'role' | 'email'> | null | undefined;

export const canAccessAdminDashboard = (user: AdminCandidate): boolean => {
    if (!user) return false;
    if (!SECRET_ADMIN_DASHBOARD_EMAIL) return false;
    return user.role === 'admin' && normalizeEmail(user.email) === SECRET_ADMIN_DASHBOARD_EMAIL;
};

export const getPostLoginRoute = (user: AdminCandidate): '/admin' | '/dashboard' => {
    return canAccessAdminDashboard(user) ? '/admin' : '/dashboard';
};
