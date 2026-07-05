-- ==========================================
-- SUPABASE SCHEMA MIGRATION SCRIPT
-- Copy and paste this entirely into your Supabase SQL Editor
-- ==========================================

-- Clean up existing tables (Warning: this deletes existing data in these tables!)
DROP TABLE IF EXISTS public.user_history CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.emergency_contacts CASCADE;
DROP TABLE IF EXISTS public.daily_tips CASCADE;
DROP TABLE IF EXISTS public.diseases CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 1. Create Public Users Table (Links to auth.users)
CREATE TABLE public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    preferred_language TEXT DEFAULT 'en',
    avatar_url TEXT,
    age INTEGER,
    gender TEXT,
    state TEXT,
    district TEXT,
    last_login_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Function to automatically create a public.users row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 2. Diseases Table
CREATE TABLE public.diseases (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    disease_name TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    precautions TEXT[] DEFAULT '{}',
    medications TEXT[] DEFAULT '{}',
    diet TEXT[] DEFAULT '{}',
    workout TEXT[] DEFAULT '{}',
    specialist TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Daily Tips Table
CREATE TABLE public.daily_tips (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    tip_text TEXT NOT NULL,
    category TEXT NOT NULL,
    language TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 4. Emergency Contacts
CREATE TABLE public.emergency_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    relation TEXT NOT NULL,
    phone TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 5. Notifications
CREATE TABLE public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    type TEXT DEFAULT 'system',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 6. User History (Symptom Assessments)
CREATE TABLE public.user_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    symptoms TEXT[] NOT NULL,
    predicted_disease TEXT NOT NULL,
    chat_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_history ENABLE ROW LEVEL SECURITY;

-- Create Policies (Users can only see and edit their own data)
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own contacts" ON public.emergency_contacts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own contacts" ON public.emergency_contacts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own contacts" ON public.emergency_contacts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own history" ON public.user_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own history" ON public.user_history FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Diseases and Tips are public read-only
ALTER TABLE public.diseases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view diseases" ON public.diseases FOR SELECT USING (true);

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view daily tips" ON public.daily_tips FOR SELECT USING (true);
