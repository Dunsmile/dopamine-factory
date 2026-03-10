#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const BATCH_PATH = path.join(ROOT, 'reports', 'ops-metrics-batch.json');
const PHASEB_PATH = path.join(ROOT, 'reports', 'phaseb-kpi-input.json');
const PHASED_PATH = path.join(ROOT, 'reports', 'phase-d-ops-input.json');
const ASTRO_EXEC_PATH = path.join(ROOT, 'reports', 'astro-pilot-execution.json');

function fail(message) {
  console.error(`[ops-metrics-batch] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith('--')) continue;
    const key = token.slice(2);
    const value = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : 'true';
    args[key] = value;
    if (value !== 'true') i += 1;
  }
  return args;
}

function runSync() {
  const result = spawnSync('npm', ['run', 'ops:sync'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const shouldSync = String(args.sync || 'true').toLowerCase() !== 'false';

  const batch = readJson(BATCH_PATH);
  if (!batch) fail('missing batch file. run `npm run init:ops-batch` first.');

  const phaseB = readJson(PHASEB_PATH);
  if (!phaseB || !Array.isArray(phaseB.services)) fail('missing phaseb input. run `npm run init:phaseb-kpi` first.');
  const map = new Map((batch.phaseB?.services || []).map((s) => [s.serviceId, s]));
  phaseB.services = phaseB.services.map((service) => {
    const payload = map.get(service.serviceId);
    if (!payload) return service;
    return {
      ...service,
      baseline: payload.baseline || service.baseline,
      current: payload.current || service.current,
    };
  });
  phaseB.generatedAt = new Date().toISOString();
  fs.writeFileSync(PHASEB_PATH, `${JSON.stringify(phaseB, null, 2)}\n`, 'utf8');

  const phaseD = readJson(PHASED_PATH);
  if (!phaseD) fail('missing phase-d input. run `npm run init:phase-d-ops` first.');
  phaseD.weekly = phaseD.weekly || {};
  phaseD.monthly = phaseD.monthly || {};
  phaseD.weekly.leadTimeMinutesP50 = batch.phaseD?.leadTimeMinutesP50 ?? phaseD.weekly.leadTimeMinutesP50;
  phaseD.weekly.buildDeployFailureRatePercent =
    batch.phaseD?.buildDeployFailureRatePercent ?? phaseD.weekly.buildDeployFailureRatePercent;
  phaseD.monthly.releaseCount = batch.phaseD?.monthlyReleaseCount ?? phaseD.monthly.releaseCount;
  phaseD.generatedAt = new Date().toISOString();
  fs.writeFileSync(PHASED_PATH, `${JSON.stringify(phaseD, null, 2)}\n`, 'utf8');

  const astroExec = readJson(ASTRO_EXEC_PATH);
  if (!astroExec) fail('missing astro pilot execution file. run `npm run init:astro-pilot-exec` first.');
  const astroPayload = batch.astroPilotExecution || {};
  astroExec.executed = astroPayload.executed ?? astroExec.executed;
  astroExec.serviceId = astroPayload.serviceId ?? astroExec.serviceId;
  astroExec.routePath = astroPayload.routePath ?? astroExec.routePath;
  astroExec.deployedAt = astroPayload.deployedAt ?? astroExec.deployedAt;
  astroExec.generatedAt = new Date().toISOString();
  fs.writeFileSync(ASTRO_EXEC_PATH, `${JSON.stringify(astroExec, null, 2)}\n`, 'utf8');

  console.log('[ops-metrics-batch] inputs updated');
  if (shouldSync) runSync();
}

main();
