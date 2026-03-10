#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FILES = {
  checklist: path.join(ROOT, 'reports', 'scaling-checklist-status.json'),
  readiness: path.join(ROOT, 'reports', 'ops-readiness-report.json'),
  inputHealth: path.join(ROOT, 'reports', 'ops-input-health.json'),
  nextActions: path.join(ROOT, 'reports', 'next-actions.json'),
  dashboard: path.join(ROOT, 'reports', 'ops-dashboard.json'),
};

function parseArgs(argv) {
  return { strict: argv.includes('--strict') };
}

function readJson(filePath, key) {
  if (!fs.existsSync(filePath)) return { key, error: `missing: ${path.relative(ROOT, filePath)}` };
  try {
    return { key, data: JSON.parse(fs.readFileSync(filePath, 'utf8')) };
  } catch (error) {
    return { key, error: `invalid json: ${path.relative(ROOT, filePath)} (${error.message})` };
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const loaded = Object.entries(FILES).map(([key, file]) => readJson(file, key));
  const failures = loaded.filter((x) => x.error).map((x) => x.error);
  const map = Object.fromEntries(loaded.filter((x) => x.data).map((x) => [x.key, x.data]));

  if (map.checklist) {
    const pendingByCount = Number(map.checklist?.totals?.pending ?? -1);
    const pendingByList = Array.isArray(map.checklist?.pendingItems) ? map.checklist.pendingItems.length : -1;
    if (pendingByCount !== pendingByList) {
      failures.push(`checklist mismatch: totals.pending=${pendingByCount}, pendingItems.length=${pendingByList}`);
    }
  }

  if (map.readiness) {
    const status = map.readiness.status;
    const blockers = Array.isArray(map.readiness.blockers) ? map.readiness.blockers.length : 0;
    if ((status === 'READY' && blockers > 0) || (status !== 'READY' && blockers === 0)) {
      failures.push(`readiness mismatch: status=${status}, blockers=${blockers}`);
    }
  }

  if (map.dashboard && map.readiness) {
    const a = map.dashboard?.status?.readiness ?? 'UNKNOWN';
    const b = map.readiness?.status ?? 'UNKNOWN';
    if (a !== b) failures.push(`dashboard mismatch: dashboard.status.readiness=${a}, ops-readiness.status=${b}`);
  }

  if (map.nextActions && map.checklist) {
    const actionCount = Array.isArray(map.nextActions.actions) ? map.nextActions.actions.length : -1;
    const pending = Number(map.checklist?.totals?.pending ?? -1);
    if (actionCount !== pending) {
      failures.push(`next-actions mismatch: actions=${actionCount}, checklist pending=${pending}`);
    }
  }

  const warnings = [];
  if (map.inputHealth && map.inputHealth.status !== 'PASS') {
    warnings.push(`ops-input-health is ${map.inputHealth.status}`);
  }

  console.log('[ops-doctor] summary');
  console.log(`- files checked: ${loaded.length}`);
  console.log(`- failures: ${failures.length}`);
  console.log(`- warnings: ${warnings.length}`);

  warnings.forEach((w) => console.log(`[ops-doctor][WARN] ${w}`));
  failures.forEach((f) => console.log(`[ops-doctor][FAIL] ${f}`));

  if (args.strict && (failures.length > 0 || warnings.length > 0)) {
    process.exit(1);
  }
  if (failures.length > 0) process.exit(1);
}

main();
