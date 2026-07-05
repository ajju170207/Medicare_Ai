import { create } from 'zustand';
import api from '../services/api';

export interface UserProfile {
    id: string;
    full_name: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    avatar_url?: string;
    preferred_language: string;
    age?: number;
    gender?: string;
    state?: string;
    district?: string;
}

interface AuthState {
    user: UserProfile | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error?: string }>;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    logout: () => void;
    loadSession: () => Promise<void>;
    updateUser: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => {
    // Listen for global unauthorized events to automatically logout
    if (typeof window !== 'undefined') {
        window.addEventListener('auth:unauthorized', () => {
            get().logout();
        });
    }

    return {
        user: null,
        token: localStorage.getItem('token'),
        isAuthenticated: !!localStorage.getItem('token'),
        isLoading: true,

        loadSession: async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
                return;
            }

            try {
                const { data } = await api.get('/auth/me');
                const profile = data.data;
                if (profile) {
                    const names = (profile.full_name || '').split(' ');
                    profile.firstName = names[0] || '';
                    profile.lastName = names.slice(1).join(' ') || '';
                }
                set({ user: profile, isAuthenticated: true, isLoading: false });
            } catch (error) {
                localStorage.removeItem('token');
                set({ token: null, user: null, isAuthenticated: false, isLoading: false });
            }
        },

        register: async (email, password, fullName, phone) => {
            try {
                const { data } = await api.post('/auth/register', {
                    email,
                    password,
                    full_name: fullName,
                    phone
                });
                
                if (data.success && data.token) {
                    localStorage.setItem('token', data.token);
                    const profile = data.data;
                    const names = (profile.full_name || '').split(' ');
                    profile.firstName = names[0] || '';
                    profile.lastName = names.slice(1).join(' ') || '';
                    
                    set({ token: data.token, user: profile, isAuthenticated: true });
                    return {};
                }
                return { error: 'Registration failed' };
            } catch (err: any) {
                return { error: err.response?.data?.message || err.message };
            }
        },

        login: async (email, password) => {
            try {
                const { data } = await api.post('/auth/login', { email, password });
                
                if (data.success && data.token) {
                    localStorage.setItem('token', data.token);
                    const profile = data.data;
                    const names = (profile.full_name || '').split(' ');
                    profile.firstName = names[0] || '';
                    profile.lastName = names.slice(1).join(' ') || '';
                    
                    set({ token: data.token, user: profile, isAuthenticated: true });
                    return {};
                }
                return { error: 'Login failed' };
            } catch (err: any) {
                return { error: err.response?.data?.message || err.message };
            }
        },

        logout: () => {
            localStorage.removeItem('token');
            set({ token: null, user: null, isAuthenticated: false });
        },

        updateUser: (profile) => {
            const current = get().user;
            if (current) set({ user: { ...current, ...profile } });
        },
    };
});

// Helper to get the current access token for backend API calls
export const getAccessToken = async (): Promise<string | null> => {
    return localStorage.getItem('token');
};
