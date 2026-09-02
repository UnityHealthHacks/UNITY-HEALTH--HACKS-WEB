'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const failures = [];

for (const file of htmlFiles) {
  const bytes = fs.readFileSync(path.join(root, file));
  const source = bytes.toString('utf8');

  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    failures.push(`${file}: UTF-8 BOM is not allowed`);
  }

  const headMatch = source.match(/<head\b[^>]*>([\s\S]*?)<\/head>/i);
  if (!headMatch) {
    failures.push(`${file}: missing head element`);
    continue;
  }

  const head = headMatch[1];
  const charsetTags = head.match(/<meta\b[^>]*\bcharset\s*=\s*["']?[^\s"'>]+["']?[^>]*>/gi) || [];
  if (charsetTags.length !== 1) {
    failures.push(`${file}: expected exactly one meta charset declaration, found ${charsetTags.length}`);
    continue;
  }

  if (!/\bcharset\s*=\s*["']?utf-8["']?/i.test(charsetTags[0])) {
    failures.push(`${file}: meta charset must be utf-8`);
  }

  const declarationIndex = source.indexOf(charsetTags[0]);
  if (declarationIndex < 0 || declarationIndex >= 1024) {
    failures.push(`${file}: utf-8 charset declaration must appear within the first 1024 bytes`);
  }
}

if (htmlFiles.length === 0) failures.push('repository: no top-level HTML files found');

if (failures.length) {
  console.error('HTML encoding regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`HTML encoding regression PASS (${htmlFiles.length} HTML files checked)`);
console.log('Boundary: exactly one early UTF-8 charset declaration per top-level HTML document and no UTF-8 BOM.');
