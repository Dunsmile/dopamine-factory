#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_HEALTH_PATH = path.join(ROOT, 'docs', 'reports', 'ops-input-health.json');
const TARGET_METRICS_PATH = path.join(ROOT, 'docs', 'reports', 'target-metrics.json');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'input-fix-commands.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'input-fix-commands.md');

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function main() {
  const health = readJson(INPUT_HEALTH_PATH, { issues: [] });
  const targets = readJson(TARGET_METRICS_PATH, null);
  const issues = Array.isArray(health.issues) ? health.issues : [];

  const commands = [];

  const needPhaseD = issues.some((x) => String(x).startsWith('phase-d '));
  if (needPhaseD) {
    const lead = targets?.phaseDTargets?.leadTimeMinutesP50 ?? 15;
    const fail = targets?.phaseDTargets?.buildDeployFailureRatePercent ?? 0;
    const month = targets?.phaseDTargets?.monthlyReleaseCount ?? 8;
    commands.push(`npm run set:phase-d-ops -- --leadTime ${lead} --failureRate ${fail} --monthlyRelease ${month}`);
  }

  const needAstroPilotExecutedInfo = issues.some((x) => String(x).startsWith('astro-pilot executed=true'));
  if (needAstroPilotExecutedInfo) {
    commands.push(
      'npm run set:astro-pilot-exec -- --executed true --service astro-pilot-sample --route /astro-pilot/sample --deployedAt 2026-02-21T00:00:00Z'
    );
  }

  const needAstroPilotInput = issues.some((x) => String(x).startsWith('astro-pilot-input'));
  if (needAstroPilotInput) {
    commands.push(
      'npm run set:astro-pilot-input -- --productivity 20 --seoRegression false --opsComplexityIncrease false --notes "pilot measured"'
    );
  }

  const needPhaseB = issues.some((x) => String(x).startsWith('phaseb '));
  if (needPhaseB) {
    const list = Array.isArray(targets?.phaseBTargets) ? targets.phaseBTargets : [];
    if (list.length) {
      list.forEach((t) => {
        commands.push(
          `npm run set:phaseb-kpi -- --service ${t.serviceId} --b-card ${t.baseline.cardClick} --b-start ${t.baseline.start} --b-complete ${t.baseline.complete} --c-card ${t.targetMinimum.cardClick} --c-start ${t.targetMinimum.start} --c-complete ${t.targetMinimum.complete}`
        );
      });
    }
  }

  commands.push('npm run ops:sync');

  const report = {
    generatedAt: new Date().toISOString(),
    issueCount: issues.length,
    commands,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Input Fix Commands');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Issues: ${report.issueCount}`);
  lines.push('');
  lines.push('## Commands');
  commands.forEach((cmd) => lines.push(`- \`${cmd}\``));
  lines.push('');
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');

  console.log(`[input-fix] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[input-fix] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
