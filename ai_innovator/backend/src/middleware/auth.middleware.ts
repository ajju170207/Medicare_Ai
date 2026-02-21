import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

export interface AuthUser {
    id: string;
    email?: string;
    phone?: string;
    full_name?: string;
    preferred_language?: string;
    avatar_url?: string;
    age?: number;
    gender?: string;
    state?: string;
    district?: string;
}

export interface AuthRequest extends Request {
    user?: AuthUser;
}

export const protect = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): Promise<void> => {
    let token: string | undefined;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        res.status(401).json({ success: false, message: 'Not authorized to access this route' });
        return;
    }

    try {
        // Verify the Supabase JWT
        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            res.status(401).json({ success: false, message: 'Invalid or expired token' });
            return;
        }

        // Load full profile from public.users
        const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', user.id)
            .single();

        req.user = {
            id: user.id,
            email: user.email,
            phone: user.phone,
            ...profile,
        };

        next();
    } catch (err) {
        res.status(401).json({ success: false, message: 'Not authorized to access this route' });
    }
};
