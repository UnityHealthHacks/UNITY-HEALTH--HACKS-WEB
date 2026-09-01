const fs = require('fs');
const path = require('path');

const root = process.cwd();
const htmlFiles = fs.readdirSync(root).filter((name) => name.endsWith('.html')).sort();
const failures = [];
let images = 0;
let controls = 0;

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

function stripTags(value) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function isWrappedByLabel(text, index) {
  const before = text.slice(0, index).toLowerCase();
  return before.lastIndexOf('<label') > before.lastIndexOf('</label>');
}

for (const file of htmlFiles) {
  const text = fs.readFileSync(path.join(root, file), 'utf8');

  const h1s = text.match(/<h1\b[^>]*>[\s\S]*?<\/h1>/gi) || [];
  if (h1s.length !== 1) fail(file, `expected exactly one h1, found ${h1s.length}`);
  else if (!stripTags(h1s[0])) fail(file, 'h1 has no text content');

  const ids = new Set();
  const duplicateIds = new Set();
  const idRe = /\bid\s*=\s*(["'])(.*?)\1/gi;
  let idMatch;
  while ((idMatch = idRe.exec(text))) {
    const id = idMatch[2].trim();
    if (!id) continue;
    if (ids.has(id)) duplicateIds.add(id);
    ids.add(id);
  }
  for (const id of duplicateIds) fail(file, `duplicate id: ${id}`);

  const imgRe = /<img\b[^>]*>/gi;
  let imgMatch;
  while ((imgMatch = imgRe.exec(text))) {
    images += 1;
    const a = attrs(imgMatch[0]);
    if (!a.has('alt')) fail(file, 'img missing alt attribute');
  }

  const buttonRe = /<button\b[^>]*>([\s\S]*?)<\/button>/gi;
  let buttonMatch;
  while ((buttonMatch = buttonRe.exec(text))) {
    controls += 1;
    const a = attrs(buttonMatch[0]);
    const name = stripTags(buttonMatch[1]) || (a.get('aria-label') || '').trim() || (a.get('title') || '').trim();
    if (!name) fail(file, 'button missing accessible name');
  }

  const inputRe = /<(input|select|textarea)\b[^>]*>/gi;
  let inputMatch;
  while ((inputMatch = inputRe.exec(text))) {
    const tag = inputMatch[0];
    const a = attrs(tag);
    if ((a.get('type') || '').toLowerCase() === 'hidden') continue;
    controls += 1;
    const id = (a.get('id') || '').trim();
    const named = (a.get('aria-label') || '').trim() || (a.get('aria-labelledby') || '').trim() || (a.get('title') || '').trim();
    let labelled = isWrappedByLabel(text, inputMatch.index);
    if (!labelled && id) {
      const escaped = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      labelled = new RegExp(`<label\\b[^>]*\\bfor\\s*=\\s*["']${escaped}["']`, 'i').test(text);
    }
    if (!named && !labelled) fail(file, `${inputMatch[1].toLowerCase()} missing programmatic label`);
  }

  const htmlTag = (text.match(/<html\b[^>]*>/i) || [])[0] || '';
  const htmlAttrs = attrs(htmlTag);
  if (!(htmlAttrs.get('lang') || '').trim()) fail(file, 'html lang is empty or absent');
}

if (htmlFiles.length === 0) failures.push('repository: no top-level HTML files found');

if (failures.length) {
  console.error('UHH accessibility source regression FAILED');
  for (const item of failures) console.error(`- ${item}`);
  console.error('Scope: deterministic source semantics only; failures require review, not automatic release conclusions.');
  process.exit(1);
}

console.log(`UHH accessibility source regression PASS: ${htmlFiles.length} HTML files, ${images} images, ${controls} form/button controls checked.`);
console.log('Scope: source-level semantics only; not assistive-technology, keyboard, visual-contrast, browser/device, hosted-runtime, or release proof.');
