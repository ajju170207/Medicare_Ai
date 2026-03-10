// Usage: node backend/scripts/seed_to_supabase.js
// Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in environment (or backend/.env)

const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', 'backend', '.env') });

const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(2);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function run() {
  const jsonPath = path.resolve(__dirname, '..', '..', 'scripts', 'disease_library.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('File not found:', jsonPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Read ${data.length} disease records`);

  // Upsert in batches
  const batchSize = 50;
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    // Prepare records to upsert (remove id)
    try {
      const { error } = await supabase.from('disease_library').upsert(batch, { onConflict: ['slug'] });
      if (error) {
        console.error('Upsert error:', error);
        process.exit(3);
      }
      console.log(`Upserted batch ${i / batchSize + 1} (${batch.length} records)`);
    } catch (err) {
      console.error('Error during upsert:', err);
      process.exit(4);
    }
  }

  console.log('Seeding complete');
}

run();
