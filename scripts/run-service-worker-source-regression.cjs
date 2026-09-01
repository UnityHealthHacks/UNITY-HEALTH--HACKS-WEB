'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const swPath = path.join(root, 'service-worker.js');

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function requireMatch(source, regex, message) {
  if (!regex.test(source)) fail(message);
}

if (!fs.existsSync(swPath)) {
  fail('service-worker.js is missing');
  process.exit(1);
}

const source = fs.readFileSync(swPath, 'utf8');

requireMatch(source, /const\s+CACHE\s*=\s*['"]uhh-9-5-development-[^'"]+['"]\s*;/,
  'cache namespace must identify the controlled 9.5 development line');
requireMatch(source, /const\s+PRECACHE\s*=\s*\[/,
  'explicit precache list is required');
for (const required of ['./index.html', './assets/styles.css', './assets/site.js', './manifest.webmanifest']) {
  if (!source.includes(JSON.stringify(required))) fail(`precache must include ${required}`);
}

requireMatch(source, /cache\.addAll\(PRECACHE\)/,
  'install must populate the declared precache atomically');
requireMatch(source, /self\.skipWaiting\(\)/,
  'install must request activation of the new controlled worker');
requireMatch(source, /caches\.keys\(\)[\s\S]*k\s*!==\s*CACHE[\s\S]*caches\.delete\(k\)/,
  'activate must remove stale cache namespaces');
requireMatch(source, /self\.clients\.claim\(\)/,
  'activate must claim controlled clients after stale-cache cleanup');

requireMatch(source, /fetch\(request,\s*\{\s*cache:\s*['"]no-store['"]\s*\}\)/,
  'network-first path must bypass HTTP cache when checking for current navigation/code');
requireMatch(source, /if\s*\(req\.method\s*!==\s*['"]GET['"]\)\s*return\s*;/,
  'service worker must not intercept non-GET requests');
requireMatch(source, /if\s*\(url\.origin\s*!==\s*self\.location\.origin\)\s*return\s*;/,
  'service worker must not intercept cross-origin requests');
requireMatch(source, /if\s*\(isNavigation\s*\|\|\s*isCodeAsset\)\s*\{[\s\S]*?event\.respondWith\(networkFirst\(req\)\)/,
  'navigations and code/manifest assets must remain network-first');
requireMatch(source, /if\s*\(request\.mode\s*===\s*['"]navigate['"]\)\s*return\s+caches\.match\(['"]\.\/404\.html['"]\)/,
  'offline navigation fallback must remain an explicit local 404 shell');

// Guard explicit unsafe cache/runtime behaviors without trying to infer data
// sensitivity from ordinary variable names such as `response`.
const forbidden = [
  /req\.method\s*===\s*['"]POST['"]/i,
  /caches\.open\([^)]*9-3/i
];
for (const pattern of forbidden) {
  if (pattern.test(source)) fail(`forbidden service-worker pattern detected: ${pattern}`);
}

if (!process.exitCode) {
  console.log('PASS: service worker source guard preserves 9.5 cache identity, stale-cache cleanup, same-origin GET-only interception, and network-first navigation/code behavior.');
  console.log('BOUNDARY: source guard only; browser/device cache behavior and PWA installability remain separate acceptance gates.');
}
