'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..');
const scannerPath = path.join(root, 'assets', 'barcode-scanner.js');
const noticePath = path.join(root, 'assets', 'THIRD_PARTY_NOTICES.txt');

const fail = (message) => {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
};

if (!fs.existsSync(scannerPath)) {
  fail('vendored barcode scanner is missing');
}

if (!fs.existsSync(noticePath)) {
  fail('THIRD_PARTY_NOTICES.txt is missing');
}

if (process.exitCode) process.exit(process.exitCode);

// This is the verified Git blob identity of the currently reviewed vendored scanner.
// Any intentional vendor update must explicitly update this acceptance boundary after review.
const expectedScannerBlob = 'b00ae0faef62241efc313fc91355630b5f2b6d14';
let actualScannerBlob = '';
try {
  actualScannerBlob = execFileSync('git', ['hash-object', 'assets/barcode-scanner.js'], {
    cwd: root,
    encoding: 'utf8',
  }).trim();
} catch (error) {
  fail(`could not calculate vendored scanner Git blob identity: ${error.message}`);
}

if (actualScannerBlob && actualScannerBlob !== expectedScannerBlob) {
  fail(`vendored barcode scanner changed without explicit review boundary update (expected ${expectedScannerBlob}, got ${actualScannerBlob})`);
}

const notice = fs.readFileSync(noticePath, 'utf8');
for (const required of [
  '@zxing/browser',
  '@zxing/library',
  'Apache License 2.0',
  'https://github.com/zxing-js/browser',
  'https://www.apache.org/licenses/LICENSE-2.0',
]) {
  if (!notice.includes(required)) {
    fail(`third-party notice is missing required attribution/license marker: ${required}`);
  }
}

if (!process.exitCode) {
  console.log(`PASS: vendored third-party integrity boundary verified (${actualScannerBlob})`);
}
