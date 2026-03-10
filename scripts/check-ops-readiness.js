#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PHASEB_PATH = path.join(ROOT, 'reports', 'phaseb-kpi-report.json');
const PHASED_PATH = path.join(ROOT, 'reports', 'phase-d-ops-report.json');
const ASTRO_PATH = path.join(ROOT, 'reports', 'astro-go-no-go.json');
const CHECKLIST_PATH = path.join(ROOT, 'reports', 'scaling-checklist-status.json');
const INPUT_HEALTH_PATH = path.join(ROOT, 'reports', 'ops-input-health.json');
const OUT_JSON = path.join(ROOT, 'reports', 'ops-readiness-report.json');
const OUT_MD = path.join(ROOT, 'reports', 'ops-readiness-report.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const phaseb = readJson(PHASEB_PATH);
  const phased = readJson(PHASED_PATH);
  const astro = readJson(ASTRO_PATH);
  const checklist = readJson(CHECKLIST_PATH);
  const inputHealth = readJson(INPUT_HEALTH_PATH);

  const blockers = [];
  if (!phaseb || phaseb.decision !== 'PASS') {
    blockers.push('Phase B KPI goals are not fully passed.');
  }
  if (!phased || phased.decision !== 'PASS') {
    blockers.push('Phase D ops goals are not fully passed.');
  }
  if (!astro || astro.decision !== 'GO') {
    blockers.push('Astro gate decision is not GO (expected for now if conservative mode).');
  }
  if (!checklist || !checklist.totals || checklist.totals.pending > 0) {
    blockers.push(`Checklist has pending items: ${checklist?.totals?.pending ?? 'unknown'}.`);
  }
  if (!inputHealth || inputHealth.status !== 'PASS') {
    blockers.push(`Ops input health is not PASS (issues: ${inputHealth?.issueCount ?? 'unknown'}).`);
  }

  const report = {
    generatedAt: new Date().toISOString(),
    status: blockers.length === 0 ? 'READY' : 'PENDING',
    summary: {
      checklistCompletionRate: checklist?.totals?.completionRate ?? null,
      checklistPending: checklist?.totals?.pending ?? null,
      phaseBDecision: phaseb?.decision ?? null,
      phaseDDecision: phased?.decision ?? null,
      astroDecision: astro?.decision ?? null,
      opsInputHealth: inputHealth?.status ?? null,
    },
    blockers,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Ops Readiness Report');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Status: ${report.status}`);
  lines.push(`- Checklist Completion: ${report.summary.checklistCompletionRate ?? 'n/a'}%`);
  lines.push(`- Checklist Pending: ${report.summary.checklistPending ?? 'n/a'}`);
  lines.push(`- Phase B: ${report.summary.phaseBDecision ?? 'n/a'}`);
  lines.push(`- Phase D: ${report.summary.phaseDDecision ?? 'n/a'}`);
  lines.push(`- Astro Gate: ${report.summary.astroDecision ?? 'n/a'}`);
  lines.push('');
  lines.push('## Blockers');
  if (!blockers.length) lines.push('- none');
  blockers.forEach((item) => lines.push(`- ${item}`));
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[ops-readiness] status: ${report.status}`);
  console.log(`[ops-readiness] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[ops-readiness] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
