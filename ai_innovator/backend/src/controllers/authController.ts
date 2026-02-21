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

        // 1. Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
        });

        if (authError || !authData.user) {
            res.status(400).json({ success: false, message: authError?.message || 'Registration failed' });
            return;
        }

        // 2. Insert profile into public.users
        const { data: profile, error: profileError } = await supabase
            .from('users')
            .insert({
                id: authData.user.id,
                full_name,
                email,
                phone: phone || null,
                email_verified: true,
            })
            .select()
            .single();

        if (profileError) {
            // Cleanup auth user if profile creation fails
            await supabase.auth.admin.deleteUser(authData.user.id);
            res.status(400).json({ success: false, message: profileError.message });
            return;
        }

        // 3. Sign in to get session token
        const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError || !session.session) {
            res.status(201).json({ success: true, message: 'Account created. Please log in.', data: profile });
            return;
        }

        res.status(201).json({
            success: true,
            token: session.session.access_token,
            data: profile,
        });
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

        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error || !data.session) {
            res.status(401).json({ success: false, message: error?.message || 'Invalid credentials' });
            return;
        }

        // Fetch user profile
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        // Update last_login_at
        await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', data.user.id);

        res.status(200).json({
            success: true,
            token: data.session.access_token,
            data: profile,
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

        if (error) {
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

        const { data, error } = await supabase
            .from('users')
            .update({ full_name, age, gender, state, district, preferred_language, avatar_url })
            .eq('id', req.user!.id)
            .select()
            .single();

        if (error) {
            res.status(400).json({ success: false, message: error.message });
            return;
        }

        res.status(200).json({ success: true, data });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
