#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'SCALING_EXECUTION_CHECKLIST.md');
const ASTRO_REPORT_PATH = path.join(ROOT, 'reports', 'astro-go-no-go.json');

function fail(message) {
  console.error(`[phasec-sync] ${message}`);
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
  if (!fs.existsSync(ASTRO_REPORT_PATH)) fail('missing astro gate report. run `npm run check:astro-gate` first.');

  const astro = JSON.parse(fs.readFileSync(ASTRO_REPORT_PATH, 'utf8'));
  const checks = astro.checks || {};

  let checklist = fs.readFileSync(CHECKLIST_PATH, 'utf8');
  const targets = [
    { label: '개발 생산성 +20% 이상', checked: Boolean(checks.productivity) },
    { label: '성능 지표 동등 이상', checked: Boolean(checks.perf) },
    { label: 'SEO/광고 안정성 저하 없음', checked: Boolean(checks.seoAdSafety) },
    { label: '운영 복잡도 증가 없음', checked: Boolean(checks.opsComplexity) },
  ];

  for (const item of targets) {
    const updated = setCheckbox(checklist, item.label, item.checked);
    if (!updated.found) fail(`target checkbox not found: ${item.label}`);
    checklist = updated.markdown;
    console.log(`[phasec-sync] [${item.checked ? 'x' : ' '}] ${item.label}${updated.changed ? ' (changed)' : ''}`);
  }

  fs.writeFileSync(CHECKLIST_PATH, checklist, 'utf8');
  console.log('[phasec-sync] checklist updated');
}

main();
