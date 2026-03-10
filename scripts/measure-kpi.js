#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const REPORT_DIR = path.join(ROOT, 'reports');
const BASE_URL = process.env.KPI_BASE_URL || 'http://127.0.0.1:8080';

const SERVICES = [
  { id: 'hoxy-number', path: '/dunsmile/hoxy-number/' },
  { id: 'rich-face', path: '/dunsmile/rich-face/' },
  { id: 'daily-fortune', path: '/dunsmile/daily-fortune/' },
  { id: 'balance-game', path: '/dunsmile/balance-game/' },
  { id: 'name-compatibility', path: '/dunsmile/name-compatibility/' },
  { id: 'tarot-reading', path: '/dunsmile/tarot-reading/' },
  { id: 'market-sentiment', path: '/dunsmile/market-sentiment/' },
];

const THRESHOLD = {
  lcp: 2500,
  cls: 0.1,
  consoleErrors: 0,
};

const NON_BLOCKING_ERROR_PATTERNS = [
  'Failed to load resource',
  'blocked by CORS policy',
  'net::ERR_FAILED',
  '로또 API 호출 실패',
];

function toFixedOrDash(value, digits = 2) {
  if (typeof value !== 'number' || Number.isNaN(value)) return '-';
  return value.toFixed(digits);
}

function computePass(metric) {
  return (
    metric.lcp <= THRESHOLD.lcp &&
    metric.cls <= THRESHOLD.cls &&
    metric.consoleErrors <= THRESHOLD.consoleErrors
  );
}

async function measureOne(browser, service) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    userAgent:
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
  });
  const page = await context.newPage();

  const rawErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') rawErrors.push(msg.text());
  });
  page.on('pageerror', () => {
    rawErrors.push('PAGEERROR');
  });

  await page.addInitScript(() => {
    window.__kpi = { cls: 0, lcp: 0 };

    if ('PerformanceObserver' in window) {
      try {
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) window.__kpi.cls += entry.value || 0;
          }
        });
        clsObserver.observe({ type: 'layout-shift', buffered: true });
      } catch (_error) {
        // ignore
      }

      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const last = entries[entries.length - 1];
          if (last) window.__kpi.lcp = last.startTime || 0;
        });
        lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch (_error) {
        // ignore
      }
    }
  });

  const url = `${BASE_URL}${service.path}`;
  const started = Date.now();
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(1500);

  const data = await page.evaluate(() => {
    const fcpEntry = performance.getEntriesByName('first-contentful-paint')[0];
    const navEntry = performance.getEntriesByType('navigation')[0];
    return {
      cls: Number(window.__kpi && window.__kpi.cls ? window.__kpi.cls : 0),
      lcp: Number(window.__kpi && window.__kpi.lcp ? window.__kpi.lcp : 0),
      fcp: fcpEntry ? Number(fcpEntry.startTime || 0) : 0,
      domComplete: navEntry ? Number(navEntry.domComplete || 0) : 0,
    };
  });

  await context.close();

  const blockingErrors = rawErrors.filter((message) => {
    return !NON_BLOCKING_ERROR_PATTERNS.some((pattern) => String(message).includes(pattern));
  });

  return {
    id: service.id,
    path: service.path,
    lcp: data.lcp,
    cls: data.cls,
    fcp: data.fcp,
    domComplete: data.domComplete,
    consoleErrors: blockingErrors.length,
    rawConsoleErrors: rawErrors.length,
    blockingErrorMessages: blockingErrors,
    measureMs: Date.now() - started,
  };
}

function buildMarkdown(result) {
  const lines = [];
  lines.push('# KPI Baseline Report');
  lines.push('');
  lines.push(`- Base URL: ${BASE_URL}`);
  lines.push(`- Generated At: ${result.generatedAt}`);
  lines.push(`- Target: mobile 390x844`);
  lines.push('');
  lines.push('| Service | LCP(ms) | CLS | FCP(ms) | DOM Complete(ms) | Console Errors | Pass |');
  lines.push('|---|---:|---:|---:|---:|---:|:---:|');
  for (const metric of result.metrics) {
    lines.push(
      `| ${metric.id} | ${toFixedOrDash(metric.lcp, 0)} | ${toFixedOrDash(metric.cls, 3)} | ${toFixedOrDash(
        metric.fcp,
        0
      )} | ${toFixedOrDash(metric.domComplete, 0)} | ${metric.consoleErrors} | ${metric.pass ? 'Y' : 'N'} |`
    );
  }
  lines.push('');
  lines.push('## Threshold');
  lines.push(`- LCP < ${THRESHOLD.lcp}ms`);
  lines.push(`- CLS < ${THRESHOLD.cls}`);
  lines.push(`- Console Errors = ${THRESHOLD.consoleErrors}`);
  lines.push('');
  lines.push(
    `## Summary\n- Pass: ${result.summary.passCount}/${result.summary.total}\n- Avg LCP: ${toFixedOrDash(
      result.summary.avgLcp,
      0
    )}ms\n- Avg CLS: ${toFixedOrDash(result.summary.avgCls, 3)}`
  );
  lines.push('');
  return lines.join('\n');
}

async function main() {
  const browser = await chromium.launch();
  const metrics = [];
  try {
    for (const service of SERVICES) {
      const metric = await measureOne(browser, service);
      metric.pass = computePass(metric);
      metrics.push(metric);
      process.stdout.write(
        `[measure-kpi] ${metric.id}: LCP=${toFixedOrDash(metric.lcp, 0)}ms CLS=${toFixedOrDash(
          metric.cls,
          3
        )} ERR=${metric.consoleErrors} ${metric.pass ? 'PASS' : 'FAIL'}\n`
      );
    }
  } finally {
    await browser.close();
  }

  const passCount = metrics.filter((m) => m.pass).length;
  const avgLcp = metrics.reduce((sum, m) => sum + (m.lcp || 0), 0) / metrics.length;
  const avgCls = metrics.reduce((sum, m) => sum + (m.cls || 0), 0) / metrics.length;

  const result = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    threshold: THRESHOLD,
    metrics,
    summary: {
      total: metrics.length,
      passCount,
      avgLcp,
      avgCls,
    },
  };

  fs.mkdirSync(REPORT_DIR, { recursive: true });
  const jsonPath = path.join(REPORT_DIR, 'kpi-baseline.json');
  const mdPath = path.join(REPORT_DIR, 'kpi-baseline.md');
  fs.writeFileSync(jsonPath, `${JSON.stringify(result, null, 2)}\n`, 'utf8');
  fs.writeFileSync(mdPath, buildMarkdown(result), 'utf8');

  console.log(`[measure-kpi] report: ${path.relative(ROOT, jsonPath)}`);
  console.log(`[measure-kpi] report: ${path.relative(ROOT, mdPath)}`);
}

main().catch((error) => {
  console.error(`[measure-kpi] ${error.message || String(error)}`);
  process.exit(1);
});
