'use strict';

const { execFileSync } = require('node:child_process');

const output = execFileSync('git', ['ls-files', '*.js', '*.cjs'], {
  encoding: 'utf8',
});

const files = output
  .split(/\r?\n/)
  .map((file) => file.trim())
  .filter(Boolean);

if (files.length === 0) {
  throw new Error('JavaScript syntax regression found no tracked .js or .cjs files.');
}

const failures = [];

for (const file of files) {
  try {
    execFileSync(process.execPath, ['--check', file], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch (error) {
    failures.push({
      file,
      stdout: error.stdout || '',
      stderr: error.stderr || '',
    });
  }
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`Syntax check failed: ${failure.file}`);
    if (failure.stdout) console.error(failure.stdout.trim());
    if (failure.stderr) console.error(failure.stderr.trim());
  }
  process.exit(1);
}

console.log(`JavaScript syntax regression passed for ${files.length} tracked file(s).`);
