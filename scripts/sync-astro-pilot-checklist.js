#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'SCALING_EXECUTION_CHECKLIST.md');
const ASTRO_GATE_PATH = path.join(ROOT, 'docs', 'reports', 'astro-go-no-go.json');
const PILOT_PATH = path.join(ROOT, 'docs', 'reports', 'astro-pilot-execution.json');

function fail(message) {
  console.error(`[astro-pilot-sync] ${message}`);
  process.exit(1);
}

function setCheckbox(markdown, label, checked) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^- \\[[ x]\\] ${escaped}$`, 'm');
  if (!re.test(markdown)) return { markdown, found: false, changed: false };
  const replacement = `- [${checked ? 'x' : ' '}] ${label}`;
  const next = markdown.replace(re, replacement);
  return { markdown: next, found: true, changed: next !== markdown };
}

function main() {
  if (!fs.existsSync(CHECKLIST_PATH)) fail('missing checklist');
  if (!fs.existsSync(ASTRO_GATE_PATH)) fail('missing astro gate report. run `npm run check:astro-gate` first.');
  if (!fs.existsSync(PILOT_PATH)) fail('missing astro pilot execution template. run `npm run init:astro-pilot-exec` first.');

  const gate = JSON.parse(fs.readFileSync(ASTRO_GATE_PATH, 'utf8'));
  const pilot = JSON.parse(fs.readFileSync(PILOT_PATH, 'utf8'));
  const isPilotDone =
    gate.decision === 'GO' &&
    pilot.executed === true &&
    typeof pilot.serviceId === 'string' &&
    pilot.serviceId.trim().length > 0 &&
    typeof pilot.routePath === 'string' &&
    pilot.routePath.trim().length > 0;

  const label = 'Go 시 신규 1개 서비스만 별도 경로 파일럿';
  let checklist = fs.readFileSync(CHECKLIST_PATH, 'utf8');
  const updated = setCheckbox(checklist, label, isPilotDone);
  if (!updated.found) fail(`target checkbox not found: ${label}`);
  checklist = updated.markdown;
  fs.writeFileSync(CHECKLIST_PATH, checklist, 'utf8');

  console.log(`[astro-pilot-sync] [${isPilotDone ? 'x' : ' '}] ${label}${updated.changed ? ' (changed)' : ''}`);
  console.log('[astro-pilot-sync] checklist updated');
}

main();
