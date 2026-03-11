#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'docs', 'reports', 'phaseb-kpi-input.json');

const template = {
  generatedAt: new Date().toISOString(),
  notes: 'Fill baseline/current from GA4 or GTM export before running npm run report:phaseb-kpi',
  services: [
    { serviceId: 'daily-fortune', baseline: { cardClick: 0, start: 0, complete: 0 }, current: { cardClick: 0, start: 0, complete: 0 } },
    { serviceId: 'tarot-reading', baseline: { cardClick: 0, start: 0, complete: 0 }, current: { cardClick: 0, start: 0, complete: 0 } },
    { serviceId: 'balance-game', baseline: { cardClick: 0, start: 0, complete: 0 }, current: { cardClick: 0, start: 0, complete: 0 } },
  ],
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
if (!fs.existsSync(OUT_PATH)) {
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
  console.log(`[phaseb-kpi] created template: ${path.relative(ROOT, OUT_PATH)}`);
} else {
  console.log(`[phaseb-kpi] already exists: ${path.relative(ROOT, OUT_PATH)}`);
}
