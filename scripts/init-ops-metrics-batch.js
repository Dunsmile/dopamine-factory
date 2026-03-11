#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'docs', 'reports', 'ops-metrics-batch.json');

const template = {
  generatedAt: new Date().toISOString(),
  phaseB: {
    services: [
      {
        serviceId: 'daily-fortune',
        baseline: { cardClick: 0, start: 0, complete: 0 },
        current: { cardClick: 0, start: 0, complete: 0 },
      },
      {
        serviceId: 'tarot-reading',
        baseline: { cardClick: 0, start: 0, complete: 0 },
        current: { cardClick: 0, start: 0, complete: 0 },
      },
      {
        serviceId: 'balance-game',
        baseline: { cardClick: 0, start: 0, complete: 0 },
        current: { cardClick: 0, start: 0, complete: 0 },
      },
    ],
  },
  phaseD: {
    leadTimeMinutesP50: null,
    buildDeployFailureRatePercent: null,
    monthlyReleaseCount: null,
  },
  astroPilotExecution: {
    executed: false,
    serviceId: '',
    routePath: '',
    deployedAt: '',
  },
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
if (!fs.existsSync(OUT_PATH)) {
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
  console.log(`[ops-metrics-batch] created: ${path.relative(ROOT, OUT_PATH)}`);
} else {
  console.log(`[ops-metrics-batch] already exists: ${path.relative(ROOT, OUT_PATH)}`);
}
