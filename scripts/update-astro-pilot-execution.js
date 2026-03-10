#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'reports', 'astro-pilot-execution.json');

function fail(message) {
  console.error(`[astro-pilot:update] ${message}`);
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

function main() {
  if (!fs.existsSync(INPUT_PATH)) fail('missing astro pilot execution file. run `npm run init:astro-pilot-exec` first.');
  const json = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'));
  const args = parseArgs(process.argv.slice(2));

  if (args.executed !== undefined) json.executed = String(args.executed).toLowerCase() === 'true';
  if (args.service !== undefined) json.serviceId = String(args.service);
  if (args.route !== undefined) json.routePath = String(args.route);
  if (args.deployedAt !== undefined) json.deployedAt = String(args.deployedAt);
  if (args.notes !== undefined) json.notes = String(args.notes);

  json.generatedAt = new Date().toISOString();
  fs.writeFileSync(INPUT_PATH, `${JSON.stringify(json, null, 2)}\n`, 'utf8');
  console.log(`[astro-pilot:update] file: ${path.relative(ROOT, INPUT_PATH)}`);
}

main();
