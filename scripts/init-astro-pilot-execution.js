#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT_PATH = path.join(ROOT, 'docs', 'reports', 'astro-pilot-execution.json');

const template = {
  generatedAt: new Date().toISOString(),
  executed: false,
  serviceId: '',
  routePath: '',
  deployedAt: '',
  notes: 'If Astro gate is GO and a pilot is deployed, set executed=true and fill serviceId/routePath/deployedAt.',
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
if (!fs.existsSync(OUT_PATH)) {
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(template, null, 2)}\n`, 'utf8');
  console.log(`[astro-pilot] created template: ${path.relative(ROOT, OUT_PATH)}`);
} else {
  console.log(`[astro-pilot] already exists: ${path.relative(ROOT, OUT_PATH)}`);
}
