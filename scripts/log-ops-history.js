#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'reports', 'scaling-checklist-status.json');
const READINESS_PATH = path.join(ROOT, 'docs', 'reports', 'ops-readiness-report.json');
const PHASEB_PATH = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-report.json');
const PHASED_PATH = path.join(ROOT, 'docs', 'reports', 'phase-d-ops-report.json');
const HISTORY_PATH = path.join(ROOT, 'docs', 'reports', 'ops-history.json');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const checklist = readJson(CHECKLIST_PATH);
  const readiness = readJson(READINESS_PATH);
  const phaseb = readJson(PHASEB_PATH);
  const phased = readJson(PHASED_PATH);

  if (!checklist || !checklist.totals) {
    console.error('[ops-history] missing checklist report. run `npm run report:checklist` first.');
    process.exit(1);
  }

  const history = readJson(HISTORY_PATH, { entries: [] });
  const entries = Array.isArray(history.entries) ? history.entries : [];

  const snapshot = {
    ts: new Date().toISOString(),
    checklist: {
      completionRate: checklist.totals.completionRate,
      completed: checklist.totals.completed,
      total: checklist.totals.total,
      pending: checklist.totals.pending,
    },
    readiness: readiness?.status ?? null,
    phaseB: phaseb?.decision ?? null,
    phaseD: phased?.decision ?? null,
  };

  entries.push(snapshot);
  const capped = entries.slice(-120);

  fs.writeFileSync(HISTORY_PATH, `${JSON.stringify({ entries: capped }, null, 2)}\n`, 'utf8');
  console.log(`[ops-history] appended snapshot (${snapshot.checklist.completed}/${snapshot.checklist.total})`);
  console.log(`[ops-history] file: ${path.relative(ROOT, HISTORY_PATH)}`);
}

main();
