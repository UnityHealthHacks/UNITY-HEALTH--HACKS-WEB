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

  // Active mixed content is never acceptable in the controlled static surface.
  const activeHttp = source.match(/<(?:script|iframe|form)\b[^>]*(?:src|action)\s*=\s*["']http:\/\/[^"']+["'][^>]*>/gi) || [];
  for (const match of activeHttp) push(file, `insecure active external target: ${match}`);

  // Remote executable script dependencies can change independently of the repository.
  const remoteScripts = source.match(/<script\b[^>]*\bsrc\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  for (const match of remoteScripts) push(file, `remote script execution dependency is not allowed: ${match}`);

  // Forms in this development baseline must not silently submit member input off-site.
  const remoteForms = source.match(/<form\b[^>]*\baction\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  for (const match of remoteForms) push(file, `remote form submission is not allowed: ${match}`);

  // Embedded remote applications introduce an execution/privacy boundary that must be explicit.
  const remoteFrames = source.match(/<iframe\b[^>]*\bsrc\s*=\s*["']https?:\/\/[^"']+["'][^>]*>/gi) || [];
  for (const match of remoteFrames) push(file, `remote iframe is not allowed: ${match}`);

  // javascript: URLs bypass ordinary navigation/link controls and are unnecessary here.
  if (/\b(?:href|src|action)\s*=\s*["']\s*javascript:/i.test(source)) {
    push(file, 'javascript: URL detected');
  }
}

if (failures.length) {
  console.error('External execution/submission boundary regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log(`External execution/submission boundary regression PASS (${htmlFiles.length} HTML files checked)`);
console.log('Boundary: no remote executable scripts, remote form submissions, remote iframes, insecure active HTTP targets, or javascript: URLs in top-level HTML.');
