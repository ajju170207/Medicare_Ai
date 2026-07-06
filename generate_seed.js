const fs = require('fs');

const seedSql = fs.readFileSync('backend/scripts/seed_disease_library.sql', 'utf8');
const fixedSeedSql = seedSql.replace(/public\.disease_library/g, 'public.diseases');

const finalSql = `
-- 1. Fix emergency_contacts table for Hospital Finder
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE public.emergency_contacts ADD COLUMN IF NOT EXISTS available_24h BOOLEAN DEFAULT true;

-- Allow public access to view emergency contacts (for the hospital finder)
DROP POLICY IF EXISTS "Users can view own contacts" ON public.emergency_contacts;
CREATE POLICY "Anyone can view emergency contacts" ON public.emergency_contacts FOR SELECT USING (true);

-- Insert hospital data
INSERT INTO public.emergency_contacts (name, phone, relation, type, state, available_24h)
VALUES 
('National Emergency Number', '112', 'System', 'helpline', 'national', true),
('Ambulance Service', '102', 'System', 'ambulance', 'national', true),
('Emergency Medical Response (EMRI)', '108', 'System', 'ambulance', 'national', true),
('Medical Helpline', '1911', 'System', 'helpline', 'national', true),
('Health Helpline (Swasth Bharat)', '104', 'System', 'helpline', 'national', false),
('Mental Health Helpline (iCall)', '9152987821', 'System', 'helpline', 'national', false),
('Poison Control Centre (AIIMS Delhi)', '011-26589391', 'System', 'helpline', 'national', true),
('Blood Bank Helpline', '1910', 'System', 'blood_bank', 'national', false),
('Disaster Management', '1078', 'System', 'helpline', 'national', true),
('Railway Emergency', '1072', 'System', 'helpline', 'national', true);


-- 2. Fix diseases table
ALTER TABLE public.diseases RENAME COLUMN disease_name TO name;
ALTER TABLE public.diseases ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE public.diseases ADD COLUMN IF NOT EXISTS symptoms TEXT[] DEFAULT '{}';
ALTER TABLE public.diseases ADD COLUMN IF NOT EXISTS severity TEXT;
ALTER TABLE public.diseases ADD COLUMN IF NOT EXISTS severity_score NUMERIC;
ALTER TABLE public.diseases ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE public.diseases RENAME COLUMN diet TO diet_recommendations;
ALTER TABLE public.diseases RENAME COLUMN workout TO workout_recommendations;
ALTER TABLE public.diseases RENAME COLUMN specialist TO specialist_type;

-- 3. Seed Disease Library
${fixedSeedSql}
`;

fs.writeFileSync('backend/scripts/final_seed.sql', finalSql);
console.log('Generated final_seed.sql');
