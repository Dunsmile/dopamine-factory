#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'reports', 'scaling-checklist-status.json');
const READINESS_PATH = path.join(ROOT, 'reports', 'ops-readiness-report.json');
const INPUT_HEALTH_PATH = path.join(ROOT, 'reports', 'ops-input-health.json');
const NEXT_ACTIONS_PATH = path.join(ROOT, 'reports', 'next-actions.json');
const TREND_PATH = path.join(ROOT, 'reports', 'ops-trend.json');
const OUT_MD = path.join(ROOT, 'reports', 'ops-dashboard.md');
const OUT_JSON = path.join(ROOT, 'reports', 'ops-dashboard.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const checklist = readJson(CHECKLIST_PATH);
  const readiness = readJson(READINESS_PATH);
  const inputHealth = readJson(INPUT_HEALTH_PATH);
  const nextActions = readJson(NEXT_ACTIONS_PATH);
  const trend = readJson(TREND_PATH);

  const model = {
    generatedAt: new Date().toISOString(),
    status: {
      readiness: readiness?.status ?? 'UNKNOWN',
      checklistCompletion: checklist?.totals?.completionRate ?? null,
      checklistPending: checklist?.totals?.pending ?? null,
      inputHealth: inputHealth?.status ?? 'UNKNOWN',
      trendDelta: trend?.deltaFromPrev?.completionRate ?? null,
    },
    topActions: (nextActions?.actions || []).slice(0, 5),
    blockers: readiness?.blockers || [],
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(model, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Ops Dashboard');
  lines.push('');
  lines.push(`- Generated At: ${model.generatedAt}`);
  lines.push(`- Readiness: ${model.status.readiness}`);
  lines.push(`- Checklist: ${model.status.checklistCompletion ?? 'n/a'}% (pending ${model.status.checklistPending ?? 'n/a'})`);
  lines.push(`- Input Health: ${model.status.inputHealth}`);
  lines.push(`- Trend Delta: ${model.status.trendDelta == null ? 'n/a' : `${model.status.trendDelta}%p`}`);
  lines.push('');
  lines.push('## Blockers');
  if (!model.blockers.length) lines.push('- none');
  model.blockers.forEach((b) => lines.push(`- ${b}`));
  lines.push('');
  lines.push('## Top Actions');
  if (!model.topActions.length) lines.push('- none');
  model.topActions.forEach((a) => {
    lines.push(`- [${a.section}] ${a.item}`);
    lines.push(`  run: ${a.run}`);
    lines.push(`  input: ${a.input}`);
  });
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[ops-dashboard] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[ops-dashboard] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
