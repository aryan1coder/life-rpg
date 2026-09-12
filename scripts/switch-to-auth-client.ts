import fs from 'fs';
import path from 'path';

function walk(dir: string, fileList: string[] = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      walk(filePath, fileList);
    } else if (file === 'route.ts' || file === 'admin.ts') {
      fileList.push(filePath);
    }
  }
  return fileList;
}

const routes = walk('src/app/api/admin');
routes.push('src/lib/auth/admin.ts');

for (const route of routes) {
  let content = fs.readFileSync(route, 'utf-8');
  let changed = false;

  if (content.includes('getSupabaseServerClient')) {
    content = content.replace(/getSupabaseServerClient/g, 'getAuthenticatedSupabaseClient');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(route, content, 'utf-8');
    console.log('Updated:', route);
  }
}
