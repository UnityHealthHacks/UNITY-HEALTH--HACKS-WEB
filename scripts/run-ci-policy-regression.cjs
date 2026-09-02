const fs = require('fs');

const workflowPath = '.github/workflows/uhh-tier-one-regression.yml';
const text = fs.readFileSync(workflowPath, 'utf8');

const failures = [];
const requireMatch = (condition, message) => {
  if (!condition) failures.push(message);
};

requireMatch(/^permissions:\s*\n\s+contents:\s*read\s*$/m.test(text), 'workflow must keep top-level contents: read permissions');
requireMatch(!/^\s*(contents|actions|checks|deployments|issues|packages|pull-requests|repository-projects|security-events|statuses):\s*write\s*$/m.test(text), 'workflow must not grant write permissions');
requireMatch(/timeout-minutes:\s*5\b/.test(text), 'source-regression job must retain the five-minute timeout');
requireMatch(/persist-credentials:\s*false\b/.test(text), 'checkout must retain persist-credentials: false');
requireMatch(/concurrency:[\s\S]*?cancel-in-progress:\s*true\b/.test(text), 'workflow must retain concurrency cancellation');

const uses = [...text.matchAll(/^\s*uses:\s*([^\s#]+).*$/gm)].map((m) => m[1]);
requireMatch(uses.length > 0, 'workflow must contain pinned GitHub Actions dependencies');
for (const action of uses) {
  const at = action.lastIndexOf('@');
  const ref = at >= 0 ? action.slice(at + 1) : '';
  requireMatch(/^[0-9a-f]{40}$/i.test(ref), `action dependency must use an immutable 40-character SHA: ${action}`);
}

requireMatch(/run:\s*node scripts\/run-ci-policy-regression\.cjs\b/.test(text), 'workflow must execute this CI policy regression');

if (failures.length) {
  console.error('CI policy regression FAILED');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('CI policy regression PASSED');
console.log(`Verified ${uses.length} immutable action dependency reference(s), read-only permissions, checkout credential non-persistence, timeout, concurrency cancellation, and self-enforcement.`);
