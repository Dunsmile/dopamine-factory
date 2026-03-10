#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LOG_PATH = path.join(ROOT, 'reports', 'release-log.json');
const OUT_PATH = path.join(ROOT, 'reports', 'release-cadence-report.json');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isWithinDays(dateStr, days) {
  const date = new Date(`${dateStr}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const utcDate = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  const diff = Math.floor((utcNow - utcDate) / (1000 * 60 * 60 * 24));
  return diff >= 0 && diff <= days;
}

function main() {
  const log = readJson(LOG_PATH, { entries: [] });
  const entries = Array.isArray(log.entries) ? log.entries : [];

  const weekly = entries.filter(
    (entry) =>
      entry.type === 'new_service' &&
      entry.status === 'done' &&
      typeof entry.date === 'string' &&
      isWithinDays(entry.date, 7)
  );

  const count = weekly.length;
  const status = count >= 1 && count <= 2 ? 'PASS' : count === 0 ? 'WARN' : 'WARN_OVER';

  const report = {
    generatedAt: new Date().toISOString(),
    rule: 'new_service done count in last 7 days should be 1~2',
    countLast7Days: count,
    status,
    recentEntries: weekly,
    recommendation:
      status === 'PASS'
        ? 'Cadence is healthy.'
        : status === 'WARN'
        ? 'No new service released this week. Target at least 1.'
        : 'More than 2 releases this week. Check QA capacity and rollback risk.',
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`[cadence] report: ${path.relative(ROOT, OUT_PATH)}`);
  console.log(`[cadence] status: ${status} (${count}/week)`);
}

main();
