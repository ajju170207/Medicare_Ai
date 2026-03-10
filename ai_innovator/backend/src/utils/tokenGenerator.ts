import jwt from 'jsonwebtoken';

export const generateToken = (id: string): string => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'secret', {
        expiresIn: process.env.JWT_EXPIRE || '30d',
    });
};

export default generateToken;
