#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'reports', 'phase-d-ops-input.json');

function fail(message) {
  console.error(`[phase-d-input:update] ${message}`);
  process.exit(1);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    args[key] = value;
    if (value !== 'true') i += 1;
  }
  return args;
}

function toNumber(name, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`invalid number for --${name}: ${value}`);
  return n;
}

function main() {
  if (!fs.existsSync(INPUT_PATH)) fail('missing phase-d input. run `npm run init:phase-d-ops` first.');
  const json = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  const args = parseArgs(process.argv.slice(2));

  json.weekly = json.weekly || {};
  json.monthly = json.monthly || {};

  if (args.leadTime !== undefined) json.weekly.leadTimeMinutesP50 = toNumber('leadTime', args.leadTime);
  if (args.failureRate !== undefined) json.weekly.buildDeployFailureRatePercent = toNumber('failureRate', args.failureRate);
  if (args.monthlyRelease !== undefined) json.monthly.releaseCount = toNumber('monthlyRelease', args.monthlyRelease);

  json.generatedAt = new Date().toISOString();
  fs.writeFileSync(INPUT_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[phase-d-input:update] file: ${path.relative(ROOT, INPUT_PATH)}`);
}

main();
