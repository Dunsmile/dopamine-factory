#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'fe', 'src', 'data', 'services.manifest.json');
const KPI_PATH = path.join(ROOT, 'docs', 'reports', 'kpi-baseline.json');
const CADENCE_PATH = path.join(ROOT, 'docs', 'reports', 'release-cadence-report.json');
const ASTRO_GATE_PATH = path.join(ROOT, 'docs', 'reports', 'astro-go-no-go.json');
const PHASEB_KPI_PATH = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-report.json');
const PHASED_OPS_PATH = path.join(ROOT, 'docs', 'reports', 'phase-d-ops-report.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'weekly-ops-report.md');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'weekly-ops-report.json');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function daysDiffFromToday(yyyyMMdd) {
  const value = new Date(`${yyyyMMdd}T00:00:00Z`);
  if (Number.isNaN(value.getTime())) return null;
  const now = new Date();
  const utcNow = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  const utcValue = Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate());
  return Math.floor((utcNow - utcValue) / (1000 * 60 * 60 * 24));
}

function main() {
  const manifest = readJson(MANIFEST_PATH, { services: [] });
  const kpi = readJson(KPI_PATH, null);
  const cadence = readJson(CADENCE_PATH, null);
  const astroGate = readJson(ASTRO_GATE_PATH, null);
  const phaseBKpi = readJson(PHASEB_KPI_PATH, null);
  const phaseDOps = readJson(PHASED_OPS_PATH, null);
  const services = Array.isArray(manifest.services) ? manifest.services : [];

  const byStatus = services.reduce((acc, service) => {
    const key = service.status || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const byCategory = services.reduce((acc, service) => {
    const key = service.category || 'unknown';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const recentlyUpdated = services
    .filter((service) => typeof service.updatedAt === 'string')
    .map((service) => ({ id: service.id, updatedAt: service.updatedAt, daysAgo: daysDiffFromToday(service.updatedAt) }))
    .filter((service) => service.daysAgo != null && service.daysAgo <= 7)
    .sort((a, b) => a.daysAgo - b.daysAgo);

  const staleServices = services
    .filter((service) => typeof service.updatedAt === 'string')
    .map((service) => ({ id: service.id, updatedAt: service.updatedAt, daysAgo: daysDiffFromToday(service.updatedAt) }))
    .filter((service) => service.daysAgo != null && service.daysAgo > 30)
    .sort((a, b) => b.daysAgo - a.daysAgo);

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      services: services.length,
      status: byStatus,
      category: byCategory,
    },
    freshness: {
      recentlyUpdated,
      staleServices,
    },
    kpi: kpi
      ? {
          passCount: kpi.summary.passCount,
          total: kpi.summary.total,
          avgLcp: Math.round(kpi.summary.avgLcp),
          avgCls: Number(kpi.summary.avgCls.toFixed(3)),
        }
      : null,
    cadence: cadence
      ? {
          status: cadence.status,
          countLast7Days: cadence.countLast7Days,
          recommendation: cadence.recommendation,
        }
      : null,
    astroGate: astroGate
      ? {
          decision: astroGate.decision,
          reason: astroGate.reason,
        }
      : null,
    phaseBKpi: phaseBKpi
      ? {
          decision: phaseBKpi.decision,
          passCount: phaseBKpi.summary.passCount,
          totalGoals: phaseBKpi.summary.totalGoals,
          avgCtrDeltaPercent: phaseBKpi.summary.avgCtrDeltaPercent,
          avgStartDeltaPercent: phaseBKpi.summary.avgStartDeltaPercent,
          avgCompletionRateDeltaPercent: phaseBKpi.summary.avgCompletionRateDeltaPercent,
        }
      : null,
    phaseDOps: phaseDOps
      ? {
          decision: phaseDOps.decision,
          passCount: phaseDOps.summary.passCount,
          totalGoals: phaseDOps.summary.totalGoals,
          leadTimeMinutesP50: phaseDOps.source.leadTimeMinutesP50,
          buildDeployFailureRatePercent: phaseDOps.source.buildDeployFailureRatePercent,
          monthlyReleaseCount: phaseDOps.source.monthlyReleaseCount,
        }
      : null,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Weekly Ops Report');
  lines.push('');
  lines.push(`- Generated At: ${summary.generatedAt}`);
  lines.push(`- Total Services: ${summary.totals.services}`);
  lines.push('');
  lines.push('## Status');
  Object.entries(byStatus).forEach(([status, count]) => lines.push(`- ${status}: ${count}`));
  lines.push('');
  lines.push('## Category');
  Object.entries(byCategory).forEach(([category, count]) => lines.push(`- ${category}: ${count}`));
  lines.push('');
  lines.push('## KPI Snapshot');
  if (summary.kpi) {
    lines.push(`- Pass: ${summary.kpi.passCount}/${summary.kpi.total}`);
    lines.push(`- Avg LCP: ${summary.kpi.avgLcp}ms`);
    lines.push(`- Avg CLS: ${summary.kpi.avgCls}`);
  } else {
    lines.push('- KPI baseline not found. Run `npm run measure:kpi` first.');
  }
  lines.push('');
  lines.push('## Release Cadence (7d)');
  if (summary.cadence) {
    lines.push(`- Status: ${summary.cadence.status}`);
    lines.push(`- Count: ${summary.cadence.countLast7Days}/week`);
    lines.push(`- Note: ${summary.cadence.recommendation}`);
  } else {
    lines.push('- Cadence report not found. Run `npm run report:cadence` first.');
  }
  lines.push('');
  lines.push('## Astro Gate');
  if (summary.astroGate) {
    lines.push(`- Decision: ${summary.astroGate.decision}`);
    lines.push(`- Reason: ${summary.astroGate.reason}`);
  } else {
    lines.push('- Astro gate report not found. Run `npm run check:astro-gate` first.');
  }
  lines.push('');
  lines.push('## Phase B KPI');
  if (summary.phaseBKpi) {
    lines.push(`- Decision: ${summary.phaseBKpi.decision}`);
    lines.push(`- Goals: ${summary.phaseBKpi.passCount}/${summary.phaseBKpi.totalGoals}`);
    lines.push(`- Avg CTR Delta: ${summary.phaseBKpi.avgCtrDeltaPercent ?? 'n/a'}%`);
    lines.push(`- Avg Start Delta: ${summary.phaseBKpi.avgStartDeltaPercent ?? 'n/a'}%`);
    lines.push(`- Avg Completion Delta: ${summary.phaseBKpi.avgCompletionRateDeltaPercent ?? 'n/a'}%p`);
  } else {
    lines.push('- Phase B KPI report not found. Run `npm run init:phaseb-kpi` then `npm run report:phaseb-kpi`.');
  }
  lines.push('');
  lines.push('## Phase D Ops');
  if (summary.phaseDOps) {
    const leadTimeText = summary.phaseDOps.leadTimeMinutesP50 == null ? 'n/a' : `${summary.phaseDOps.leadTimeMinutesP50}m`;
    const failureText =
      summary.phaseDOps.buildDeployFailureRatePercent == null ? 'n/a' : `${summary.phaseDOps.buildDeployFailureRatePercent}%`;
    lines.push(`- Decision: ${summary.phaseDOps.decision}`);
    lines.push(`- Goals: ${summary.phaseDOps.passCount}/${summary.phaseDOps.totalGoals}`);
    lines.push(`- Lead Time P50: ${leadTimeText}`);
    lines.push(`- Build/Deploy Failure: ${failureText}`);
    lines.push(`- Monthly Releases: ${summary.phaseDOps.monthlyReleaseCount ?? 'n/a'}`);
  } else {
    lines.push('- Phase D ops report not found. Run `npm run init:phase-d-ops` then `npm run report:phase-d-ops`.');
  }
  lines.push('');
  lines.push('## Updated <= 7 days');
  if (!recentlyUpdated.length) lines.push('- none');
  recentlyUpdated.forEach((item) => lines.push(`- ${item.id} (${item.updatedAt}, ${item.daysAgo}d ago)`));
  lines.push('');
  lines.push('## Stale > 30 days');
  if (!staleServices.length) lines.push('- none');
  staleServices.forEach((item) => lines.push(`- ${item.id} (${item.updatedAt}, ${item.daysAgo}d ago)`));
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[weekly-ops] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[weekly-ops] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
