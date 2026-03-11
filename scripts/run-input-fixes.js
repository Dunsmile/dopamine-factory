#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const INPUT_FIX_PATH = path.join(ROOT, 'docs', 'reports', 'input-fix-commands.json');

function parseArgs(argv) {
  return {
    apply: argv.includes('--apply'),
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!fs.existsSync(INPUT_FIX_PATH)) {
    console.error('[input-fix-runner] missing report. run `npm run report:input-fix` first.');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(INPUT_FIX_PATH, 'utf8'));
  const commands = Array.isArray(report.commands) ? report.commands : [];
  if (!commands.length) {
    console.log('[input-fix-runner] no commands found.');
    return;
  }

  if (!args.apply) {
    console.log('[input-fix-runner] dry-run mode. use `npm run input-fix:apply` to execute.');
    commands.forEach((cmd, idx) => console.log(`${idx + 1}. ${cmd}`));
    return;
  }

  console.log(`[input-fix-runner] applying ${commands.length} commands...`);
  for (const cmd of commands) {
    const result = spawnSync(cmd, {
      cwd: ROOT,
      shell: true,
      stdio: 'inherit',
    });
    if (result.status !== 0) {
      console.error(`[input-fix-runner] failed: ${cmd}`);
      process.exit(result.status || 1);
    }
  }
  console.log('[input-fix-runner] all commands applied.');
}

main();
