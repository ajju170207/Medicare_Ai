import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import { generateToken } from '../utils/tokenGenerator';
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

        // Check if user exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400).json({ success: false, message: 'User already exists' });
            return;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            full_name,
            phone: phone || null,
            preferred_language: 'en',
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                token: generateToken(user.id),
                data: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    preferred_language: user.preferred_language,
                },
            });
        } else {
            res.status(400).json({ success: false, message: 'Invalid user data' });
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

        // Find user by email
        const user = await User.findOne({ email });

        if (user && user.password && (await bcrypt.compare(password, user.password))) {
            // Update last_login_at
            user.last_login_at = new Date();
            await user.save();

            res.status(200).json({
                success: true,
                token: generateToken(user.id),
                data: {
                    id: user.id,
                    email: user.email,
                    full_name: user.full_name,
                    phone: user.phone,
                    preferred_language: user.preferred_language,
                    avatar_url: user.avatar_url,
                    age: user.age,
                    gender: user.gender,
                    state: user.state,
                    district: user.district,
                    last_login_at: user.last_login_at,
                },
            });
        } else {
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const user = await User.findById(req.user!.id).select('-password');

        if (!user) {
            res.status(404).json({ success: false, message: 'User not found' });
            return;
        }

        res.status(200).json({ success: true, data: user });
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

        const updatedUser = await User.findByIdAndUpdate(
            req.user!.id,
            { full_name, age, gender, state, district, preferred_language, avatar_url },
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            res.status(400).json({ success: false, message: 'Error updating profile' });
            return;
        }

        res.status(200).json({ success: true, data: updatedUser });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};
