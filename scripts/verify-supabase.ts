import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// 1. Parse .env.local without exposing secrets
const envPath = path.join(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  content.split('\n').forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (match) {
      const key = match[1].trim();
      const val = match[2].trim().replace(/^["']|["']$/g, '');
      process.env[key] = val;
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)?.trim();
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

console.log('--- SUPABASE ENVIRONMENT AUDIT ---');
console.log(`SUPABASE URL: ${supabaseUrl && !supabaseUrl.includes('placeholder') ? 'configured' : 'missing'}`);
console.log(`SUPABASE ANON KEY: ${supabaseAnonKey && !supabaseAnonKey.includes('placeholder') ? 'configured' : 'missing'}`);
console.log(`SUPABASE SERVICE ROLE KEY: ${supabaseServiceKey && !supabaseServiceKey.includes('placeholder') ? 'configured' : 'missing'}`);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('\nCannot continue verification: Supabase URL or Anon Key missing.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const adminClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey) : null;

async function runVerification() {
  console.log('\n--- 1. DATABASE TABLES VERIFICATION ---');
  const tables = ['profiles', 'character_attributes', 'quests', 'reward_items', 'achievements', 'campaigns', 'boss_raids'];
  let allTablesExist = true;

  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.log(`  Table '${table}': ERROR (code: ${error.code}, message: ${error.message})`);
        allTablesExist = false;
      } else {
        console.log(`  Table '${table}': OK (accessible)`);
      }
    } catch (e: any) {
      console.log(`  Table '${table}': EXCEPTION (${e.message})`);
      allTablesExist = false;
    }
  }

  console.log(`Database tables check: ${allTablesExist ? 'PASSED (All expected migrations applied)' : 'NEEDS ATTENTION'}`);

  console.log('\n--- 2. SUPABASE AUTH VERIFICATION ---');
  const testEmail = `test_verification_${Date.now()}@example.com`;
  const testPassword = `P@ssw0rd_${Math.random().toString(36).substring(2, 10)}!`;
  const testUsername = `VerifyOp_${Date.now().toString().slice(-4)}`;

  console.log('Testing supabase.auth.signUp()...');
  let createdUserId: string | null = null;
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { username: testUsername },
    },
  });

  if (signUpError) {
    console.log(`  signUp status: FAILED`);
    console.log(`  Error code: ${signUpError.status || (signUpError as any).code || 'unknown'}`);
    console.log(`  Message: ${signUpError.message}`);
    
    if ((signUpError.status === 429 || signUpError.message?.includes('rate limit')) && adminClient) {
      console.log('\n  [Rate limit detected] Testing via admin.createUser (email_confirm: true)...');
      const { data: adminUserData, error: adminUserError } = await adminClient.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: { username: testUsername }
      });
      if (adminUserError) {
        console.log(`  admin.createUser failed: ${adminUserError.message}`);
      } else {
        createdUserId = adminUserData.user?.id || null;
        console.log(`  admin.createUser status: SUCCESS`);
      }
    }
  } else {
    createdUserId = signUpData.user?.id || null;
    console.log(`  signUp status: SUCCESS`);
    console.log(`  Session established: ${Boolean(signUpData.session)}`);
  }

  if (createdUserId) {
    // Check auto-provisioning trigger
    const { data: profileData, error: profileErr } = await (adminClient || supabase)
      .from('profiles')
      .select('*')
      .eq('id', createdUserId)
      .single();

    if (profileErr) {
      console.log(`  Trigger auto-provisioning: PENDING / ERROR (${profileErr.message})`);
    } else if (profileData) {
      console.log(`  Trigger auto-provisioning: VERIFIED (Level: ${profileData.level}, XP: ${profileData.xp_current}, Gold: ${profileData.gold_balance})`);
    }
  }

  console.log('\nTesting supabase.auth.signInWithPassword()...');
  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInError) {
    console.log(`  signIn status: FAILED`);
    console.log(`  Error code: ${signInError.status || signInError.code || 'unknown'}`);
    console.log(`  Message: ${signInError.message}`);
  } else {
    console.log(`  signIn status: SUCCESS`);
    console.log(`  Session token acquired: ${Boolean(signInData.session?.access_token)}`);

    // Test getUser()
    const { data: userData, error: userError } = await supabase.auth.getUser(signInData.session.access_token);
    if (userError) {
      console.log(`  getUser status: FAILED (${userError.message})`);
    } else {
      console.log(`  getUser status: SUCCESS (User ID matches: ${userData.user?.id === createdUserId})`);
    }
  }

  // Cleanup test user if adminClient is available
  if (adminClient && createdUserId) {
    try {
      await adminClient.auth.admin.deleteUser(createdUserId);
      console.log('\nCleaned up verification test user.');
    } catch {
      // ignore
    }
  }

  console.log('\n--- VERIFICATION COMPLETED ---');
}

runVerification();
