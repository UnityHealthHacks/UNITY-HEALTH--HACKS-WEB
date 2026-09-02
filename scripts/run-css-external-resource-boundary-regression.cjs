'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FIRST_PARTY_CSS = [path.join(ROOT, 'assets', 'styles.css')];
const failures = [];

for (const file of FIRST_PARTY_CSS) {
  if (!fs.existsSync(file)) {
    failures.push(`${path.relative(ROOT, file)}: required first-party stylesheet is missing`);
    continue;
  }

  const css = fs.readFileSync(file, 'utf8');
  const rel = path.relative(ROOT, file);

  // Current Tier One static architecture keeps first-party CSS self-contained.
  // Any remote stylesheet/resource dependency requires an explicit architecture review.
  const remoteImport = /@import\s+(?:url\(\s*)?["']?\s*(?:https?:)?\/\//i;
  const remoteUrl = /url\(\s*["']?\s*(?:https?:)?\/\//i;

  if (remoteImport.test(css)) {
    failures.push(`${rel}: remote CSS @import detected`);
  }
  if (remoteUrl.test(css)) {
    failures.push(`${rel}: remote CSS url() resource detected`);
  }
}

if (failures.length) {
  console.error('CSS external-resource boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('CSS external-resource boundary regression PASS');
console.log('First-party CSS remains free of remote @import and remote url() dependencies.');
