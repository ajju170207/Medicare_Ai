import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

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
    session: Session | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    register: (email: string, password: string, fullName: string, phone?: string) => Promise<{ error?: string }>;
    login: (email: string, password: string) => Promise<{ error?: string }>;
    logout: () => Promise<void>;
    loadSession: () => Promise<void>;
    updateUser: (profile: Partial<UserProfile>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isAuthenticated: false,
    isLoading: true,

    loadSession: async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', session.user.id)
                .single();

            if (profile) {
                const names = (profile.full_name || '').split(' ');
                profile.firstName = names[0] || '';
                profile.lastName = names.slice(1).join(' ') || '';
            }

            set({
                session,
                user: profile,
                isAuthenticated: true,
                isLoading: false,
            });
        } else {
            set({ session: null, user: null, isAuthenticated: false, isLoading: false });
        }

        // Listen for auth state changes
        supabase.auth.onAuthStateChange(async (_event, session) => {
            if (session) {
                const { data: profile } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', session.user.id)
                    .single();

                if (profile) {
                    const names = (profile.full_name || '').split(' ');
                    profile.firstName = names[0] || '';
                    profile.lastName = names.slice(1).join(' ') || '';
                }

                set({ session, user: profile, isAuthenticated: true });
            } else {
                set({ session: null, user: null, isAuthenticated: false });
            }
        });
    },

    register: async (email, password, fullName, phone) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';
            const res = await fetch(`${apiUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, full_name: fullName, phone }),
            });
            const data = await res.json();
            if (!data.success) return { error: data.message };

            // After register, sign in to get session
            const { data: sessionData, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', sessionData.session!.user.id)
                .single();

            if (profile) {
                const names = (profile.full_name || '').split(' ');
                profile.firstName = names[0] || '';
                profile.lastName = names.slice(1).join(' ') || '';
            }

            set({ session: sessionData.session, user: profile, isAuthenticated: true });
            return {};
        } catch (err: any) {
            return { error: err.message };
        }
    },

    login: async (email, password) => {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });
            if (error) return { error: error.message };

            const { data: profile } = await supabase
                .from('users')
                .select('*')
                .eq('id', data.session!.user.id)
                .single();

            if (profile) {
                const names = (profile.full_name || '').split(' ');
                profile.firstName = names[0] || '';
                profile.lastName = names.slice(1).join(' ') || '';
            }

            set({ session: data.session, user: profile, isAuthenticated: true });
            return {};
        } catch (err: any) {
            return { error: err.message };
        }
    },

    logout: async () => {
        await supabase.auth.signOut();
        set({ session: null, user: null, isAuthenticated: false });
    },

    updateUser: (profile) => {
        const current = get().user;
        if (current) set({ user: { ...current, ...profile } });
    },
}));

// Helper to get the current access token for backend API calls
export const getAccessToken = async (): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
};
