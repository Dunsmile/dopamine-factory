#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const HISTORY_PATH = path.join(ROOT, 'reports', 'ops-history.json');
const OUT_JSON = path.join(ROOT, 'reports', 'ops-trend.json');
const OUT_MD = path.join(ROOT, 'reports', 'ops-trend.md');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const history = readJson(HISTORY_PATH, { entries: [] });
  const entries = Array.isArray(history.entries) ? history.entries : [];
  const recent = entries.slice(-10);
  const latest = recent[recent.length - 1] || null;
  const prev = recent.length > 1 ? recent[recent.length - 2] : null;

  const completionDelta =
    latest && prev
      ? Number((latest.checklist.completionRate - prev.checklist.completionRate).toFixed(1))
      : null;

  const report = {
    generatedAt: new Date().toISOString(),
    sampleCount: recent.length,
    latest,
    deltaFromPrev: {
      completionRate: completionDelta,
    },
    recent,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Ops Trend');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Samples: ${report.sampleCount}`);
  if (latest) {
    lines.push(`- Latest Completion: ${latest.checklist.completionRate}% (${latest.checklist.completed}/${latest.checklist.total})`);
    lines.push(`- Latest Pending: ${latest.checklist.pending}`);
    lines.push(`- Latest Readiness: ${latest.readiness ?? 'n/a'}`);
    lines.push(`- Latest PhaseB/PhaseD: ${latest.phaseB ?? 'n/a'} / ${latest.phaseD ?? 'n/a'}`);
  }
  lines.push(`- Delta From Previous: ${completionDelta == null ? 'n/a' : `${completionDelta}%p`}`);
  lines.push('');
  lines.push('## Recent Snapshots');
  if (!recent.length) lines.push('- none');
  recent.forEach((entry) => {
    lines.push(
      `- ${entry.ts}: ${entry.checklist.completionRate}% (${entry.checklist.completed}/${entry.checklist.total}), pending ${entry.checklist.pending}, readiness ${entry.readiness ?? 'n/a'}`
    );
  });
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[ops-trend] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[ops-trend] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
