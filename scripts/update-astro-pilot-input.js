#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'docs', 'reports', 'astro-pilot-input.json');

function fail(message) {
  console.error(`[astro-pilot-input:update] ${message}`);
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

function parseBool(name, value) {
  const v = String(value).toLowerCase();
  if (v === 'true') return true;
  if (v === 'false') return false;
  fail(`invalid boolean for --${name}: ${value}`);
}

function parseNumber(name, value) {
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`invalid number for --${name}: ${value}`);
  return n;
}

function main() {
  if (!fs.existsSync(TARGET)) {
    fail('missing input file. run `npm run init:astro-pilot` first.');
  }
  const json = JSON.parse(fs.readFileSync(TARGET, 'utf8'));
  const args = parseArgs(process.argv.slice(2));

  if (args.productivity !== undefined) {
    json.productivityDeltaPercent = parseNumber('productivity', args.productivity);
  }
  if (args.seoRegression !== undefined) {
    json.seoAdSafetyRegression = parseBool('seoRegression', args.seoRegression);
  }
  if (args.opsComplexityIncrease !== undefined) {
    json.operationalComplexityIncrease = parseBool('opsComplexityIncrease', args.opsComplexityIncrease);
  }
  if (args.notes !== undefined) {
    json.notes = String(args.notes);
  }

  fs.writeFileSync(TARGET, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[astro-pilot-input:update] file: ${path.relative(ROOT, TARGET)}`);
}

main();
