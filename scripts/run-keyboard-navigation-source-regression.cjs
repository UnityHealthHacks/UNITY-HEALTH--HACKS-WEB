const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const cssPath = path.join(root, 'assets', 'styles.css');
const jsPath = path.join(root, 'assets', 'site.js');
const failures = [];

function fail(file, message) {
  failures.push(`${file}: ${message}`);
}

function attrs(tag) {
  const out = new Map();
  const re = /\b([a-zA-Z_:][\w:.-]*)\s*=\s*(["'])(.*?)\2/g;
  let match;
  while ((match = re.exec(tag))) out.set(match[1].toLowerCase(), match[3]);
  return out;
}

if (!fs.existsSync(cssPath)) fail('assets/styles.css', 'missing shared stylesheet');
else {
  const css = fs.readFileSync(cssPath, 'utf8');
  for (const selector of ['a:focus-visible', 'button:focus-visible', 'input:focus-visible', 'select:focus-visible', 'textarea:focus-visible']) {
    if (!css.includes(selector)) fail('assets/styles.css', `missing visible-focus rule for ${selector}`);
  }
  if (!/prefers-reduced-motion\s*:\s*reduce/i.test(css)) fail('assets/styles.css', 'missing prefers-reduced-motion safeguard');
}

if (!fs.existsSync(jsPath)) fail('assets/site.js', 'missing shared site script');
else {
  const js = fs.readFileSync(jsPath, 'utf8');
  if (!/e\.key\s*===\s*['"]Escape['"]/.test(js)) fail('assets/site.js', 'mobile navigation lacks Escape-key close handling');
  if (!/aria-expanded/.test(js)) fail('assets/site.js', 'mobile navigation does not maintain aria-expanded');
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');

  const positiveTabindex = /\btabindex\s*=\s*(["'])\s*[1-9]\d*\s*\1/i;
  if (positiveTabindex.test(text)) fail(file, 'positive tabindex found; source order should determine keyboard order');

  const targetBlankRe = /<a\b[^>]*\btarget\s*=\s*(["'])_blank\1[^>]*>/gi;
  let targetMatch;
  while ((targetMatch = targetBlankRe.exec(text))) {
    const a = attrs(targetMatch[0]);
    const rel = (a.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean);
    if (!rel.includes('noopener')) fail(file, 'target=_blank link missing rel=noopener');
  }

  const menuButton = (text.match(/<button\b[^>]*\bid\s*=\s*(["'])menuBtn\1[^>]*>/i) || [])[0];
  if (menuButton) {
    const a = attrs(menuButton);
    if ((a.get('aria-controls') || '') !== 'navLinks') fail(file, 'menuBtn must aria-control navLinks');
    if ((a.get('aria-expanded') || '') !== 'false') fail(file, 'menuBtn initial aria-expanded must be false');
    if (!(a.get('aria-label') || '').trim()) fail(file, 'menuBtn missing accessible label');
    if (!/\bid\s*=\s*(["'])navLinks\1/i.test(text)) fail(file, 'menuBtn present but navLinks target missing');
  }

  const placeholderLinkRe = /<a\b[^>]*\bhref\s*=\s*(["'])\s*#\s*\1[^>]*>/gi;
  if (placeholderLinkRe.test(text)) fail(file, 'placeholder href=# link found');
}

if (!htmlFiles.length) failures.push('repository: no top-level HTML files found');

if (failures.length) {
  console.error('UHH keyboard/navigation source regression FAILED');
  for (const item of failures) console.error(`- ${item}`);
  console.error('Scope: deterministic source guard only; failures require review and do not by themselves establish browser/device behavior.');
  process.exit(1);
}

console.log(`UHH keyboard/navigation source regression PASS: ${htmlFiles.length} top-level HTML files checked.`);
console.log('Scope: source-level focus/navigation safeguards only; not keyboard-device, assistive-technology, browser, visual-contrast, hosted-runtime, customer-flow, or release proof.');
