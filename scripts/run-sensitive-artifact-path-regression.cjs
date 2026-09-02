const { execFileSync } = require('child_process');

const tracked = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean);

const failures = [];

const prohibited = [
  { re: /(^|\/)\.env(?:\..+)?$/i, reason: 'environment file' },
  { re: /(^|\/)\.dev\.vars(?:\..+)?$/i, reason: 'runtime secret-variable file' },
  { re: /(^|\/)(?:credentials|service-account|service_account|secrets?)\.json$/i, reason: 'credential/secret JSON file' },
  { re: /\.(?:pem|key|p12|pfx|jks|keystore)$/i, reason: 'private key/certificate-store artifact' },
  { re: /\.(?:sqlite|sqlite3|db)$/i, reason: 'local database artifact' },
  { re: /\.(?:dump|sql)$/i, reason: 'database dump/export artifact' },
];

for (const path of tracked) {
  for (const rule of prohibited) {
    if (rule.re.test(path)) failures.push(`${path}: ${rule.reason}`);
  }
}

if (failures.length) {
  console.error('Sensitive artifact path regression FAILED');
  console.error('Tracked repository paths must not contain selected credential, secret-state, key-store, or database artifacts without an explicit reviewed architecture change.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Sensitive artifact path regression PASSED');
console.log(`Verified ${tracked.length} tracked path(s) contain no selected credential, secret-state, key-store, local-database, or database-dump artifact names.`);
