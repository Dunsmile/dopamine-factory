#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PHASEB_INPUT = path.join(ROOT, 'reports', 'phaseb-kpi-input.json');
const PHASED_INPUT = path.join(ROOT, 'reports', 'phase-d-ops-input.json');
const ASTRO_EXEC_INPUT = path.join(ROOT, 'reports', 'astro-pilot-execution.json');
const ASTRO_INPUT = path.join(ROOT, 'reports', 'astro-pilot-input.json');
const OUT_JSON = path.join(ROOT, 'reports', 'ops-input-health.json');
const OUT_MD = path.join(ROOT, 'reports', 'ops-input-health.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function isFiniteNumber(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

function main() {
  const phaseb = readJson(PHASEB_INPUT);
  const phased = readJson(PHASED_INPUT);
  const astroExec = readJson(ASTRO_EXEC_INPUT);
  const astroInput = readJson(ASTRO_INPUT);

  const issues = [];

  if (!phaseb || !Array.isArray(phaseb.services)) {
    issues.push('phaseb-kpi-input.json missing or invalid.');
  } else {
    phaseb.services.forEach((svc, idx) => {
      const base = svc?.baseline || {};
      const cur = svc?.current || {};
      const sid = svc?.serviceId || `index:${idx}`;
      if (!isFiniteNumber(base.cardClick)) issues.push(`phaseb baseline.cardClick missing: ${sid}`);
      if (!isFiniteNumber(base.start)) issues.push(`phaseb baseline.start missing: ${sid}`);
      if (!isFiniteNumber(base.complete)) issues.push(`phaseb baseline.complete missing: ${sid}`);
      if (!isFiniteNumber(cur.cardClick)) issues.push(`phaseb current.cardClick missing: ${sid}`);
      if (!isFiniteNumber(cur.start)) issues.push(`phaseb current.start missing: ${sid}`);
      if (!isFiniteNumber(cur.complete)) issues.push(`phaseb current.complete missing: ${sid}`);

      const allZero =
        Number(base.cardClick || 0) === 0 &&
        Number(base.start || 0) === 0 &&
        Number(base.complete || 0) === 0 &&
        Number(cur.cardClick || 0) === 0 &&
        Number(cur.start || 0) === 0 &&
        Number(cur.complete || 0) === 0;
      if (allZero) issues.push(`phaseb placeholder values detected: ${sid}`);
    });
  }

  if (!phased) {
    issues.push('phase-d-ops-input.json missing.');
  } else {
    const w = phased.weekly || {};
    const m = phased.monthly || {};
    if (!isFiniteNumber(w.leadTimeMinutesP50)) issues.push('phase-d weekly.leadTimeMinutesP50 missing');
    if (!isFiniteNumber(w.buildDeployFailureRatePercent)) issues.push('phase-d weekly.buildDeployFailureRatePercent missing');
    if (!isFiniteNumber(m.releaseCount)) issues.push('phase-d monthly.releaseCount missing');
  }

  if (!astroExec) {
    issues.push('astro-pilot-execution.json missing.');
  } else if (astroExec.executed === true) {
    if (!astroExec.serviceId) issues.push('astro-pilot executed=true but serviceId missing');
    if (!astroExec.routePath) issues.push('astro-pilot executed=true but routePath missing');
  }

  if (!astroInput) {
    issues.push('astro-pilot-input.json missing.');
  } else {
    const isPlaceholder =
      Number(astroInput.productivityDeltaPercent) === 0 &&
      astroInput.seoAdSafetyRegression === false &&
      astroInput.operationalComplexityIncrease === true;
    if (isPlaceholder) {
      issues.push('astro-pilot-input placeholder values detected');
    }
  }

  const report = {
    generatedAt: new Date().toISOString(),
    status: issues.length ? 'WARN' : 'PASS',
    issueCount: issues.length,
    issues,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Ops Input Health');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Status: ${report.status}`);
  lines.push(`- Issue Count: ${report.issueCount}`);
  lines.push('');
  lines.push('## Issues');
  if (!issues.length) lines.push('- none');
  issues.forEach((item) => lines.push(`- ${item}`));
  lines.push('');
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');

  console.log(`[ops-input-health] status: ${report.status}`);
  console.log(`[ops-input-health] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[ops-input-health] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
