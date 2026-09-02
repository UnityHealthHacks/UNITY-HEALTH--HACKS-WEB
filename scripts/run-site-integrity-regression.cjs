const fs = require('fs');
const path = require('path');

const root = process.cwd();
const mode = process.argv[2] || 'all';
if (!['all', 'metadata', 'links'].includes(mode)) {
  console.error(`Unknown mode: ${mode}`);
  process.exit(2);
}

const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const failures = [];
let checkedRefs = 0;
let checkedFragments = 0;

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function decode(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function localTarget(raw) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || value.startsWith('#') || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return null;
  const clean = value.split('#')[0].split('?')[0];
  if (!clean) return null;
  return decode(clean);
}

function hasViewportMeta(text) {
  const metaTags = text.match(/<meta\b[^>]*>/gi) || [];
  return metaTags.some((tag) =>
    /\bname\s*=\s*["']viewport["']/i.test(tag) &&
    /\bcontent\s*=\s*["'][^"']+["']/i.test(tag)
  );
}

function fragmentTarget(file, raw) {
  if (!raw) return null;
  const value = raw.trim();
  if (!value || /^(?:https?:|mailto:|tel:|data:|javascript:)/i.test(value)) return null;

  const hashIndex = value.indexOf('#');
  if (hashIndex < 0) return null;

  const fragment = decode(value.slice(hashIndex + 1));
  if (!fragment) return null;

  const beforeHash = value.slice(0, hashIndex).split('?')[0];
  if (!beforeHash) return { targetFile: file, fragment };

  const decodedPath = decode(beforeHash);
  const normalized = decodedPath.replace(/^\.\//, '').replace(/^\//, '');
  const absolute = path.resolve(root, normalized);
  if (!absolute.startsWith(root + path.sep) && absolute !== root) {
    return { error: `fragment reference escapes repository root: ${raw}` };
  }
  if (!absolute.toLowerCase().endsWith('.html')) return null;
  return { targetFile: path.relative(root, absolute).replace(/\\/g, '/'), fragment };
}

function htmlHasAnchor(text, fragment) {
  const escaped = fragment.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b(?:id|name)\\s*=\\s*["']${escaped}["']`, 'i').test(text);
}

const htmlCache = new Map();
function readHtml(file) {
  if (!htmlCache.has(file)) {
    const absolute = path.resolve(root, file);
    if (!absolute.startsWith(root + path.sep) && absolute !== root) return null;
    if (!fs.existsSync(absolute)) return null;
    htmlCache.set(file, fs.readFileSync(absolute, 'utf8'));
  }
  return htmlCache.get(file);
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  htmlCache.set(file, text);

  if (mode === 'all' || mode === 'metadata') {
    if (!/<html\b[^>]*\blang=["'][^"']+["']/i.test(text)) fail(file, 'missing html lang attribute');
    if (!hasViewportMeta(text)) fail(file, 'missing viewport meta');
    if (!/<title>[^<]+<\/title>/i.test(text)) fail(file, 'missing non-empty title');
  }

  if (mode === 'all' || mode === 'links') {
    const refRe = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
    let match;
    while ((match = refRe.exec(text))) {
      const raw = match[1];
      const target = localTarget(raw);
      if (target) {
        checkedRefs += 1;
        const normalized = target.replace(/^\.\//, '').replace(/^\//, '');
        const absolute = path.resolve(root, normalized);
        if (!absolute.startsWith(root + path.sep) && absolute !== root) {
          fail(file, `local reference escapes repository root: ${raw}`);
        } else if (!fs.existsSync(absolute)) {
          fail(file, `missing local target: ${raw}`);
        }
      }

      const fragmentRef = fragmentTarget(file, raw);
      if (!fragmentRef) continue;
      if (fragmentRef.error) {
        fail(file, fragmentRef.error);
        continue;
      }

      checkedFragments += 1;
      const targetHtml = readHtml(fragmentRef.targetFile);
      if (targetHtml === null) {
        fail(file, `fragment target file missing: ${raw}`);
        continue;
      }
      if (!htmlHasAnchor(targetHtml, fragmentRef.fragment)) {
        fail(file, `missing fragment target #${fragmentRef.fragment} in ${fragmentRef.targetFile}`);
      }
    }
  }
}

if (htmlFiles.length === 0) failures.push('repository: no top-level HTML files found');

if (failures.length) {
  console.error(`UHH site integrity ${mode} regression FAILED`);
  for (const item of failures) console.error(`- ${item}`);
  process.exit(1);
}

const detail = mode === 'metadata'
  ? ''
  : `, ${checkedRefs} local href/src references checked, ${checkedFragments} local fragment targets checked`;
console.log(`UHH site integrity ${mode} regression PASS: ${htmlFiles.length} HTML files${detail}.`);
console.log('Scope: source-level structure/local-target existence only; not browser/device/runtime/release proof.');
