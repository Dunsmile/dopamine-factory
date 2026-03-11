#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_PATH = path.join(ROOT, 'docs', 'SCALING_EXECUTION_CHECKLIST.md');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'scaling-checklist-status.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'scaling-checklist-status.md');

function parseChecklist(markdown) {
  const lines = markdown.split('\n');
  let currentSection = 'General';
  const items = [];

  for (const line of lines) {
    const sectionMatch = line.match(/^##\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
      continue;
    }

    const checkMatch = line.match(/^- \[([ x])\]\s+(.+)$/);
    if (!checkMatch) continue;

    const checked = checkMatch[1] === 'x';
    const text = checkMatch[2].trim();
    items.push({ section: currentSection, checked, text });
  }

  return items;
}

function summarize(items) {
  const total = items.length;
  const completed = items.filter((item) => item.checked).length;
  const pending = items.filter((item) => !item.checked);
  const bySection = items.reduce((acc, item) => {
    if (!acc[item.section]) acc[item.section] = { total: 0, completed: 0, pending: 0 };
    acc[item.section].total += 1;
    if (item.checked) acc[item.section].completed += 1;
    else acc[item.section].pending += 1;
    return acc;
  }, {});

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      total,
      completed,
      pending: total - completed,
      completionRate: total === 0 ? 0 : Number(((completed / total) * 100).toFixed(1)),
    },
    bySection,
    pendingItems: pending,
  };
}

function writeMarkdown(summary) {
  const lines = [];
  lines.push('# Scaling Checklist Status');
  lines.push('');
  lines.push(`- Generated At: ${summary.generatedAt}`);
  lines.push(`- Completion: ${summary.totals.completed}/${summary.totals.total} (${summary.totals.completionRate}%)`);
  lines.push(`- Pending: ${summary.totals.pending}`);
  lines.push('');
  lines.push('## Section Summary');
  Object.entries(summary.bySection).forEach(([section, value]) => {
    lines.push(`- ${section}: ${value.completed}/${value.total} done, ${value.pending} pending`);
  });
  lines.push('');
  lines.push('## Pending Items');
  if (!summary.pendingItems.length) lines.push('- none');
  summary.pendingItems.forEach((item) => lines.push(`- [${item.section}] ${item.text}`));
  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  if (!fs.existsSync(CHECKLIST_PATH)) {
    console.error(`[checklist] file not found: ${path.relative(ROOT, CHECKLIST_PATH)}`);
    process.exit(1);
  }

  const markdown = fs.readFileSync(CHECKLIST_PATH, 'utf8');
  const items = parseChecklist(markdown);
  const summary = summarize(items);

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
  fs.writeFileSync(OUT_MD, writeMarkdown(summary), 'utf8');

  console.log(`[checklist] completion: ${summary.totals.completed}/${summary.totals.total} (${summary.totals.completionRate}%)`);
  console.log(`[checklist] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[checklist] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
