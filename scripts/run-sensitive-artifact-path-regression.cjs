const { execFileSync } = require('child_process');
const fs = require('fs');

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

const requiredIgnoreRules = [
  '.env', '.env.*', '!.env.example', '.dev.vars', '.dev.vars.*',
  'credentials.json', 'service-account.json', 'service_account.json', 'secret.json', 'secrets.json',
  '*.pem', '*.key', '*.p12', '*.pfx', '*.jks', '*.keystore',
  '*.sqlite', '*.sqlite3', '*.db', '*.dump', '*.sql',
];

if (!fs.existsSync('.gitignore')) {
  failures.push('.gitignore: missing sensitive local-artifact ignore boundary');
} else {
  const ignoreRules = new Set(
    fs.readFileSync('.gitignore', 'utf8')
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#'))
  );
  for (const rule of requiredIgnoreRules) {
    if (!ignoreRules.has(rule)) failures.push(`.gitignore: missing required rule ${rule}`);
  }
}

if (failures.length) {
  console.error('Sensitive artifact path regression FAILED');
  console.error('Tracked repository paths and the local ignore boundary must protect selected credential, secret-state, key-store, and database artifacts unless an explicit reviewed architecture change revises this policy.');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Sensitive artifact path regression PASSED');
console.log(`Verified ${tracked.length} tracked path(s) contain no selected sensitive artifact names and .gitignore preserves the required local-artifact boundary.`);
