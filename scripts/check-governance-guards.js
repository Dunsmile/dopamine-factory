#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PR_TEMPLATE_PATH = path.join(ROOT, '.github', 'pull_request_template.md');
const DESIGN_LOG_PATH = path.join(ROOT, 'docs', 'DESIGN_CHANGE_LOG.md');
const ADSENSE_ROLLBACK_LOG_PATH = path.join(ROOT, 'docs', 'ADSENSE_INCIDENT_ROLLBACK_LOG.md');
const OUT_PATH = path.join(ROOT, 'docs', 'reports', 'governance-guards-report.json');

function read(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`missing file: ${path.relative(ROOT, filePath)}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function checkContains(content, pattern, label) {
  const ok = content.includes(pattern);
  return { label, ok, pattern };
}

function main() {
  const pr = read(PR_TEMPLATE_PATH);
  const designLog = read(DESIGN_LOG_PATH);
  const adsenseLog = read(ADSENSE_ROLLBACK_LOG_PATH);

  const checks = [
    checkContains(pr, '## Reuse Check (Required)', 'PR template reuse section'),
    checkContains(pr, 'Existing style token reused first', 'PR template token reuse checkbox'),
    checkContains(pr, 'If new token/component added, rationale is documented below', 'PR template rationale field'),
    checkContains(pr, '## AdSense Safety Check', 'PR template adsense safety section'),
    checkContains(designLog, '## Entry Template', 'Design change log template'),
    checkContains(designLog, '## Entries', 'Design change log entries section'),
    checkContains(adsenseLog, '## Immediate Rollback Rule', 'AdSense rollback rule section'),
    checkContains(adsenseLog, '## Entries', 'AdSense rollback entries section'),
  ];

  const failed = checks.filter((c) => !c.ok);
  const report = {
    generatedAt: new Date().toISOString(),
    pass: failed.length === 0,
    total: checks.length,
    passCount: checks.length - failed.length,
    checks,
  };

  fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
  fs.writeFileSync(OUT_PATH, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  console.log(`[governance] ${report.pass ? 'PASS' : 'FAIL'} ${report.passCount}/${report.total}`);
  console.log(`[governance] report: ${path.relative(ROOT, OUT_PATH)}`);
  if (!report.pass) {
    failed.forEach((item) => console.error(`[governance] missing: ${item.label}`));
    process.exit(1);
  }
}

main();
