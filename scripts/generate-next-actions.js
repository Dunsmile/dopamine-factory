#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHECKLIST_REPORT_PATH = path.join(ROOT, 'docs', 'reports', 'scaling-checklist-status.json');
const OUT_JSON = path.join(ROOT, 'docs', 'reports', 'next-actions.json');
const OUT_MD = path.join(ROOT, 'docs', 'reports', 'next-actions.md');

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function mapAction(item) {
  const text = item.text;

  if (text.includes('CTR +10%') || text.includes('시작률 +10%') || text.includes('완료율 +5')) {
    return {
      owner: 'Growth',
      input: 'docs/reports/phaseb-kpi-input.json',
      run: 'npm run report:phaseb-kpi && npm run sync:phaseb-checklist',
      doneWhen: 'phaseb-kpi-report decision=PASS',
    };
  }

  if (text.includes('개발 생산성 +20%') || text.includes('운영 복잡도 증가 없음')) {
    return {
      owner: 'Platform',
      input: 'docs/reports/astro-pilot-input.json',
      run: 'npm run check:astro-gate && npm run sync:phasec-checklist',
      doneWhen: 'astro-go-no-go checks productivity=true and opsComplexity=true',
    };
  }

  if (text.includes('Go 시 신규 1개 서비스만 별도 경로 파일럿')) {
    return {
      owner: 'Platform',
      input: 'docs/reports/astro-pilot-execution.json',
      run: 'npm run sync:astro-pilot-checklist',
      doneWhen: 'astro gate GO + executed=true + serviceId/routePath filled',
    };
  }

  if (text.includes('리드타임 15분') || text.includes('실패율 0%') || text.includes('월 8개')) {
    return {
      owner: 'Ops',
      input: 'docs/reports/phase-d-ops-input.json',
      run: 'npm run report:phase-d-ops && npm run sync:phase-d-checklist',
      doneWhen: 'phase-d-ops-report goals all pass',
    };
  }

  return {
    owner: 'TBD',
    input: 'docs/SCALING_EXECUTION_CHECKLIST.md',
    run: 'npm run ops:sync',
    doneWhen: 'checkbox becomes checked by policy decision',
  };
}

function main() {
  const checklist = readJson(CHECKLIST_REPORT_PATH);
  if (!checklist || !Array.isArray(checklist.pendingItems)) {
    console.error('[next-actions] missing checklist report. run `npm run report:checklist` first.');
    process.exit(1);
  }

  const actions = checklist.pendingItems.map((item, index) => ({
    id: `A-${index + 1}`,
    section: item.section,
    item: item.text,
    ...mapAction(item),
  }));

  const report = {
    generatedAt: new Date().toISOString(),
    pendingCount: actions.length,
    actions,
  };

  fs.mkdirSync(path.dirname(OUT_JSON), { recursive: true });
  fs.writeFileSync(OUT_JSON, `${JSON.stringify(report, null, 2)}\n`, 'utf8');

  const lines = [];
  lines.push('# Next Actions');
  lines.push('');
  lines.push(`- Generated At: ${report.generatedAt}`);
  lines.push(`- Pending Items: ${report.pendingCount}`);
  lines.push('');
  lines.push('## Action List');
  if (!actions.length) lines.push('- none');
  actions.forEach((a) => {
    lines.push(`- ${a.id} [${a.section}] ${a.item}`);
    lines.push(`  owner: ${a.owner}`);
    lines.push(`  input: ${a.input}`);
    lines.push(`  run: ${a.run}`);
    lines.push(`  done when: ${a.doneWhen}`);
  });
  lines.push('');

  fs.writeFileSync(OUT_MD, `${lines.join('\n')}\n`, 'utf8');
  console.log(`[next-actions] report: ${path.relative(ROOT, OUT_JSON)}`);
  console.log(`[next-actions] report: ${path.relative(ROOT, OUT_MD)}`);
}

main();
