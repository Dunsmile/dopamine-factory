#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TARGET = path.join(ROOT, 'docs', 'reports', 'astro-pilot-input.json');

const TEMPLATE = {
  productivityDeltaPercent: 0,
  seoAdSafetyRegression: false,
  operationalComplexityIncrease: true,
  notes: 'Fill this with real pilot data before running npm run check:astro-gate',
};

function main() {
  fs.mkdirSync(path.dirname(TARGET), { recursive: true });
  if (fs.existsSync(TARGET)) {
    console.log(`[astro-pilot] already exists: ${path.relative(ROOT, TARGET)}`);
    return;
  }
  fs.writeFileSync(TARGET, `${JSON.stringify(TEMPLATE, null, 2)}\n`, 'utf8');
  console.log(`[astro-pilot] created: ${path.relative(ROOT, TARGET)}`);
}

main();
