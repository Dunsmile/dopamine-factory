#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'SCALING_EXECUTION_CHECKLIST.md');
const REPORT_PATH = path.join(ROOT, 'docs', 'reports', 'phase-d-ops-report.json');

function fail(message) {
  console.error(`[phase-d-sync] ${message}`);
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
  if (!fs.existsSync(REPORT_PATH)) fail('missing phase-d report. run `npm run report:phase-d-ops` first.');

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const goals = report.goals || {};
  let checklist = fs.readFileSync(CHECKLIST_PATH, 'utf8');

  const targets = [
    { label: '주당 1~2개 신규 서비스 배포 루틴 정착', checked: Boolean(goals.weeklyCadenceHealthy) },
    { label: '신규 서비스 게시 리드타임 15분 이내', checked: Boolean(goals.leadTimeUnder15m) },
    { label: '생성/배포 실패율 0%', checked: Boolean(goals.failureRateZero) },
    { label: '월 8개 이상 안정 배포', checked: Boolean(goals.monthlyRelease8plus) },
  ];

  for (const item of targets) {
    const updated = setCheckbox(checklist, item.label, item.checked);
    if (!updated.found) fail(`target checkbox not found: ${item.label}`);
    checklist = updated.markdown;
    console.log(`[phase-d-sync] [${item.checked ? 'x' : ' '}] ${item.label}${updated.changed ? ' (changed)' : ''}`);
  }

  fs.writeFileSync(CHECKLIST_PATH, checklist, 'utf8');
  console.log('[phase-d-sync] checklist updated');
}

main();
