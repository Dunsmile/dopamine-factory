#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'reports', 'phaseb-kpi-input.json');

function fail(message) {
  console.error(`[phaseb-input:update] ${message}`);
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
  if (!fs.existsSync(INPUT_PATH)) fail('missing phaseb input. run `npm run init:phaseb-kpi` first.');
  const json = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  if (!Array.isArray(json.services)) fail('invalid phaseb input format');

  const args = parseArgs(process.argv.slice(2));
  const serviceId = args.service;
  if (!serviceId) {
    fail(
      'usage: npm run set:phaseb-kpi -- --service daily-fortune --b-card 100 --b-start 80 --b-complete 40 --c-card 120 --c-start 95 --c-complete 55'
    );
  }

  const item = json.services.find((s) => s.serviceId === serviceId);
  if (!item) fail(`service not found in phaseb input: ${serviceId}`);
  item.baseline = item.baseline || {};
  item.current = item.current || {};

  const map = [
    ['b-card', 'baseline', 'cardClick'],
    ['b-start', 'baseline', 'start'],
    ['b-complete', 'baseline', 'complete'],
    ['c-card', 'current', 'cardClick'],
    ['c-start', 'current', 'start'],
    ['c-complete', 'current', 'complete'],
  ];

  map.forEach(([arg, group, key]) => {
    if (args[arg] !== undefined) item[group][key] = toNumber(arg, args[arg]);
  });

  json.generatedAt = new Date().toISOString();
  fs.writeFileSync(INPUT_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[phaseb-input:update] updated: ${serviceId}`);
  console.log(`[phaseb-input:update] file: ${path.relative(ROOT, INPUT_PATH)}`);
}

main();
