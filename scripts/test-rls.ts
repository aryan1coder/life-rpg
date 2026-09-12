import { createClient } from '@supabase/supabase-js';

const url = 'https://pemnnjkkifqygsarjols.supabase.co';
const key = 'sb_publishable_sE0vIiAnhXimlMISnYbe1w_mWQ4d5V3'; // anon key
const supabase = createClient(url, key);

async function run() {
  const email = `test_${Date.now()}@test.com`;
  const password = 'password123';
  const { data: authData, error: authError } = await supabase.auth.signUp({ email, password });
  if (authError) { console.error('Auth Error:', authError); return; }
  
  console.log('Signed up:', authData.user?.id);
  
  await new Promise(r => setTimeout(r, 1000));
  
  const { data: profile, error: readError } = await supabase.from('profiles').select('role').eq('id', authData.user?.id).single();
  console.log('Profile:', profile, 'Error:', readError);
}
run();
