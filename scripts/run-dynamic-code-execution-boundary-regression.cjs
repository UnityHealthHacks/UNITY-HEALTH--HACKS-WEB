const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const scanned = [];
const scriptExt = new Set(['.js', '.cjs', '.mjs']);
const ignoreDirs = new Set(['.git', 'node_modules']);

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') && entry.name !== '.github') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!ignoreDirs.has(entry.name)) walk(full);
      continue;
    }
    if (!scriptExt.has(path.extname(entry.name))) continue;
    scanned.push(path.relative(root, full));
  }
}

const guards = [
  ['eval()', /\beval\s*\(/g],
  ['Function constructor', /\bnew\s+Function\s*\(|\bFunction\s*\(\s*["'`]/g],
  ['string-based setTimeout', /\bsetTimeout\s*\(\s*["'`]/g],
  ['string-based setInterval', /\bsetInterval\s*\(\s*["'`]/g],
  ['document.write()', /\bdocument\s*\.\s*write(?:ln)?\s*\(/g]
];

walk(root);

for (const relative of scanned) {
  if (relative === 'scripts/run-dynamic-code-execution-boundary-regression.cjs') continue;
  const text = fs.readFileSync(path.join(root, relative), 'utf8');
  for (const [label, pattern] of guards) {
    pattern.lastIndex = 0;
    if (pattern.test(text)) failures.push(`${relative}: prohibited dynamic execution primitive detected: ${label}`);
  }
}

if (failures.length) {
  console.error('UHH dynamic code-execution boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`UHH dynamic code-execution boundary regression PASS: ${scanned.length} JavaScript source files scanned.`);
console.log('Scope: deterministic source guard only. This does not establish runtime security, browser/device behavior, data security, or release green.');
