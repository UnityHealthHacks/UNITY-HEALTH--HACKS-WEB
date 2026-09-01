const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const scanned = [];
const textExt = new Set(['.html', '.js', '.cjs', '.mjs', '.json', '.webmanifest', '.md', '.txt', '.yml', '.yaml', '.css']);
const ignoreDirs = new Set(['.git', 'node_modules']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walk(full);
      continue;
    }
    if (!textExt.has(path.extname(entry.name))) continue;
    scanned.push(path.relative(root, full));
  }
}

function requireText(file, needles) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) {
    failures.push(`${file}: required boundary file missing`);
    return;
  }
  const text = fs.readFileSync(full, 'utf8');
  for (const needle of needles) {
    if (!text.includes(needle)) failures.push(`${file}: missing required boundary text: ${needle}`);
  }
}

walk(root);

requireText('membership.html', [
  'NO LIVE CHECKOUT',
  'Price under review',
  'Live AI billing is not connected yet.'
]);
requireText('guardian-lab.html', [
  'NOT CONNECTED TO LIVE AI, LIVE CHECKOUT, OR A SECURE MEMBER HEALTH ACCOUNT.',
  'This is a local prototype, not a secure member record.',
  'This page is intentionally not presented as live ChatGPT.'
]);

const secretPatterns = [
  ['Stripe live secret key', /\bsk_live_[A-Za-z0-9]{16,}\b/g],
  ['OpenAI secret key', /\bsk-(?:proj-)?[A-Za-z0-9_-]{20,}\b/g],
  ['AWS access key', /\bAKIA[0-9A-Z]{16}\b/g],
  ['GitHub personal token', /\bgh[pousr]_[A-Za-z0-9]{20,}\b/g],
  ['Private key material', /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g]
];
const liveCommercePatterns = [
  ['Stripe hosted checkout', /https?:\/\/(?:buy|checkout)\.stripe\.com\//gi],
  ['PayPal payment link', /https?:\/\/(?:www\.)?paypal\.me\//gi]
];

for (const relative of scanned) {
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const [label, pattern] of secretPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) failures.push(`${relative}: possible ${label} found`);
  }
  if (/\.(?:html|js|cjs|mjs)$/.test(relative)) {
    for (const [label, pattern] of liveCommercePatterns) {
      pattern.lastIndex = 0;
      if (pattern.test(text)) failures.push(`${relative}: active ${label} URL found while commerce is disabled`);
    }
  }
}

if (failures.length) {
  console.error('UHH release-boundary safety regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`UHH release-boundary safety regression PASS: ${scanned.length} text source files scanned.`);
console.log('Scope: deterministic source guard only. This does not establish runtime, privacy/security architecture, customer-flow, commerce, or release green.');
