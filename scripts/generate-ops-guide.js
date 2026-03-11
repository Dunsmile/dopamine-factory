#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const INPUT_HEALTH_PATH = path.join(ROOT, 'docs', 'reports', 'ops-input-health.json');
const NEXT_ACTIONS_PATH = path.join(ROOT, 'docs', 'reports', 'next-actions.json');
const TARGET_METRICS_PATH = path.join(ROOT, 'docs', 'reports', 'target-metrics.json');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'ops-guide.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'ops-guide.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function buildCommands(inputHealth, nextActions, targetMetrics) {
  const commands = [];

  const issues = inputHealth?.issues || [];
  const needPhaseB = issues.some((i) => i.startsWith('phaseb '));
  const needPhaseD = issues.some((i) => i.startsWith('phase-d '));

  if (needPhaseB) {
    const phaseBTargets = Array.isArray(targetMetrics?.phaseBTargets) ? targetMetrics.phaseBTargets : [];
    if (phaseBTargets.length) {
      phaseBTargets.forEach((target) => {
        commands.push(
          `npm run set:phaseb-kpi -- --service ${target.serviceId} --b-card ${target.baseline.cardClick} --b-start ${target.baseline.start} --b-complete ${target.baseline.complete} --c-card ${target.targetMinimum.cardClick} --c-start ${target.targetMinimum.start} --c-complete ${target.targetMinimum.complete}`
        );
      });
    } else {
      commands.push(
        'npm run set:phaseb-kpi -- --service daily-fortune --b-card 100 --b-start 80 --b-complete 40 --c-card 120 --c-start 95 --c-complete 55'
      );
    }
  }

  if (needPhaseD) {
    const t = targetMetrics?.phaseDTargets;
    const lead = t?.leadTimeMinutesP50 ?? 15;
    const fail = t?.buildDeployFailureRatePercent ?? 0;
    const month = t?.monthlyReleaseCount ?? 8;
    commands.push(`npm run set:phase-d-ops -- --leadTime ${lead} --failureRate ${fail} --monthlyRelease ${month}`);
  }

  const needAstroPilot = (nextActions?.actions || []).some((a) => String(a.item).includes('파일럿'));
  if (needAstroPilot) {
    commands.push('npm run set:astro-pilot-exec -- --executed true --service astro-pilot-sample --route /astro-pilot/sample --deployedAt 2026-02-21T00:00:00Z');
  }

  commands.push('npm run ops:sync');
  return commands;
}

function main() {
  const inputHealth = readJson(INPUT_HEALTH_PATH);
  const nextActions = readJson(NEXT_ACTIONS_PATH);
  const targetMetrics = readJson(TARGET_METRICS_PATH);
  if (!inputHealth || !nextActions) {
    console.error('[ops-guide] missing prerequisite reports. run `npm run ops:sync` first.');
    process.exit(1);
  }

  const commands = buildCommands(inputHealth, nextActions, targetMetrics);
  const report = {
    generatedAt: new Date().toISOString(),
    status: inputHealth.status === 'PASS' ? 'READY_FOR_SYNC' : 'NEEDS_INPUT',
    commands,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Ops Guide');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Status: ${report.status}`);
  lines.push('');
  lines.push('## Run Commands');
  commands.forEach((cmd) => lines.push(`- \`${cmd}\``));
  lines.push('');
  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');

  console.log(`[ops-guide] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[ops-guide] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
