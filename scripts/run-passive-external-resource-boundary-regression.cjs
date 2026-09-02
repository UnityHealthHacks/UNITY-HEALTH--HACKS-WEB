'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const htmlFiles = fs.readdirSync(root)
  .filter((name) => name.endsWith('.html'))
  .sort();

const remote = /^(?:https?:)?\/\//i;
const failures = [];

function attrs(tag) {
  const out = new Map();
  for (const match of tag.matchAll(/\b([\w:-]+)\s*=\s*(["'])(.*?)\2/gis)) {
    out.set(match[1].toLowerCase(), match[3].trim());
  }
  return out;
}

function checkValue(file, tagName, attrName, value) {
  if (value && remote.test(value)) {
    failures.push(`${file}: remote ${tagName} ${attrName} is not allowed: ${value}`);
  }
}

for (const file of htmlFiles) {
  const source = fs.readFileSync(path.join(root, file), 'utf8');

  for (const match of source.matchAll(/<(img|audio|source|track|embed)\b[^>]*>/gis)) {
    const tagName = match[1].toLowerCase();
    const a = attrs(match[0]);
    checkValue(file, tagName, 'src', a.get('src'));
    if (tagName === 'img') checkValue(file, tagName, 'srcset', a.get('srcset'));
  }

  for (const match of source.matchAll(/<video\b[^>]*>/gis)) {
    const a = attrs(match[0]);
    checkValue(file, 'video', 'src', a.get('src'));
    checkValue(file, 'video', 'poster', a.get('poster'));
  }

  for (const match of source.matchAll(/<object\b[^>]*>/gis)) {
    const a = attrs(match[0]);
    checkValue(file, 'object', 'data', a.get('data'));
  }

  for (const match of source.matchAll(/<link\b[^>]*>/gis)) {
    const a = attrs(match[0]);
    const rel = (a.get('rel') || '').toLowerCase().split(/\s+/);
    const externally-sensitiveRel = rel.some((value) =>
      ['stylesheet', 'preload', 'modulepreload', 'prefetch', 'icon', 'manifest'].includes(value)
    );
    if (externallySensitiveRel) checkValue(file, 'link', 'href', a.get('href'));
  }
}

if (failures.length) {
  console.error('Passive external resource boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`PASS: ${htmlFiles.length} top-level HTML files contain no unreviewed remote passive subresources.`);
