// Token generation is no longer needed — Supabase Auth manages JWT tokens.
// This file is kept as a no-op to avoid broken imports if any remain.

export const generateToken = (_id: string): string => {
    console.warn('generateToken called but JWT is managed by Supabase — this is a no-op');
    return '';
};

export default generateToken;
