#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const KPI_PATH = path.join(ROOT, 'reports', 'kpi-baseline.json');
const INPUT_PATH = path.join(ROOT, 'reports', 'astro-pilot-input.json');
const OUT_PATH = path.join(ROOT, 'reports', 'astro-go-no-go.json');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const kpi = readJson(KPI_PATH);
  const input = readJson(INPUT_PATH) || {
    productivityDeltaPercent: 0,
    seoAdSafetyRegression: false,
    operationalComplexityIncrease: true,
  };

  const checks = {
    productivity: Number(input.productivityDeltaPercent) >= 20,
    perf: Boolean(kpi && kpi.summary && kpi.summary.passCount === kpi.summary.total),
    seoAdSafety: input.seoAdSafetyRegression === false,
    opsComplexity: input.operationalComplexityIncrease === false,
  };

  const go = Object.values(checks).every(Boolean);
  const result = {
    generatedAt: new Date().toISOString(),
    checks,
    input,
    decision: go ? 'GO' : 'NO_GO',
    reason: go
      ? 'All gate conditions passed.'
      : 'At least one gate condition failed. Keep current SSG as primary.',
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(result, null, 2)}\n`, 'utf8');

  console.log(`[astro-gate] decision: ${result.decision}`);
  console.log(`[astro-gate] report: ${path.relative(ROOT, OUT_PATH)}`);
}

main();
