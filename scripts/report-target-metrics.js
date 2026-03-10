#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PHASEB_INPUT = path.join(ROOT, 'reports', 'phaseb-kpi-input.json');
const PHASED_INPUT = path.join(ROOT, 'reports', 'phase-d-ops-input.json');
const OUT_JSON = path.join(ROOT, 'reports', 'target-metrics.json');
const OUT_MD = path.join(ROOT, 'reports', 'target-metrics.md');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function ceil(n) {
  return Math.ceil(Number(n || 0));
}

function main() {
  const phaseb = readJson(PHASEB_INPUT, { services: [] });
  const phased = readJson(PHASED_INPUT, {});
  const services = Array.isArray(phaseb.services) ? phaseb.services : [];

  const phaseBTargets = services.map((s) => {
    const b = s.baseline || {};
    const baselineCard = Number(b.cardClick || 0);
    const baselineStart = Number(b.start || 0);
    const baselineComplete = Number(b.complete || 0);
    const baselineCompletionRate = baselineStart > 0 ? (baselineComplete / baselineStart) * 100 : 0;

    const minCardForPlus10 = ceil(baselineCard * 1.1);
    const minStartForPlus10 = ceil(baselineStart * 1.1);
    const targetCompletionRate = baselineCompletionRate + 5;
    const minCompleteForPlus5pp = ceil((targetCompletionRate / 100) * minStartForPlus10);

    return {
      serviceId: s.serviceId,
      baseline: {
        cardClick: baselineCard,
        start: baselineStart,
        complete: baselineComplete,
        completionRate: Number(baselineCompletionRate.toFixed(1)),
      },
      targetMinimum: {
        cardClick: minCardForPlus10,
        start: minStartForPlus10,
        complete: minCompleteForPlus5pp,
        completionRate: Number(targetCompletionRate.toFixed(1)),
      },
    };
  });

  const phaseDTargets = {
    leadTimeMinutesP50: 15,
    buildDeployFailureRatePercent: 0,
    monthlyReleaseCount: 8,
    current: {
      leadTimeMinutesP50: phased?.weekly?.leadTimeMinutesP50 ?? null,
      buildDeployFailureRatePercent: phased?.weekly?.buildDeployFailureRatePercent ?? null,
      monthlyReleaseCount: phased?.monthly?.releaseCount ?? null,
    },
  };

  const report = {
    generatedAt: new Date().toISOString(),
    phaseBTargets,
    phaseDTargets,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Target Metrics');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push('');
  lines.push('## Phase B Minimum Targets');
  if (!phaseBTargets.length) lines.push('- none');
  phaseBTargets.forEach((t) => {
    lines.push(`- ${t.serviceId}`);
    lines.push(
      `  baseline: card ${t.baseline.cardClick}, start ${t.baseline.start}, complete ${t.baseline.complete} (${t.baseline.completionRate}%)`
    );
    lines.push(
      `  target >= card ${t.targetMinimum.cardClick}, start ${t.targetMinimum.start}, complete ${t.targetMinimum.complete} (${t.targetMinimum.completionRate}%)`
    );
  });
  lines.push('');
  lines.push('## Phase D Targets');
  lines.push(`- leadTimeMinutesP50 <= ${phaseDTargets.leadTimeMinutesP50} (current: ${phaseDTargets.current.leadTimeMinutesP50 ?? 'n/a'})`);
  lines.push(
    `- buildDeployFailureRatePercent == ${phaseDTargets.buildDeployFailureRatePercent} (current: ${phaseDTargets.current.buildDeployFailureRatePercent ?? 'n/a'})`
  );
  lines.push(`- monthlyReleaseCount >= ${phaseDTargets.monthlyReleaseCount} (current: ${phaseDTargets.current.monthlyReleaseCount ?? 'n/a'})`);
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[target-metrics] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[target-metrics] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
