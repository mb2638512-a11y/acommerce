import axios from 'axios';
import { auth, firebaseInitialized } from './firebase';
import { USE_FIREBASE } from './config';

// Prefer explicit env override; otherwise use same-origin /api
// to avoid hardcoding localhost in production builds.
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
});

api.interceptors.request.use(async (config) => {
    try {
        // Only try Firebase token if Firebase is properly configured and enabled
        if (USE_FIREBASE && firebaseInitialized && auth) {
            const user = auth.currentUser;
            if (user) {
                try {
                    const token = await user.getIdToken();
                    config.headers.Authorization = `Bearer ${token}`;
                    return config;
                } catch (tokenError) {
                    console.warn('API Interceptor: Failed to get Firebase token, falling back to local token:', tokenError);
                }
            }
        }
        // Fall back to local JWT token from localStorage
        const localToken = localStorage.getItem('token');
        if (localToken) {
            config.headers.Authorization = `Bearer ${localToken}`;
        }
    } catch (error) {
        console.error('API Interceptor: Error getting token', error);
        // Still try to use local token as fallback
        const localToken = localStorage.getItem('token');
        if (localToken) {
            config.headers.Authorization = `Bearer ${localToken}`;
        }
    }
    return config;
});

// Add response interceptor to handle auth errors
// Don't auto-clear tokens on 401 - let the app handle it gracefully
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Only clear tokens if this is NOT a login/register endpoint
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
