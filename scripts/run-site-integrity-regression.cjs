const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const failures = [];
let checkedRefs = 0;

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function localTarget(raw) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return null;
  const clean = value.split('#')[0].split('?')[0];
  if (!clean) return null;
  try {
    return decodeURIComponent(clean);
  } catch {
    return clean;
  }
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');

  if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(text)) fail(file, 'missing html lang attribute');
  if (!/<meta\b[^>]*name=["']viewport["'][^>]*content=["'][^"']+["']/i.test(text)) fail(file, 'missing viewport meta');
  if (!/<title>[^<]+<\/title>/i.test(text)) fail(file, 'missing non-empty title');

  const refRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = refRe.exec(text))) {
    const target = localTarget(match[1]);
    if (!target) continue;
    checkedRefs += 1;

    const normalized = target.replace(/^\.\//, '').replace(/^\//, '');
    const absolute = path.resolve(root, normalized);
    if (!absolute.startsWith(root + path.sep) && absolute !== root) {
      fail(file, `local reference escapes repository root: ${match[1]}`);
      continue;
    }
    if (!fs.existsSync(absolute)) fail(file, `missing local target: ${match[1]}`);
  }
}

if (htmlFiles.length === 0) failures.push('repository: no top-level HTML files found');

if (failures.length) {
  console.error('UHH site integrity regression FAILED');
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`UHH site integrity regression PASS: ${htmlFiles.length} HTML files, ${checkedRefs} local href/src references checked.`);
console.log('Scope: source-level structure and local-target existence only; not browser/device/runtime/release proof.');
