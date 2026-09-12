-- LIFE RPG AUTOMATIC AUTH SIGNUP TRIGGER
-- Migration: 004_auth_triggers.sql

-- 1. Create function to initialize newly registered operator profile
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  default_username TEXT;
BEGIN
  default_username := COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1), 'Operator');

  -- Insert profile
  INSERT INTO public.profiles (
    id,
    username,
    title,
    level,
    xp_current,
    xp_next_level,
    gold_balance,
    streak_days,
    streak_multiplier,
    last_active_date,
    avatar_url
  ) VALUES (
    NEW.id,
    default_username,
    'Initiate Strategist',
    1,
    0,
    1000,
    0,
    0,
    1.00,
    CURRENT_DATE,
    '/avatar.png'
  ) ON CONFLICT (id) DO NOTHING;

  -- Insert character attributes
  INSERT INTO public.character_attributes (
    profile_id,
    intellect,
    discipline,
    vitality,
    strength,
    creativity,
    today_intellect_delta,
    today_discipline_delta,
    today_vitality_delta,
    today_strength_delta,
    today_creativity_delta
  ) VALUES (
    NEW.id,
    50,
    50,
    50,
    50,
    50,
    0,
    0,
    0,
    0,
    0
  ) ON CONFLICT (profile_id) DO NOTHING;

  -- Insert streak record
  INSERT INTO public.streaks (
    profile_id,
    current_streak,
    longest_streak,
    last_activity_date
  ) VALUES (
    NEW.id,
    0,
    0,
    CURRENT_DATE
  ) ON CONFLICT (profile_id) DO NOTHING;

  -- Insert empty loadout
  INSERT INTO public.equipped_items (
    profile_id
  ) VALUES (
    NEW.id
  ) ON CONFLICT (profile_id) DO NOTHING;

  -- Insert starter quests
  INSERT INTO public.quests (
    profile_id,
    title,
    description,
    category,
    difficulty,
    attribute,
    xp_reward,
    gold_reward,
    frequency,
    status,
    due_date
  ) VALUES
    (NEW.id, 'Initialize Cognitive Command Deck', 'Review system capabilities, configure operational profile, and review active directives.', 'Engineering', 'Easy', 'Intellect', 80, 40, 'Daily', 'active', NOW() + INTERVAL '1 day'),
    (NEW.id, 'Establish Deep Work Protocol', 'Execute a 90-minute distraction-free engineering or writing session.', 'Work', 'Normal', 'Discipline', 120, 65, 'Daily', 'active', NOW() + INTERVAL '1 day'),
    (NEW.id, 'Recovery & Sunlight Walk', 'Complete a 30-minute outdoor walk with hydration and natural light exposure.', 'Health', 'Easy', 'Vitality', 80, 40, 'Daily', 'active', NOW() + INTERVAL '1 day')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach trigger to auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
