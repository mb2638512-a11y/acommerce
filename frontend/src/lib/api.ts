import axios from 'axios';
import { auth, firebaseInitialized } from './firebase';
import { USE_FIREBASE } from './config';

// Use relative path for production (Vercel rewrites /api/* to backend)
// Use localhost only for local development
const getBaseURL = () => {
    if (import.meta.env.VITE_API_URL) {
        return import.meta.env.VITE_API_URL;
    }
    if (typeof window !== 'undefined' && window.location?.origin) {
        return `${window.location.origin}/api`;
    }
    return '/api';
};

const api = axios.create({
    baseURL: getBaseURL(),
    timeout: 30000,
});

api.interceptors.request.use(async (config) => {
    try {
        const localToken = localStorage.getItem('token');
        if (localToken) {
            config.headers.Authorization = `Bearer ${localToken}`;
        } else if (USE_FIREBASE && firebaseInitialized && auth) {
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken();
                    config.headers.Authorization = `Bearer ${token}`;
                } catch {
                    // Firebase token fetch failed, continue without auth
                }
            }
        }
    } catch (error) {
        console.error('API Interceptor: Error getting token', error);
        const localToken = localStorage.getItem('token');
        if (localToken) {
            config.headers.Authorization = `Bearer ${localToken}`;
        }
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.code === 'ERR_NETWORK') {
            console.error('Network error: Cannot reach API server. Check if backend is running and CORS is configured.');
        }
        if (error.response?.status === 401) {
            const url = error.config?.url || '';
            const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register') || url.includes('/auth/google') || url.includes('/auth/verify');
            if (!isAuthEndpoint) {
                console.warn('API 401 on:', url, '- keeping token for retry');
            }
        }
        return Promise.reject(error);
    }
);

export default api;
