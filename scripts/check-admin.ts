import { createClient } from '@supabase/supabase-js';

const url = 'https://pemnnjkkifqygsarjols.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBlbW5uamtraWZxeWdzYXJqb2xzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTE5MzM2MywiZXhwIjoyMTA0NzY5MzYzfQ.8oXpcszG0RmSlOXD_nv6V4bsuVwmxiLsIwsHvBhZat4';
const supabase = createClient(url, key);

async function run() {
  const { data, error } = await supabase.from('profiles').select('id, username, role');
  console.log('Profiles:', data);
  if (error) console.error(error);
}
run();
