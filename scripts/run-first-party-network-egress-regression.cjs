#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const assetsDir = path.join(root, 'assets');

// Current Tier One product architecture is static/local-first. First-party browser
// application code must not silently acquire network egress capability. Explicit
// infrastructure exceptions are intentionally narrow:
// - service-worker.js performs same-origin GET fetches for static assets/navigation.
// - assets/barcode-scanner.js is vendored third-party scanner source and is not an
//   authorized UHH network/data transport layer.
// Test/regression sources under scripts/ are not browser application code.
const applicationFiles = [];

for (const name of fs.readdirSync(assetsDir)) {
  if (!name.endsWith('.js')) continue;
  if (name === 'barcode-scanner.js') continue;
  applicationFiles.push(path.join(assetsDir, name));
}

for (const name of fs.readdirSync(root)) {
  if (!name.endsWith('.html')) continue;
  applicationFiles.push(path.join(root, name));
}

const checks = [
  { label: 'fetch()', re: /\bfetch\s*\(/ },
  { label: 'XMLHttpRequest', re: /\bXMLHttpRequest\b/ },
  { label: 'WebSocket', re: /\bWebSocket\s*\(/ },
  { label: 'EventSource', re: /\bEventSource\s*\(/ },
  { label: 'navigator.sendBeacon()', re: /\bnavigator\s*\.\s*sendBeacon\s*\(/ },
];

const failures = [];

for (const file of applicationFiles) {
  const rel = path.relative(root, file).replace(/\\/g, '/');
  const source = fs.readFileSync(file, 'utf8');
  for (const check of checks) {
    if (check.re.test(source)) failures.push(`${rel}: unauthorized ${check.label} primitive`);
  }
}

// The service worker is the only current first-party browser source with network
// access, and its dedicated regression must remain present so that exception is
// independently bounded to same-origin GET/static behavior.
const swRegression = path.join(root, 'scripts', 'run-service-worker-source-regression.cjs');
if (!fs.existsSync(swRegression)) {
  failures.push('missing dedicated service-worker source regression for network exception');
}

if (failures.length) {
  console.error('First-party network egress regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`First-party network egress regression PASS (${applicationFiles.length} application files checked)`);
console.log('No first-party browser application network egress primitives detected outside the separately bounded service worker.');
