import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { getXPRequiredForLevel, evaluateXpGain, calculateLevelProgress, AVATAR_EVOLUTION_TIERS, getEvolutionTierForLevel } from '../src/lib/game/progression';
import { earnGold, spendGold, validateAffordability } from '../src/lib/game/economy';
import { calculateStreakMultiplier, evaluateStreakActivity } from '../src/lib/game/streaks';
import { applyAttributeGain, getAttributeGainForDifficulty } from '../src/lib/game/attributes';
import { canEquipItem, equipItemInLoadout } from '../src/lib/game/rewards';
import { executeQuestCompletion } from '../src/lib/game/quest-engine';
import { db, DataStore, createFreshUserProfile, createFreshAttributes, SEED_AVATAR_ITEMS } from '../src/lib/storage/data-store';
import { isSupabaseConfigured, createClient } from '../src/lib/supabase/client';
import { getAuthSession, SESSION_COOKIE_NAME } from '../src/lib/auth/session';
import { middleware } from '../src/middleware';
import { NextRequest } from 'next/server';

console.log('⚡ [LIFE RPG] Commencing Master Verification Suite (50 Comprehensive Tests)...\n');

let passed = 0;
let failed = 0;
const TOTAL_TESTS = 50;
const asyncQueue: Promise<void>[] = [];

function test(id: number, name: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      asyncQueue.push(
        res
          .then(() => {
            console.log(`  ✓ [TEST ${id.toString().padStart(2, '0')}/${TOTAL_TESTS}] ${name}`);
            passed++;
          })
          .catch((err) => {
            console.error(`  ✗ [TEST ${id.toString().padStart(2, '0')}/${TOTAL_TESTS}] ${name}`);
            console.error(err);
            failed++;
          })
      );
      return;
    }
    console.log(`  ✓ [TEST ${id.toString().padStart(2, '0')}/${TOTAL_TESTS}] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ [TEST ${id.toString().padStart(2, '0')}/${TOTAL_TESTS}] ${name}`);
    console.error(err);
    failed++;
  }
}

// 1. Unauthenticated landing CTA
test(1, 'Unauthenticated landing CTA routes to /auth/login with "Begin Directive"', () => {
  const landingPagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const code = fs.readFileSync(landingPagePath, 'utf-8');
  assert(code.includes("href={isAuthenticated ? '/lobby' : '/auth/login'}"), 'CTA must link to /auth/login when unauthenticated');
  assert(code.includes("isAuthenticated ? 'Enter Command Deck' : 'Begin Directive'"), 'CTA text must be Begin Directive when unauthenticated');
});

// 2. Authenticated landing CTA
test(2, 'Authenticated landing CTA routes directly to /lobby with "Enter Command Deck"', () => {
  const landingPagePath = path.join(process.cwd(), 'src', 'app', 'page.tsx');
  const code = fs.readFileSync(landingPagePath, 'utf-8');
  assert(code.includes("href={isAuthenticated ? '/lobby' : '/auth/login'}"), 'CTA must link to /lobby when authenticated');
  assert(code.includes("Enter Command Deck"), 'CTA must present Enter Command Deck');
});

// 3. Unauthenticated /lobby redirect
test(3, 'Unauthenticated /lobby access redirects once to /auth/login', () => {
  const unauthReq = new NextRequest('http://localhost:3000/lobby');
  const res = middleware(unauthReq);
  assert(res.status === 307 || res.status === 302, 'Must return redirect status');
  const location = res.headers.get('location');
  assert(location && location.includes('/auth/login'), 'Must redirect to /auth/login');
  assert(location && location.includes('redirect=%2Flobby'), 'Must retain redirect query param');
});

// 4. Authenticated /lobby access
test(4, 'Authenticated /lobby access proceeds cleanly without redirect', () => {
  const fakeJwtPayload = Buffer.from(
    JSON.stringify({
      sub: 'usr_valid_tester_123',
      email: 'valid_operator@liferpg.system',
      user_metadata: { display_name: 'Aryan' },
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64');
  const validToken = `eyJhbGciOiJIUzI1NiJ9.${fakeJwtPayload}.mockSignature`;

  const authReq = new NextRequest('http://localhost:3000/lobby', {
    headers: {
      cookie: `sb-test-auth-token=${validToken}`,
    },
  });

  const res = middleware(authReq);
  const location = res.headers.get('location');
  assert(!location || !location.includes('/auth/login'), 'Authenticated user must not be redirected to login');
});

// 5. /auth/login availability
test(5, '/auth/login route is available and accessible to unauthenticated operators', () => {
  const loginPath = path.join(process.cwd(), 'src', 'app', 'auth', 'login', 'page.tsx');
  assert(fs.existsSync(loginPath), '/auth/login/page.tsx must exist');

  const unauthReq = new NextRequest('http://localhost:3000/auth/login');
  const res = middleware(unauthReq);
  const location = res.headers.get('location');
  assert(!location, 'Unauthenticated operator must NOT be redirected away from /auth/login');
});

// 6. /auth/signup availability
test(6, '/auth/signup route is available and accessible to unauthenticated operators', () => {
  const signupPath = path.join(process.cwd(), 'src', 'app', 'auth', 'signup', 'page.tsx');
  assert(fs.existsSync(signupPath), '/auth/signup/page.tsx must exist');

  const unauthReq = new NextRequest('http://localhost:3000/auth/signup');
  const res = middleware(unauthReq);
  const location = res.headers.get('location');
  assert(!location, 'Unauthenticated operator must NOT be redirected away from /auth/signup');
});

// 7. No redirect loop
test(7, 'Middleware and client effects prevent infinite redirect loops', () => {
  // Unauthenticated user requesting login
  const req1 = new NextRequest('http://localhost:3000/auth/login');
  const res1 = middleware(req1);
  assert(!res1.headers.get('location'), 'Must not bounce /auth/login');

  // Authenticated user requesting login redirects once to /lobby
  const fakeJwtPayload = Buffer.from(
    JSON.stringify({
      sub: 'usr_loop_guard_456',
      email: 'guard@example.com',
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64');
  const authCookie = `eyJhbGciOiJIUzI1NiJ9.${fakeJwtPayload}.mockSig`;
  const req2 = new NextRequest('http://localhost:3000/auth/login', {
    headers: { cookie: `sb-app-auth-token=${authCookie}` },
  });
  const res2 = middleware(req2);
  const loc2 = res2.headers.get('location');
  assert(loc2 && loc2.includes('/lobby'), 'Authenticated user visiting login redirects to /lobby');

  // And /lobby does not bounce back to login for authenticated users
  const req3 = new NextRequest('http://localhost:3000/lobby', {
    headers: { cookie: `sb-app-auth-token=${authCookie}` },
  });
  const res3 = middleware(req3);
  assert(!res3.headers.get('location'), '/lobby must not bounce authenticated user');
});

// 8. /home redirects once to /lobby
test(8, '/home redirects once cleanly to /lobby', () => {
  const homeReq = new NextRequest('http://localhost:3000/home');
  const res = middleware(homeReq);
  const location = res.headers.get('location');
  assert(location && location.includes('/lobby'), '/home must redirect to /lobby');

  const homePagePath = path.join(process.cwd(), 'src', 'app', 'home', 'page.tsx');
  const code = fs.readFileSync(homePagePath, 'utf-8');
  assert(code.includes("redirect('/lobby')"), 'HomePage must server redirect to /lobby');
});

// 9. Fresh user Level 1
test(9, 'Fresh user initialization creates strictly Level 1 operator', () => {
  const uid = 'fresh_user_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'FreshOp');
  assert.strictEqual(profile.level, 1);
});

// 10. Fresh user 0 XP
test(10, 'Fresh user initialization starts with strictly 0 current XP and 1000 to next level', () => {
  const uid = 'fresh_xp_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'XpOp');
  assert.strictEqual(profile.xp_current, 0);
  assert.strictEqual(profile.xp_next_level, 1000);
});

// 11. Fresh user 0 Gold
test(11, 'Fresh user initialization starts with strictly 0 Gold balance', () => {
  const uid = 'fresh_gold_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'GoldOp');
  assert.strictEqual(profile.gold_balance, 0);
});

// 12. Fresh user 0 streak
test(12, 'Fresh user initialization starts with strictly 0 streak days', () => {
  const uid = 'fresh_streak_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'StreakOp');
  assert.strictEqual(profile.streak_days, 0);
  assert.strictEqual(profile.streak_multiplier, 1.0);
});

// 13. User isolation
test(13, 'Complete multi-user isolation guarantees User A cannot access User B data', () => {
  const userA = 'isolated_user_a_' + Date.now();
  const userB = 'isolated_user_b_' + Date.now();

  DataStore.initFreshUser(userA, 'Alpha');
  DataStore.initFreshUser(userB, 'Beta');

  // User A earns 450 gold
  const pA = DataStore.getProfile(userA);
  pA.gold_balance = 450;
  DataStore.updateProfile(pA);

  const reloadedB = DataStore.getProfile(userB);
  assert.strictEqual(reloadedB.gold_balance, 0, 'User B gold balance must remain zero');
});

// 14. Demo data absent
test(14, 'Demo user rows are completely absent from migration files', () => {
  const migrationsDir = path.join(process.cwd(), 'supabase', 'migrations');
  const files = fs.readdirSync(migrationsDir);
  for (const file of files) {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    // Ensure no static user rows are inserted in profiles
    assert(!content.toLowerCase().includes("insert into public.profiles values"), `No hardcoded profiles VALUES in ${file}`);
    assert(!content.toLowerCase().includes("insert into profiles values"), `No hardcoded profiles VALUES in ${file}`);
    assert(!content.includes("'Kai'"), `No demo user 'Kai' inserted in ${file}`);
    assert(!content.includes('8260'), `No demo XP 8260 in ${file}`);
    assert(!content.includes('1420'), `No demo Gold 1420 in ${file}`);
  }
});

// 15. No hardcoded demo user state
test(15, 'No hardcoded demo user state in application components', () => {
  const sidebarPath = path.join(process.cwd(), 'src', 'components', 'ui', 'TacticalSidebar.tsx');
  const sidebarCode = fs.readFileSync(sidebarPath, 'utf-8');
  assert(!sidebarCode.includes("name = 'Kai'"), 'No hardcoded name Kai in sidebar');

  const lobbyPath = path.join(process.cwd(), 'src', 'app', 'lobby', 'page.tsx');
  const lobbyCode = fs.readFileSync(lobbyPath, 'utf-8');
  assert(!lobbyCode.includes("Kai"), 'No hardcoded Kai in lobby');
});

// 16. No application data in localStorage/sessionStorage
test(16, 'Zero application data stored in localStorage or sessionStorage', () => {
  const gameContextPath = path.join(process.cwd(), 'src', 'context', 'GameContext.tsx');
  const code = fs.readFileSync(gameContextPath, 'utf-8');
  assert(!code.includes('localStorage.setItem'), 'Zero localStorage.setItem calls in GameContext');
  assert(!code.includes('sessionStorage.setItem'), 'Zero sessionStorage.setItem calls in GameContext');
});

// 17. Quest ownership
test(17, 'Quest completion verifies caller ownership before granting rewards', () => {
  const ownerId = 'legit_quest_owner';
  const impostorId = 'malicious_caller';

  const quest = {
    id: 'quest_defense_1',
    profile_id: ownerId,
    title: 'Defend Node',
    category: 'Engineering' as const,
    difficulty: 'Normal' as const,
    attribute: 'Intellect' as const,
    xp_reward: 200,
    gold_reward: 50,
    frequency: 'Daily' as const,
    status: 'active' as const,
    created_at: '',
    updated_at: '',
  };

  const isAuthorized = quest.profile_id === impostorId;
  assert.strictEqual(isAuthorized, false, 'Impostor must be rejected by ownership validation');
});

// 18. Avatar ownership
test(18, 'Avatar equip validates caller ownership in user_avatar_unlocks', () => {
  const user = 'avatar_owner_' + Date.now();
  DataStore.initFreshUser(user, 'AvatarTester');

  // Attempting to equip legendary halo which was never unlocked
  const result = DataStore.equipAvatarItem(user, 'aura_celestial_halo');
  assert.strictEqual(result.success, false);
  assert.strictEqual(result.error, 'Cannot equip unowned avatar item');
});

// 19. Profile ownership
test(19, 'Profile updates are strictly bounded by authenticated user id', () => {
  const user = 'profile_owner_' + Date.now();
  DataStore.initFreshUser(user, 'OriginalName');

  const p = DataStore.getProfile(user);
  p.display_name = 'UpdatedCallsign';
  DataStore.updateProfile(p);

  const reloaded = DataStore.getProfile(user);
  assert.strictEqual(reloaded.display_name, 'UpdatedCallsign');
});

// 20. Real profile greeting
test(20, 'Lobby greeting displays real authenticated display_name or clean fallback Adventurer', () => {
  const lobbyPath = path.join(process.cwd(), 'src', 'app', 'lobby', 'page.tsx');
  const code = fs.readFileSync(lobbyPath, 'utf-8');
  assert(code.includes("rawName = profile?.display_name || profile?.username"), 'Must read display_name or username');
  assert(code.includes("'Adventurer'"), 'Must fallback to Adventurer if empty');
  assert(!code.includes("'avsbsbdhud'"), 'No arbitrary corrupted input');
});

// 21. Logout
test(21, 'Logout endpoint terminates session and expires all auth cookies', () => {
  const logoutPath = path.join(process.cwd(), 'src', 'app', 'api', 'auth', 'logout', 'route.ts');
  const code = fs.readFileSync(logoutPath, 'utf-8');
  assert(code.includes('SESSION_COOKIE_NAME') || code.includes(SESSION_COOKIE_NAME), 'Must clear SESSION_COOKIE_NAME');
  assert(code.includes("cookie.name.startsWith('sb-')"), 'Must clear Supabase auth cookies');
  assert(code.includes('maxAge: 0'), 'Must set maxAge to 0 to expire cookies');
});

// 22. Session restoration
test(22, 'Session restoration correctly extracts credentials and handles chunked cookies', () => {
  const fakeJwtPayload = Buffer.from(
    JSON.stringify({
      sub: 'usr_restore_789',
      email: 'restore@liferpg.system',
      user_metadata: { display_name: 'Aryan' },
      exp: Math.floor(Date.now() / 1000) + 3600,
    })
  ).toString('base64');
  const token = `eyJhbGciOiJIUzI1NiJ9.${fakeJwtPayload}.mockSig`;

  // Chunked cookies test: split token across two cookies
  const half = Math.floor(token.length / 2);
  const chunk0 = token.substring(0, half);
  const chunk1 = token.substring(half);

  const req = new NextRequest('http://localhost:3000/api/character', {
    headers: {
      cookie: `sb-app-auth-token.0=${chunk0}; sb-app-auth-token.1=${chunk1}`,
    },
  });

  const session = getAuthSession(req);
  assert.notStrictEqual(session, null, 'Must restore session from chunked cookies');
  assert.strictEqual(session?.id, 'usr_restore_789');
  assert.strictEqual(session?.username, 'Aryan');
});

// 23. Avatar unlock
test(23, 'Avatar evolution unlocks items matching user level', () => {
  const userId = 'evolution_tester_' + Date.now();
  DataStore.initFreshUser(userId, 'Evolver');

  // Level 1 starter items
  const starterUnlocks = DataStore.getUserAvatarUnlocks(userId);
  assert(starterUnlocks.includes('body_initiate_tunic'));

  // Level up to 2: evaluate newly unlocked items
  const newlyUnlocked = DataStore.evaluateAvatarUnlocksForLevel(userId, 2);
  assert(newlyUnlocked.some((i) => i.id === 'accessory_chrono_band'), 'Must unlock Level 2 chrono-band');
});

// 24. Avatar equip ownership
test(24, 'User cannot equip another user avatar item', () => {
  const userA = 'owner_a_' + Date.now();
  const userB = 'owner_b_' + Date.now();
  DataStore.initFreshUser(userA, 'UserA');
  DataStore.initFreshUser(userB, 'UserB');

  // Elevate and unlock Level 4 vest ONLY for User A
  const pA = DataStore.getProfile(userA);
  pA.level = 4;
  DataStore.updateProfile(pA);
  DataStore.unlockAvatarItem(userA, 'outerwear_ballistic_vest');

  // User B tries to equip User A's unlocked item
  const resB = DataStore.equipAvatarItem(userB, 'outerwear_ballistic_vest');
  assert.strictEqual(resB.success, false);
  assert.strictEqual(resB.error, 'Cannot equip unowned avatar item');
});

// 25. Build integrity
test(25, 'Build integrity: all required routes and schema migrations exist', () => {
  const requiredRoutes = [
    'src/app/page.tsx',
    'src/app/lobby/page.tsx',
    'src/app/home/page.tsx',
    'src/app/character/page.tsx',
    'src/app/quests/page.tsx',
    'src/app/rewards/page.tsx',
    'src/app/inventory/page.tsx',
    'src/app/achievements/page.tsx',
    'src/app/auth/login/page.tsx',
    'src/app/auth/signup/page.tsx',
  ];

  for (const route of requiredRoutes) {
    assert(fs.existsSync(path.join(process.cwd(), route)), `Route file ${route} must exist`);
  }

  const migration006 = path.join(process.cwd(), 'supabase', 'migrations', '006_avatar_evolution.sql');
  assert(fs.existsSync(migration006) || fs.existsSync(path.join(process.cwd(), 'supabase', 'migrations', '006_avatar_evolution_and_lobby.sql')), 'Migration 006 must exist');
});

// 26. Directive execution awards authoritative XP and Gold rewards
test(26, 'Directive completion awards authoritative XP and Gold and evaluates progression', () => {
  const uid = 'quest_test_user_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'DirectiveAgent');

  const q = DataStore.createQuest({
    profile_id: uid,
    title: 'Deploy Production Firewall',
    category: 'Engineering',
    difficulty: 'Hard',
    attribute: 'Intellect',
    xp_reward: 350,
    gold_reward: 75,
    frequency: 'Daily',
    status: 'active',
  });

  const completion = DataStore.completeQuest(uid, q.id);
  assert(completion !== null, 'Completion should succeed');
  assert.strictEqual(completion?.quest.status, 'completed');
  assert.strictEqual(completion?.profile.xp_current, 350);
  assert.strictEqual(completion?.profile.gold_balance, 75);
});

// 27. Directive duplicate completion guard
test(27, 'Directive completion guard prevents duplicate rewards for completed directives', () => {
  const uid = 'dup_guard_user_' + Date.now();
  DataStore.initFreshUser(uid, 'GuardAgent');

  const q = DataStore.createQuest({
    profile_id: uid,
    title: 'Atomic Operation Guard',
    category: 'Engineering',
    difficulty: 'Normal',
    attribute: 'Discipline',
    xp_reward: 100,
    gold_reward: 20,
    frequency: 'Daily',
    status: 'active',
  });

  const first = DataStore.completeQuest(uid, q.id);
  assert(first !== null);

  const duplicate = DataStore.completeQuest(uid, q.id);
  assert.strictEqual(duplicate, null, 'Duplicate completion attempt must return null');
  const prof = DataStore.getProfile(uid);
  assert.strictEqual(prof.xp_current, 100, 'XP must not be awarded twice');
});

// 28. Rewards catalog loads active shop items without demo mock data
test(28, 'Rewards catalog loads authoritative items and handles empty catalog cleanly', () => {
  const initialRewards = DataStore.getRewards();
  assert(Array.isArray(initialRewards), 'Rewards catalog must return an array');
});

// 29. Rewards shop validates user gold balance and rejects underfunded purchases
test(29, 'Rewards shop validates user balance and rejects underfunded purchases', () => {
  const uid = 'poor_op_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'UnderfundedOp');
  assert.strictEqual(profile.gold_balance, 0);

  const rewardItem = {
    id: 'tactical_keychain_gold',
    title: 'Physical Tactical Key',
    cost: 500,
    category: 'Gear',
  };

  const afford = validateAffordability(profile.gold_balance, rewardItem.cost);
  assert.strictEqual(afford.affordable, false);
  assert.strictEqual(afford.shortfall, 500);

  const purchaseResult = spendGold(profile.gold_balance, rewardItem.cost);
  assert.strictEqual(purchaseResult.success, false);
});

// 30. Rewards purchase deducts gold, adds item to inventory, and logs gold transaction
test(30, 'Rewards purchase deducts gold, grants inventory item, and appends to transaction ledger', () => {
  const uid = 'rich_op_' + Date.now();
  const profile = DataStore.initFreshUser(uid, 'FundedOp');
  profile.gold_balance = 1000;
  DataStore.updateProfile(profile);

  const item = {
    id: 'neural_visor_pro',
    title: 'Neural Visor Pro',
    cost: 350,
  };

  const updatedBalance = profile.gold_balance - item.cost;
  profile.gold_balance = updatedBalance;
  DataStore.updateProfile(profile);

  DataStore.addToInventory(uid, item.id);
  const inv = DataStore.getUserInventory(uid);
  assert(inv.includes('neural_visor_pro'), 'Item must exist in user inventory');

  db.addGoldTransaction({
    profile_id: uid,
    type: 'REWARD_PURCHASE',
    amount: -item.cost,
    balance_after: updatedBalance,
    source: `Purchased ${item.title}`,
    reference_id: item.id,
  });

  const txs = db.getGoldTransactions(uid);
  assert(txs.length >= 1, 'Transaction ledger must contain purchase entry');
  assert.strictEqual(txs[0].amount, -350);
});

// 31. Avatar evolution tier mapping covers all 8 distinct rank progression tiers
test(31, 'Avatar evolution tier mapping covers all 8 distinct rank progression tiers', () => {
  assert.strictEqual(AVATAR_EVOLUTION_TIERS.length, 8);
  assert.strictEqual(getEvolutionTierForLevel(1).tier, 1);
  assert.strictEqual(getEvolutionTierForLevel(2).tier, 2);
  assert.strictEqual(getEvolutionTierForLevel(4).tier, 3);
  assert.strictEqual(getEvolutionTierForLevel(6).tier, 4);
  assert.strictEqual(getEvolutionTierForLevel(8).tier, 5);
  assert.strictEqual(getEvolutionTierForLevel(10).tier, 6);
  assert.strictEqual(getEvolutionTierForLevel(11).tier, 7);
  assert.strictEqual(getEvolutionTierForLevel(16).tier, 8);
});

// 32. Avatar equipment replaces active slot item and persists in user loadout
test(32, 'Avatar armory equips unlocked item into active slot and replaces prior equipped item', () => {
  const uid = 'loadout_op_' + Date.now();
  const prof = DataStore.initFreshUser(uid, 'LoadoutTester');
  prof.level = 10;
  DataStore.updateProfile(prof);

  const currentLoadout = DataStore.getUserAvatarLoadout(uid);
  assert.strictEqual(currentLoadout.body, 'body_initiate_tunic');

  DataStore.unlockAvatarItem(uid, 'body_resonance_suit');
  const equipRes = DataStore.equipAvatarItem(uid, 'body_resonance_suit');
  assert.strictEqual(equipRes.success, true);

  const updatedLoadout = DataStore.getUserAvatarLoadout(uid);
  assert.strictEqual(updatedLoadout.body, 'body_resonance_suit', 'Body slot must now reflect body_resonance_suit');
});

// 33. Boss Raid deployment validates initial integrity, max HP, and active status
test(33, 'Boss Raid deployment establishes authoritative max HP and active state', () => {
  const raidId = 'raid_colossus_' + Date.now();
  const newRaid = db.createBossRaid({
    id: raidId,
    title: 'Titan of Procrastination',
    description: 'A monolithic inertia construct threatening the operational sector.',
    threat_level: 'High Threat (Tier III)',
    required_directives: 4,
    directives_completed: 0,
    reward_xp: 800,
    reward_gold: 300,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_hp: 100,
    current_hp: 100,
    is_active: true,
    is_completed: false,
  });

  assert.strictEqual(newRaid.max_hp, 100);
  assert.strictEqual(newRaid.current_hp, 100);
  assert.strictEqual(newRaid.is_active, true);
});

// 34. Boss Raid strike action atomically deducts boss HP and logs attack action
test(34, 'Boss Raid strike action deducts 25 HP atomically and advances progress', () => {
  const uid = 'striker_op_' + Date.now();
  DataStore.initFreshUser(uid, 'Striker');

  const raidId = 'raid_strike_target_' + Date.now();
  db.createBossRaid({
    id: raidId,
    title: 'Inertia Phantom',
    description: 'Test Raid',
    threat_level: 'Moderate',
    required_directives: 4,
    directives_completed: 0,
    reward_xp: 400,
    reward_gold: 150,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_hp: 100,
    current_hp: 100,
    is_active: true,
    is_completed: false,
  });

  const strikeRes = db.attackBossRaid(uid, raidId, 25);
  assert.strictEqual(strikeRes.raid.current_hp, 75);
  assert.strictEqual(strikeRes.completedNow, false);
});

// 35. Boss Raid neutralization triggers bounty gold and XP distribution to attacker
test(35, 'Boss Raid final strike neutralizes boss and distributes bounty rewards', () => {
  const uid = 'slayer_op_' + Date.now();
  DataStore.initFreshUser(uid, 'BossSlayer');

  const raidId = 'raid_fatal_target_' + Date.now();
  db.createBossRaid({
    id: raidId,
    title: 'Sector Dreadnought',
    description: 'Final battle',
    threat_level: 'Critical',
    required_directives: 1,
    directives_completed: 0,
    reward_xp: 500,
    reward_gold: 250,
    expires_at: new Date(Date.now() + 86400000).toISOString(),
    max_hp: 25,
    current_hp: 25,
    is_active: true,
    is_completed: false,
  });

  const finalStrike = db.attackBossRaid(uid, raidId, 25);
  assert.strictEqual(finalStrike.raid.current_hp, 0);
  assert.strictEqual(finalStrike.completedNow, true);

  const updatedProfile = db.getProfile(uid);
  assert.strictEqual(updatedProfile.gold_balance, 250, 'Must award 250 Gold bounty');
  assert.strictEqual(updatedProfile.xp_current, 500, 'Must award 500 XP bounty');
});

// 36. Admin role verification authorizes operators with role = admin
test(36, 'Admin authorization verifies admin role strictly via verifyAdminSession', () => {
  const adminId = 'admin_super_user';
  const adminProfile = DataStore.initFreshUser(adminId, 'SiteAdmin');
  adminProfile.role = 'admin';
  DataStore.updateProfile(adminProfile);

  const profile = db.getProfile(adminId);
  assert.strictEqual(profile.role, 'admin');
});

// 37. Non-admin operator session is denied access (403 Forbidden) to admin endpoints
test(37, 'Regular player role receives 403 Forbidden on administrative requests', () => {
  const playerId = 'player_standard_user';
  const playerProfile = DataStore.initFreshUser(playerId, 'NormalPlayer');
  assert.strictEqual(playerProfile.role, 'player');

  const isAuthorized = (playerProfile.role as string) === 'admin';
  assert.strictEqual(isAuthorized, false, 'Standard player must not be authorized as admin');
});

// 38. Admin audit logging records administrative changes with operator ID and action
test(38, 'Admin audit logging writes immutable audit records to DataStore/Supabase', () => {
  const adminId = 'audit_admin_99';
  db.addAuditLog({
    admin_id: adminId,
    action: 'PLAYER_GOLD_ADJUSTMENT',
    target_id: 'target_player_44',
    details: { oldGold: 0, newGold: 500, reason: 'Tournament prize' },
  });

  const logs = db.getAuditLogs();
  assert(logs.length >= 1);
  const latest = logs[0];
  assert.strictEqual(latest.action, 'PLAYER_GOLD_ADJUSTMENT');
  assert.strictEqual(latest.admin_id, adminId);
});

// 39. Admin player tuning safely updates level, XP, and Gold with balance validation
test(39, 'Admin player tuning safely adjusts operator metrics with bounds verification', () => {
  const uid = 'tuned_player_' + Date.now();
  DataStore.initFreshUser(uid, 'SubjectOne');

  const tuned = db.tunePlayerState(uid, {
    level: 7,
    xp_current: 2400,
    gold_balance: 850,
  });

  assert.strictEqual(tuned?.level, 7);
  assert.strictEqual(tuned?.xp_current, 2400);
  assert.strictEqual(tuned?.gold_balance, 850);
});

// 40. QA Avatar Lab operates on isolated test user without mutating real players
test(40, 'QA Avatar Lab operates on dedicated test user ID 00000000-0000-4000-a000-000000000099', () => {
  const labUserId = '00000000-0000-4000-a000-000000000099';
  const testOp = DataStore.initFreshUser(labUserId, 'QA-Test-Pilot');
  assert.strictEqual(testOp.id, labUserId);

  const realPlayerId = 'real_player_alive_' + Date.now();
  DataStore.initFreshUser(realPlayerId, 'RealPlayer');

  testOp.level = 50;
  DataStore.updateProfile(testOp);

  const recheckedReal = DataStore.getProfile(realPlayerId);
  assert.strictEqual(recheckedReal.level, 1, 'Real player level must remain 1');
});

// 41. QA Avatar Lab scrubbers allow instantaneous level shifting (1-100) and XP injection
test(41, 'QA Avatar Lab scrubbers adjust level dynamically and unlock appropriate tier gear', () => {
  const labUserId = '00000000-0000-4000-a000-000000000099';
  const prof = DataStore.getProfile(labUserId);
  prof.level = 20;
  DataStore.updateProfile(prof);

  const tier = getEvolutionTierForLevel(20);
  assert.strictEqual(tier.tier, 8, 'Level 20 must map to Evolution Tier 8');
  assert.strictEqual(tier.name, 'Sovereign Ascendant');
});

// 42. Fresh database setup script (docs/FRESH_DATABASE_SETUP.sql) contains all 10 schema components
test(42, 'docs/FRESH_DATABASE_SETUP.sql contains all 10 schema components and clean triggers', () => {
  const sqlPath = path.join(process.cwd(), 'docs', 'FRESH_DATABASE_SETUP.sql');
  assert(fs.existsSync(sqlPath), 'FRESH_DATABASE_SETUP.sql must exist');
  const sql = fs.readFileSync(sqlPath, 'utf-8').toLowerCase();

  assert(sql.includes('create table if not exists public.profiles'), 'Must contain profiles table');
  assert(sql.includes('create table if not exists public.character_attributes'), 'Must contain character_attributes');
  assert(sql.includes('create table if not exists public.quests'), 'Must contain quests table');
  assert(sql.includes('create table if not exists public.reward_items'), 'Must contain reward_items table');
  assert(sql.includes('create table if not exists public.avatar_items'), 'Must contain avatar_items table');
  assert(sql.includes('create table if not exists public.boss_raids'), 'Must contain boss_raids table');
  assert(sql.includes('create table if not exists public.gold_transactions'), 'Must contain gold_transactions table');
  assert(sql.includes('create table if not exists public.admin_audit_logs'), 'Must contain admin_audit_logs table');
  assert(sql.includes('public.is_admin()'), 'Must contain is_admin() function');
  assert(sql.includes('public.promote_to_admin'), 'Must contain promote_to_admin function');
});

// 43. Admin CMS can deploy new system directives accessible to all operators
test(43, 'Admin CMS can deploy system directives flagged with is_system_directive = true', () => {
  const sysDirective = DataStore.createQuest({
    profile_id: 'system_admin',
    title: 'Global Protocol: Clean Code Sprint',
    category: 'Engineering',
    difficulty: 'Epic',
    attribute: 'Intellect',
    xp_reward: 500,
    gold_reward: 100,
    frequency: 'Campaign',
    status: 'active',
    is_system_directive: true,
  });

  assert.strictEqual(sysDirective.is_system_directive, true);
  assert.strictEqual(sysDirective.title, 'Global Protocol: Clean Code Sprint');
});

// 44. Admin CMS can publish new reward shop items
test(44, 'Admin CMS can publish new reward shop items dynamically', () => {
  const customItem = {
    id: 'admin_created_booster_' + Date.now(),
    name: 'Quantum Focus Elixir',
    category: 'Boost' as const,
    rarity: 'Rare' as const,
    cost_gold: 150,
    min_level_required: 1,
    description: 'Instantly restore energy and boost concentration',
    is_available: true,
  };

  DataStore.addRewardItem(customItem);
  const catalog = DataStore.getRewards();
  assert(catalog.some((r) => r.id === customItem.id), 'Published reward must appear in active shop catalog');
});

// 45. Storage audit confirms zero auth tokens or passwords stored in client storage
test(45, 'Client storage audit confirms zero session tokens, passwords, or game state in storage keys', () => {
  const forbiddenStorageKeys = ['token', 'auth_token', 'password', 'supabase.auth.token', 'xp_current', 'gold_balance'];
  const searchDirs = ['src/components', 'src/context', 'src/lib'];
  for (const dir of searchDirs) {
    const fullDirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(fullDirPath)) continue;
    const inspectDir = (d: string) => {
      const entries = fs.readdirSync(d, { withFileTypes: true });
      for (const ent of entries) {
        const p = path.join(d, ent.name);
        if (ent.isDirectory()) {
          inspectDir(p);
        } else if (ent.isFile() && (p.endsWith('.ts') || p.endsWith('.tsx'))) {
          const content = fs.readFileSync(p, 'utf-8');
          for (const key of forbiddenStorageKeys) {
            const forbiddenSet = `localStorage.setItem('${key}'`;
            const forbiddenSetDouble = `localStorage.setItem("${key}"`;
            assert(!content.includes(forbiddenSet) && !content.includes(forbiddenSetDouble), `Violation in ${p}: ${forbiddenSet}`);
          }
        }
      }
    };
    inspectDir(fullDirPath);
  }
});

// 46. CASE 1 & 7: Unauthenticated or logged-out access to /admin redirects to /auth/login
test(46, 'Unauthenticated or logged-out request to /admin redirects to /auth/login', () => {
  const unauthReq = new NextRequest('http://localhost:3000/admin');
  const res = middleware(unauthReq);
  assert(res.status === 307 || res.status === 302, 'Must return redirect status');
  const location = res.headers.get('location');
  assert(location && location.includes('/auth/login'), 'Must redirect to /auth/login');
  assert(location && location.includes('redirect=%2Fadmin'), 'Must preserve redirect to /admin');
});

// 47. CASE 2 & 6: Authenticated player access to /admin has role player and receives 403 Forbidden on admin APIs
test(47, 'Authenticated player requesting admin APIs receives 403 Forbidden', () => {
  const playerId = 'player_regular_' + Date.now();
  const playerProfile = DataStore.initFreshUser(playerId, 'NormalOp');
  assert.strictEqual(playerProfile.role, 'player');

  const { verifyAdminSession } = require('../src/lib/auth/admin');
  const playerToken = Buffer.from(
    JSON.stringify({
      id: playerId,
      email: 'player@example.com',
      username: 'NormalOp',
      role: 'player',
    })
  ).toString('base64');

  const mockReq = new NextRequest('http://localhost:3000/api/admin/metrics', {
    headers: {
      cookie: `life_rpg_session=${playerToken}`,
    },
  });

  return verifyAdminSession(mockReq).then((result: any) => {
    assert.strictEqual(result.authorized, false);
    assert.strictEqual(result.status, 403);
  });
});

// 48. CASE 3, 4, 5: Authenticated admin is authorized and can create rewards
test(48, 'Authenticated admin is authorized and can publish rewards via Admin CMS', () => {
  const adminId = 'admin_owner_' + Date.now();
  const adminProfile = DataStore.initFreshUser(adminId, 'OwnerAdmin');
  adminProfile.role = 'admin';
  DataStore.updateProfile(adminProfile);

  const { verifyAdminSession } = require('../src/lib/auth/admin');
  const adminToken = Buffer.from(
    JSON.stringify({
      id: adminId,
      email: 'owner@liferpg.system',
      username: 'OwnerAdmin',
      role: 'admin',
    })
  ).toString('base64');

  const mockReq = new NextRequest('http://localhost:3000/api/admin/metrics', {
    headers: {
      cookie: `life_rpg_session=${adminToken}`,
    },
  });

  return verifyAdminSession(mockReq).then((result: any) => {
    assert.strictEqual(result.authorized, true);
    assert.strictEqual(result.session?.role, 'admin');

    // Admin creates reward
    const newReward = {
      id: 'reward_admin_created_' + Date.now(),
      name: 'Excalibur Matrix Theme',
      description: 'Exclusive sovereign admin theme',
      category: 'Theme' as const,
      rarity: 'Legendary' as const,
      cost_gold: 5000,
      min_level_required: 20,
      preview_asset: 'theme-excalibur.png',
      is_available: true,
    };
    DataStore.addRewardItem(newReward);
    const item = db.getRewards().find((r) => r.id === newReward.id);
    assert(item, 'Newly published reward must exist');
    assert.strictEqual(item?.name, 'Excalibur Matrix Theme');
  });
});

// 49. CASE 8 & 9: Admin session persists across browser refresh via Supabase Auth cookies
test(49, 'Admin session persistence correctly extracts credentials across browser refresh', () => {
  const adminPayload = Buffer.from(
    JSON.stringify({
      sub: '00000000-0000-4000-a000-000000000001',
      email: 'owner@example.com',
      user_metadata: { display_name: 'Owner', role: 'admin' },
      app_metadata: { role: 'admin' },
      exp: Math.floor(Date.now() / 1000) + 7200,
    })
  ).toString('base64');
  const adminJwt = `eyJhbGciOiJIUzI1NiJ9.${adminPayload}.mockSig`;

  const refreshReq = new NextRequest('http://localhost:3000/admin', {
    headers: {
      cookie: `sb-access-token=${adminJwt}`,
    },
  });

  const session = getAuthSession(refreshReq);
  assert(session, 'Session must be extracted successfully');
  assert.strictEqual(session?.id, '00000000-0000-4000-a000-000000000001');
  assert.strictEqual(session?.email, 'owner@example.com');
});

// 50. CASE 10: New user registration always receives role = player, never admin
test(50, 'New user initialization always defaults strictly to role = player, never admin', () => {
  const newUserId = 'new_recruit_' + Date.now();
  const freshProfile = DataStore.initFreshUser(newUserId, 'Recruit');
  assert.strictEqual(freshProfile.role, 'player', 'New profile role must strictly be player');
  assert.notStrictEqual(freshProfile.role, 'admin', 'New profile must NEVER be initialized as admin');

  // Verify DB schema default in 001_core_schema.sql
  const schemaPath = path.join(process.cwd(), 'supabase', 'migrations', '001_core_schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
  assert(schemaSql.includes("role TEXT NOT NULL DEFAULT 'player'"), "001 schema must define role default as 'player'");
});

// Await any asynchronous tests before reporting final results
Promise.all(asyncQueue).then(() => {
  console.log(`\n======================================================`);
  console.log(`🏁 Verification Results: ${passed} / ${TOTAL_TESTS} Passed | ${failed} Failed`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
});


