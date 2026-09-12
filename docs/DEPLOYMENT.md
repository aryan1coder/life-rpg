# LIFE RPG — Deployment & Environment Configuration

## 1. Vercel Deployment
LIFE RPG is engineered for seamless deployment on Vercel:
1. Push repository to GitHub.
2. Import project into Vercel dashboard.
3. Configure environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
4. Build command: `npm run build`
5. Output directory: `.next`

## 2. Supabase Cloud Setup
1. Create a new Supabase project.
2. In the SQL Editor, execute the migration files sequentially:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_seed_catalog.sql`
3. Retrieve API credentials under Project Settings -> API and populate your environment variables.
