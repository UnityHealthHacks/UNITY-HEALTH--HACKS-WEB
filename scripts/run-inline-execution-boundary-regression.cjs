'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .sort();

const failures = [];

function push(file, message) {
  failures.push(`${file}: ${message}`);
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');

  // Inline event-handler attributes expand the executable surface and obstruct a strict CSP.
  const inlineHandlers = source.match(/\son[a-z][a-z0-9_-]*\s*=\s*["'][^"']*["']/gi) || [];
  for (const match of inlineHandlers) push(file, `inline event handler is not allowed: ${match.trim()}`);

  // Meta refresh can create client-side redirects outside ordinary navigation controls.
  const metaTags = source.match(/<meta\b[^>]*>/gi) || [];
  for (const tag of metaTags) {
    if (/\bhttp-equiv\s*=\s*["']?refresh["']?/i.test(tag)) {
      push(file, `meta refresh is not allowed: ${tag}`);
    }
  }

  // A base element can silently rewrite every relative navigation/resource target on a page.
  const baseTags = source.match(/<base\b[^>]*>/gi) || [];
  for (const tag of baseTags) push(file, `base element requires explicit architecture review: ${tag}`);
}

if (failures.length) {
  console.error('Inline execution/navigation boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`Inline execution/navigation boundary regression PASS (${htmlFiles.length} HTML files checked)`);
console.log('Boundary: no inline event handlers, meta refresh redirects, or base elements in top-level HTML.');
