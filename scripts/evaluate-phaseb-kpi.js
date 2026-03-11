#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-input.json');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-report.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-report.md');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function pct(base, current) {
  if (!Number.isFinite(base) || base <= 0) return null;
  return ((current - base) / base) * 100;
}

function rate(num, den) {
  if (!Number.isFinite(den) || den <= 0) return null;
  return (num / den) * 100;
}

function round(value, n = 1) {
  if (value == null || Number.isNaN(value)) return null;
  const p = 10 ** n;
  return Math.round(value * p) / p;
}

function main() {
  const input = readJson(INPUT_PATH, null);
  if (!input || !Array.isArray(input.services)) {
    console.error('[phaseb-kpi] missing input. run `npm run init:phaseb-kpi` first.');
    process.exit(1);
  }

  const perService = input.services.map((item) => {
    const b = item.baseline || {};
    const c = item.current || {};
    const baselineCompletionRate = rate(Number(b.complete || 0), Number(b.start || 0));
    const currentCompletionRate = rate(Number(c.complete || 0), Number(c.start || 0));
    return {
      serviceId: item.serviceId || 'unknown',
      deltas: {
        ctrDeltaPercent: round(pct(Number(b.cardClick || 0), Number(c.cardClick || 0))),
        startDeltaPercent: round(pct(Number(b.start || 0), Number(c.start || 0))),
        completionRateDeltaPercent: round(
          baselineCompletionRate == null || currentCompletionRate == null
            ? null
            : currentCompletionRate - baselineCompletionRate
        ),
      },
      baseline: {
        cardClick: Number(b.cardClick || 0),
        start: Number(b.start || 0),
        complete: Number(b.complete || 0),
        completionRate: round(baselineCompletionRate),
      },
      current: {
        cardClick: Number(c.cardClick || 0),
        start: Number(c.start || 0),
        complete: Number(c.complete || 0),
        completionRate: round(currentCompletionRate),
      },
    };
  });

  const validCtr = perService.map((s) => s.deltas.ctrDeltaPercent).filter((v) => v != null);
  const validStart = perService.map((s) => s.deltas.startDeltaPercent).filter((v) => v != null);
  const validComplete = perService.map((s) => s.deltas.completionRateDeltaPercent).filter((v) => v != null);

  const avg = (arr) => (arr.length ? round(arr.reduce((a, b) => a + b, 0) / arr.length) : null);
  const avgCtr = avg(validCtr);
  const avgStart = avg(validStart);
  const avgCompletionRate = avg(validComplete);

  const goals = {
    ctrPlus10: avgCtr != null && avgCtr >= 10,
    startPlus10: avgStart != null && avgStart >= 10,
    top3CompletionPlus5: avgCompletionRate != null && avgCompletionRate >= 5,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    goals,
    summary: {
      avgCtrDeltaPercent: avgCtr,
      avgStartDeltaPercent: avgStart,
      avgCompletionRateDeltaPercent: avgCompletionRate,
      passCount: Object.values(goals).filter(Boolean).length,
      totalGoals: 3,
    },
    perService,
    decision: Object.values(goals).every(Boolean) ? 'PASS' : 'PENDING',
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Phase B KPI Report');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Decision: ${report.decision}`);
  lines.push(`- Goals: ${report.summary.passCount}/${report.summary.totalGoals} pass`);
  lines.push('');
  lines.push('## Goal Status');
  lines.push(`- CTR +10%: ${goals.ctrPlus10 ? 'PASS' : 'PENDING'} (avg ${report.summary.avgCtrDeltaPercent ?? 'n/a'}%)`);
  lines.push(`- Start Rate +10%: ${goals.startPlus10 ? 'PASS' : 'PENDING'} (avg ${report.summary.avgStartDeltaPercent ?? 'n/a'}%)`);
  lines.push(
    `- Top3 Completion +5%p: ${goals.top3CompletionPlus5 ? 'PASS' : 'PENDING'} (avg ${report.summary.avgCompletionRateDeltaPercent ?? 'n/a'}%p)`
  );
  lines.push('');
  lines.push('## Per Service');
  perService.forEach((s) => {
    lines.push(
      `- ${s.serviceId}: CTR ${s.deltas.ctrDeltaPercent ?? 'n/a'}%, Start ${s.deltas.startDeltaPercent ?? 'n/a'}%, Completion ${s.deltas.completionRateDeltaPercent ?? 'n/a'}%p`
    );
  });
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[phaseb-kpi] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[phaseb-kpi] report: ${path.relative(ROOT, OUT_MD)}`);
  console.log(`[phaseb-kpi] decision: ${report.decision}`);
}

main();
