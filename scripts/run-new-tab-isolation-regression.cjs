'use strict';

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .sort();

const failures = [];
const anchorPattern = /<a\b[^>]*>/gi;
const attrPattern = /([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;

function attrsFor(tag) {
  const attrs = new Map();
  let match;
  while ((match = attrPattern.exec(tag)) !== null) {
    attrs.set(match[1].toLowerCase(), (match[2] ?? match[3] ?? match[4] ?? '').trim());
  }
  attrPattern.lastIndex = 0;
  return attrs;
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');
  let match;
  while ((match = anchorPattern.exec(source)) !== null) {
    const tag = match[0];
    const attrs = attrsFor(tag);
    if ((attrs.get('target') || '').toLowerCase() !== '_blank') continue;

    const relTokens = new Set((attrs.get('rel') || '').toLowerCase().split(/\s+/).filter(Boolean));
    const missing = ['noopener', 'noreferrer'].filter((token) => !relTokens.has(token));
    if (missing.length) {
      const line = source.slice(0, match.index).split('\n').length;
      failures.push(`${file}:${line} target="_blank" missing rel token(s): ${missing.join(', ')}`);
    }
  }
}

if (failures.length) {
  console.error('New-tab isolation regression FAILED.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`New-tab isolation regression passed for ${htmlFiles.length} top-level HTML files.`);
