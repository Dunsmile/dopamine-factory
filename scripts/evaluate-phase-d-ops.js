#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_PATH = path.join(ROOT, 'reports', 'phase-d-ops-input.json');
const CADENCE_PATH = path.join(ROOT, 'reports', 'release-cadence-report.json');
const OUT_JSON = path.join(ROOT, 'reports', 'phase-d-ops-report.json');
const OUT_MD = path.join(ROOT, 'reports', 'phase-d-ops-report.md');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const input = readJson(INPUT_PATH, null);
  const cadence = readJson(CADENCE_PATH, null);
  if (!input) {
    console.error('[phase-d-ops] missing input. run `npm run init:phase-d-ops` first.');
    process.exit(1);
  }
  if (!cadence) {
    console.error('[phase-d-ops] missing cadence report. run `npm run report:cadence` first.');
    process.exit(1);
  }

  const toNumberOrNull = (value) => {
    if (value === null || value === undefined || value === '') return null;
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  };

  const leadTime = toNumberOrNull(input.weekly?.leadTimeMinutesP50);
  const failRate = toNumberOrNull(input.weekly?.buildDeployFailureRatePercent);
  const monthlyRelease = toNumberOrNull(input.monthly?.releaseCount);

  const goals = {
    weeklyCadenceHealthy: cadence.status === 'PASS',
    leadTimeUnder15m: leadTime !== null && leadTime <= 15,
    failureRateZero: failRate !== null && failRate === 0,
    monthlyRelease8plus: monthlyRelease !== null && monthlyRelease >= 8,
  };

  const report = {
    generatedAt: new Date().toISOString(),
    goals,
    source: {
      cadenceStatus: cadence.status,
      cadenceCountLast7Days: cadence.countLast7Days,
      leadTimeMinutesP50: leadTime,
      buildDeployFailureRatePercent: failRate,
      monthlyReleaseCount: monthlyRelease,
    },
    summary: {
      passCount: Object.values(goals).filter(Boolean).length,
      totalGoals: 4,
    },
    decision: Object.values(goals).every(Boolean) ? 'PASS' : 'PENDING',
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Phase D Ops Report');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Decision: ${report.decision}`);
  lines.push(`- Goals: ${report.summary.passCount}/${report.summary.totalGoals} pass`);
  lines.push('');
  lines.push('## Goal Status');
  const leadTimeText = report.source.leadTimeMinutesP50 == null ? 'n/a' : `${report.source.leadTimeMinutesP50}m`;
  const failureText =
    report.source.buildDeployFailureRatePercent == null ? 'n/a' : `${report.source.buildDeployFailureRatePercent}%`;
  const monthlyText = report.source.monthlyReleaseCount == null ? 'n/a' : String(report.source.monthlyReleaseCount);
  lines.push(`- Weekly cadence 1~2: ${goals.weeklyCadenceHealthy ? 'PASS' : 'PENDING'} (${cadence.status}, ${cadence.countLast7Days}/week)`);
  lines.push(`- Lead time <= 15m: ${goals.leadTimeUnder15m ? 'PASS' : 'PENDING'} (${leadTimeText})`);
  lines.push(`- Build/Deploy failure rate = 0%: ${goals.failureRateZero ? 'PASS' : 'PENDING'} (${failureText})`);
  lines.push(`- Monthly releases >= 8: ${goals.monthlyRelease8plus ? 'PASS' : 'PENDING'} (${monthlyText})`);
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[phase-d-ops] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[phase-d-ops] report: ${path.relative(ROOT, OUT_MD)}`);
  console.log(`[phase-d-ops] decision: ${report.decision}`);
}

main();
