#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'SCALING_EXECUTION_CHECKLIST.md');
const PHASEB_REPORT_PATH = path.join(ROOT, 'reports', 'phaseb-kpi-report.json');

function fail(message) {
  console.error(`[phaseb-sync] ${message}`);
  process.exit(1);
}

function loadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function setCheckbox(markdown, label, checked) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`^- \\[[ x]\\] ${escaped}$`, 'm');
  const replacement = `- [${checked ? 'x' : ' '}] ${label}`;
  if (!re.test(markdown)) return { markdown, changed: false, found: false };
  const next = markdown.replace(re, replacement);
  return { markdown: next, changed: next !== markdown, found: true };
}

function main() {
  if (!fs.existsSync(CHECKLIST_PATH)) fail('missing checklist file');

  const report = loadJson(PHASEB_REPORT_PATH);
  if (!report || !report.goals) {
    fail('missing phaseb report. run `npm run report:phaseb-kpi` first.');
  }

  let checklist = fs.readFileSync(CHECKLIST_PATH, 'utf8');
  const map = [
    { label: '카드 진입 CTR +10%', key: 'ctrPlus10' },
    { label: '시작률 +10%', key: 'startPlus10' },
    { label: '상위 3개 서비스 완료율 +5%', key: 'top3CompletionPlus5' },
  ];

  const result = [];
  map.forEach((item) => {
    const desired = Boolean(report.goals[item.key]);
    const changed = setCheckbox(checklist, item.label, desired);
    if (!changed.found) fail(`target checkbox not found: ${item.label}`);
    checklist = changed.markdown;
    result.push({ label: item.label, checked: desired, changed: changed.changed });
  });

  fs.writeFileSync(CHECKLIST_PATH, checklist, 'utf8');
  console.log('[phaseb-sync] checklist updated');
  result.forEach((row) => {
    console.log(`[phaseb-sync] ${row.checked ? '[x]' : '[ ]'} ${row.label}${row.changed ? ' (changed)' : ''}`);
  });
}

main();
