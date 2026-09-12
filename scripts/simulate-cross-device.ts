import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');

let supabaseUrl = '';
let supabaseKey = '';
let serviceRoleKey = '';

envContent.split('\n').forEach(line => {
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
    supabaseUrl = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    supabaseKey = line.split('=')[1].trim();
  }
  if (line.startsWith('NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=') && !supabaseKey) {
    supabaseKey = line.split('=')[1].trim();
  }
  if (line.startsWith('SUPABASE_SERVICE_ROLE_KEY=')) {
    serviceRoleKey = line.split('=')[1].trim();
  }
});

if (!supabaseUrl || !supabaseKey || !serviceRoleKey) {
  console.error('Missing Supabase environment variables in .env.local');
  process.exit(1);
}

// Admin client to bypass rate limits
const adminClient = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const deviceA = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

const deviceB = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function runTest() {
  console.log('=== STARTING CROSS-DEVICE SIMULATION E2E ===\n');

  const testEmail = `test_player_${Date.now()}@test.com`;
  const testPassword = 'TestPassword123!';

  console.log(`[Setup] Creating test user via Admin API: ${testEmail}`);
  
  const { data: adminUser, error: adminErr } = await adminClient.auth.admin.createUser({
    email: testEmail,
    password: testPassword,
    email_confirm: true
  });

  if (adminErr) {
    console.error('[Setup] Error creating user via Admin:', adminErr);
    return;
  }
  console.log(`[Setup] User created successfully. UID: ${adminUser.user.id}`);

  console.log(`\n=== SWITCHING TO DEVICE A ===`);
  const { data: signInA, error: signInErrA } = await deviceA.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInErrA) {
    console.error('[Device A] Error logging in:', signInErrA);
    return;
  }
  console.log(`[Device A] Logged in successfully.`);

  // 2. Fetch initial profile on Device A
  console.log(`\n[Device A] Fetching profile...`);
  const { data: profileA, error: profileErrA } = await deviceA
    .from('profiles')
    .select('*')
    .eq('id', adminUser.user.id)
    .single();
    
  if (profileErrA) {
    console.error('[Device A] Error fetching profile:', profileErrA);
    return;
  }
  console.log(`[Device A] Profile found. Role: ${profileA.role}, XP: ${profileA.xp_current}, Gold: ${profileA.gold_balance}`);

  // 3. Create a quest on Device A
  console.log(`\n[Device A] Creating a new quest...`);
  const questTitle = `Cross-Device Test Quest - ${Date.now()}`;
  const { data: newQuestA, error: newQuestErrA } = await deviceA
    .from('quests')
    .insert({
      profile_id: adminUser.user.id,
      title: questTitle,
      description: 'Verifying this syncs to Device B',
      category: 'Work',
      difficulty: 'Normal',
      attribute: 'Intellect',
      frequency: 'Once',
      xp_reward: 100,
      gold_reward: 25,
      status: 'active'
    })
    .select()
    .single();

  if (newQuestErrA) {
    console.error('[Device A] Error creating quest:', newQuestErrA);
    return;
  }
  console.log(`[Device A] Created Quest: "${newQuestA.title}" (ID: ${newQuestA.id})`);

  // 4. Update profile (e.g., gain XP) on Device A
  console.log(`\n[Device A] Updating Profile (Adding 500 XP)...`);
  const newXp = (profileA.xp_current || 0) + 500;
  const { data: updatedProfileA, error: updateErrA } = await deviceA
    .from('profiles')
    .update({ xp_current: newXp })
    .eq('id', adminUser.user.id)
    .select()
    .single();
    
  if (updateErrA) {
    console.error('[Device A] Error updating profile:', updateErrA);
    return;
  }
  console.log(`[Device A] Profile updated. New XP: ${updatedProfileA.xp_current}`);


  // 5. Login on Device B
  console.log(`\n=== SWITCHING TO DEVICE B ===`);
  console.log(`[Device B] Logging in with same credentials...`);
  const { data: signInData, error: signInErr } = await deviceB.auth.signInWithPassword({
    email: testEmail,
    password: testPassword,
  });

  if (signInErr) {
    console.error('[Device B] Error logging in:', signInErr);
    return;
  }
  console.log(`[Device B] Logged in successfully. Session established.`);

  // 6. Verify profile sync on Device B
  console.log(`\n[Device B] Fetching profile...`);
  const { data: profileB, error: profileErrB } = await deviceB
    .from('profiles')
    .select('*')
    .eq('id', adminUser.user.id)
    .single();

  if (profileErrB) {
    console.error('[Device B] Error fetching profile:', profileErrB);
    return;
  }

  const xpMatches = profileB.xp_current === newXp;
  console.log(`[Device B] Profile XP: ${profileB.xp_current}. Matches Device A? ${xpMatches ? 'YES' : 'NO'}`);

  // 7. Verify quest sync on Device B
  console.log(`\n[Device B] Fetching quests...`);
  const { data: questsB, error: questsErrB } = await deviceB
    .from('quests')
    .select('*')
    .eq('profile_id', adminUser.user.id)
    .eq('id', newQuestA.id);

  if (questsErrB) {
    console.error('[Device B] Error fetching quests:', questsErrB);
    return;
  }
  
  const questFound = questsB && questsB.length > 0;
  console.log(`[Device B] Quest "${questTitle}" found? ${questFound ? 'YES' : 'NO'}`);

  if (xpMatches && questFound) {
    console.log(`\n=== CROSS-DEVICE SYNC E2E TEST PASSED ===`);
    console.log(`Conclusion: Supabase is acting as the single authoritative source of truth. Changes made on one device are fully persisted and immediately available to other devices authenticating as the same user.`);
  } else {
    console.log(`\n=== CROSS-DEVICE SYNC E2E TEST FAILED ===`);
  }
  
  // Cleanup
  console.log('\n[Cleanup] Deleting test user...');
  await adminClient.auth.admin.deleteUser(adminUser.user.id);
  console.log('[Cleanup] Test user deleted.');
}

runTest();
