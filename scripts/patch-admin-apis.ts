import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else if (file === 'route.ts') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routes = walk('src/app/api/admin');

for (const route of routes) {
  let content = fs.readFileSync(route, 'utf-8');
  let changed = false;

  // Ensure getSupabaseServerClient is imported
  if (!content.includes('getSupabaseServerClient')) {
    content = content.replace(
      /import\s+\{\s*getSupabaseAdminClient\s*,\s*isSupabaseConfigured\s*\}\s+from\s+['"]@\/lib\/supabase\/server['"];/,
      "import { getSupabaseAdminClient, getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';"
    );
    changed = true;
  }

  // Also catch other variations
  if (!content.includes('getSupabaseServerClient')) {
    content = content.replace(
      /import\s+\{\s*isSupabaseConfigured\s*,\s*getSupabaseAdminClient\s*\}\s+from\s+['"]@\/lib\/supabase\/server['"];/,
      "import { getSupabaseAdminClient, getSupabaseServerClient, isSupabaseConfigured } from '@/lib/supabase/server';"
    );
    changed = true;
  }

  // Replace client initialization
  if (content.includes('const supabase = getSupabaseAdminClient();')) {
    content = content.replace(
      /const supabase = getSupabaseAdminClient\(\);/g,
      'const supabase = getSupabaseAdminClient() || getSupabaseServerClient(req);'
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(route, content, 'utf-8');
    console.log('Updated:', route);
  }
}
