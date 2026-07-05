import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middleware/auth.middleware';

// @desc    Register user
// @route   POST /api/v1/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password, full_name, phone } = req.body;

        if (!email || !password || !full_name) {
            res.status(400).json({ success: false, message: 'Please provide email, password and full name' });
            return;
        }

        // Supabase Auth handles duplicates and hashing
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name, phone }
            }
        });

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        if (data.user) {
            // Because of our SQL trigger, the public.users row is created automatically
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token: data.session?.access_token || null,
                data: {
                    id: data.user.id,
                    email: data.user.email,
                    full_name: full_name,
                    phone: phone || null,
                    preferred_language: 'en',
                },
            });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Login user
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ success: false, message: 'Please provide email and password' });
            return;
        }

        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error || !data.user) {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
            return;
        }

        // Fetch user profile from public.users
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        res.status(200).json({
            success: true,
            token: data.session?.access_token,
            data: {
                id: data.user.id,
                email: data.user.email,
                full_name: profile?.full_name,
                phone: profile?.phone,
                preferred_language: profile?.preferred_language,
                avatar_url: profile?.avatar_url,
                age: profile?.age,
                gender: profile?.gender,
                state: profile?.state,
                district: profile?.district,
                last_login_at: profile?.last_login_at,
            },
        });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { data: profile, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', req.user!.id)
            .single();

        if (error || !profile) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: profile });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Update user profile
// @route   PUT /api/v1/auth/profile
// @access  Private
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const { full_name, age, gender, state, district, preferred_language, avatar_url } = req.body;

        const { data: updatedUser, error } = await supabase
            .from('users')
            .update({ full_name, age, gender, state, district, preferred_language, avatar_url })
            .eq('id', req.user!.id)
            .select()
            .single();

        if (error || !updatedUser) {
            res.status(400).json({ success: false, message: 'Error updating profile' });
            return;
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
