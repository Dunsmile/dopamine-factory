#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'reports', 'release-log.json');

function fail(message) {
  console.error(`[release:add] ${message}`);
  process.exit(1);
}

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
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

function isDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime());
}

function main() {
  const args = parseArgs(process.argv.slice(2));

  const date = args.date;
  const serviceId = args.service || args.serviceId;
  const type = args.type || 'new_service';
  const status = args.status || 'done';
  const note = args.note ? String(args.note) : undefined;

  if (!date || !isDate(date)) fail('`--date YYYY-MM-DD` is required.');
  if (!serviceId) fail('`--service <service-id>` is required.');
  if (!type) fail('`--type <type>` is required.');
  if (!status) fail('`--status <status>` is required.');

  const log = readJson(LOG_PATH, { entries: [] });
  const entries = Array.isArray(log.entries) ? log.entries : [];
  const nextEntry = { date, serviceId, type, status };
  if (note) nextEntry.note = note;

  const existingIndex = entries.findIndex(
    (entry) => entry.date === date && entry.serviceId === serviceId && entry.type === type
  );

  if (existingIndex >= 0) {
    entries[existingIndex] = { ...entries[existingIndex], ...nextEntry };
    console.log(`[release:add] updated entry: ${date} ${serviceId} ${type}`);
  } else {
    entries.push(nextEntry);
    console.log(`[release:add] added entry: ${date} ${serviceId} ${type}`);
  }

  entries.sort((a, b) => a.date.localeCompare(b.date) || a.serviceId.localeCompare(b.serviceId));

  fs.mkdirSync(path.dirname(LOG_PATH), { recursive: true });
  fs.writeFileSync(LOG_PATH, `${JSON.stringify({ entries }, null, 2)}\n`, 'utf8');
  console.log(`[release:add] log: ${path.relative(ROOT, LOG_PATH)}`);
}

main();
