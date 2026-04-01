
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkEvents() {
  const { data, error } = await supabase
    .from('opportunities')
    .select('id, title, category, status')
    .eq('category', 'event');

  if (error) {
    console.error('Error fetching events:', error);
    return;
  }

  console.log('Events in database:', data);
  console.log('Total events:', data.length);
}

checkEvents();
