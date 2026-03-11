#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'docs', 'reports', 'phase-d-ops-input.json');

const template = {
  generatedAt: new Date().toISOString(),
  notes: 'Fill with weekly/monthly operational metrics before running npm run report:phase-d-ops',
  weekly: {
    leadTimeMinutesP50: null,
    buildDeployFailureRatePercent: null,
  },
  monthly: {
    releaseCount: null,
  },
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
if (!fs.existsSync(OUT_PATH)) {
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
  console.log(`[phase-d-ops] created template: ${path.relative(ROOT, OUT_PATH)}`);
} else {
  console.log(`[phase-d-ops] already exists: ${path.relative(ROOT, OUT_PATH)}`);
}
