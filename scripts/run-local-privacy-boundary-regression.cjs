const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];

function read(file) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(`${file}: required file missing`);
    return '';
  }
  return fs.readFileSync(full, 'utf8');
}

function requireText(file, text, needles) {
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`${file}: missing required privacy boundary text: ${needle}`);
  }
}

const labHtml = read('guardian-lab.html');
const guardianJs = read('assets/guardian.js');

requireText('guardian-lab.html', labHtml, [
  'NOT CONNECTED TO LIVE AI, LIVE CHECKOUT, OR A SECURE MEMBER HEALTH ACCOUNT.',
  'Do not enter private medical records, passwords, medication lists, lab reports, or identifying health information.',
  'This is a local prototype, not a secure member record.'
]);

requireText('assets/guardian.js', guardianJs, [
  'const STORAGE_KEY = "uhhGuardianProfile";',
]);

// This prototype may process a question in memory to render a local response, but it must not
// transmit that question or silently turn it into persistent browser history/storage.
const networkPatterns = [
  ['fetch()', /\bfetch\s*\(/],
  ['XMLHttpRequest', /\bXMLHttpRequest\b/],
  ['WebSocket', /\bWebSocket\b/],
  ['sendBeacon', /\bnavigator\s*\.\s*sendBeacon\s*\(/]
];
for (const [label, pattern] of networkPatterns) {
  if (pattern.test(guardianJs)) failures.push(`assets/guardian.js: ${label} found; local Guardian must not transmit prompts`);
}

const persistentPromptPatterns = [
  ['guardian question stored directly', /localStorage\.setItem\s*\([^\n;]*(?:guardianQuestion|question\.value|raw|value)/i],
  ['session storage use', /\bsessionStorage\b/],
  ['IndexedDB use', /\bindexedDB\b/i]
];
for (const [label, pattern] of persistentPromptPatterns) {
  if (pattern.test(guardianJs)) failures.push(`assets/guardian.js: ${label}; prompt persistence is not approved`);
}

// The local prototype form must not post to a server endpoint.
const formMatch = labHtml.match(/<form\b[^>]*id=["']guardianForm["'][^>]*>/i);
if (!formMatch) {
  failures.push('guardian-lab.html: guardianForm not found');
} else if (/\baction\s*=|\bmethod\s*=/i.test(formMatch[0])) {
  failures.push('guardian-lab.html: guardianForm has action/method attributes; network submission is not approved');
}

// Keep the current storage scope explicit. A future secure account must use an approved backend,
// not quietly expand local browser storage into a health-record store.
const storageKeys = [...guardianJs.matchAll(/localStorage\.(?:getItem|setItem|removeItem)\s*\(\s*([^,\)]+)/g)].map((m) => m[1].trim());
for (const keyExpr of storageKeys) {
  if (keyExpr !== 'STORAGE_KEY') failures.push(`assets/guardian.js: unexpected localStorage key expression ${keyExpr}`);
}

if (failures.length) {
  console.error('UHH local privacy boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('UHH local privacy boundary regression PASS.');
console.log('Scope: source-only guard for the current local Guardian prototype. No claim is made about production privacy/security architecture, hosted runtime, browser/device behavior, or release green.');
