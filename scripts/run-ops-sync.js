#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd, args) {
  const result = spawnSync(cmd, args, {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  run('npm', ['run', 'report:cadence']);
  run('npm', ['run', 'check:astro-gate']);
  run('npm', ['run', 'init:astro-pilot-exec']);
  run('npm', ['run', 'report:ops-input-health']);

  run('npm', ['run', 'init:phaseb-kpi']);
  run('npm', ['run', 'report:phaseb-kpi']);
  run('npm', ['run', 'sync:phaseb-checklist']);

  run('npm', ['run', 'sync:phasec-checklist']);
  run('npm', ['run', 'sync:astro-pilot-checklist']);

  run('npm', ['run', 'init:phase-d-ops']);
  run('npm', ['run', 'report:phase-d-ops']);
  run('npm', ['run', 'sync:phase-d-checklist']);

  run('npm', ['run', 'report:weekly']);
  run('npm', ['run', 'report:checklist']);
  run('npm', ['run', 'report:next-actions']);
  run('npm', ['run', 'report:ops-readiness']);
  run('npm', ['run', 'report:target-metrics']);
  run('npm', ['run', 'report:input-fix']);
  run('npm', ['run', 'report:ops-guide']);
  run('npm', ['run', 'log:ops-history']);
  run('npm', ['run', 'report:ops-trend']);
  run('npm', ['run', 'report:ops-dashboard']);

  console.log('[ops-sync] all docs/reports/checklist sync completed');
}

main();
