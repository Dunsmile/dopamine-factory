#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function fail(message) {
  console.error(`[service-template-guard] ${message}`);
  process.exit(1);
}

function pass(message) {
  console.log(`[PASS] ${message}`);
}

function readUtf8(relPath) {
  const abs = path.join(ROOT, relPath);
  if (!fs.existsSync(abs)) fail(`missing file: ${relPath}`);
  return fs.readFileSync(abs, 'utf8');
}

function assertSingleOccurrence(text, token, label) {
  const count = (text.match(new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
  if (count !== 1) fail(`${label} must contain '${token}' exactly once (found ${count})`);
}

function assertShellAndLegacyFrames() {
  const shellPages = ['balance-game', 'name-compatibility', 'wealth-dna-test'];
  const legacyPages = ['daily-fortune', 'tarot-reading', 'rich-face', 'market-sentiment'];

  for (const serviceId of shellPages) {
    const html = readUtf8(`fe/public/dunsmile/${serviceId}/index.html`);
    if (!html.includes('class="svc-shell ')) fail(`${serviceId} missing svc-shell wrapper`);
  }

  for (const serviceId of legacyPages) {
    const html = readUtf8(`fe/public/dunsmile/${serviceId}/index.html`);
    if (!html.includes('dp-service-frame')) fail(`${serviceId} missing dp-service-frame wrapper`);
  }

  pass('service frame wrappers verified');
}

function assertResultOnlyCarouselForInteractiveServices() {
  const sourceConfigs = [
    { id: 'balance-game', content: 'fe/src/pages/dunsmile/balance-game/content.html', resultId: 'resultCard' },
    { id: 'name-compatibility', content: 'fe/src/pages/dunsmile/name-compatibility/content.html', resultId: 'resultCard' },
    { id: 'wealth-dna-test', content: 'fe/src/pages/dunsmile/wealth-dna-test/content.html', resultId: 'wealthResultCard' },
  ];

  for (const cfg of sourceConfigs) {
    const src = readUtf8(cfg.content);
    assertSingleOccurrence(src, '{{RELATED_CAROUSEL}}', `${cfg.id} source`);

    const resultSectionRe = new RegExp(`<section[^>]*id="${cfg.resultId}"[\\s\\S]*\\{\\{RELATED_CAROUSEL\\}\\}[\\s\\S]*<\\/section>`, 'i');
    if (!resultSectionRe.test(src)) {
      fail(`${cfg.id} source must place {{RELATED_CAROUSEL}} inside result section (#${cfg.resultId})`);
    }

    const built = readUtf8(`fe/public/dunsmile/${cfg.id}/index.html`);
    const firstRelated = built.indexOf('svc-related-section');
    const resultStart = built.indexOf(`id="${cfg.resultId}"`);
    if (resultStart < 0 || firstRelated < 0) {
      fail(`${cfg.id} built output missing result section or related carousel`);
    }
    if (firstRelated < resultStart) {
      fail(`${cfg.id} built output shows carousel before result section`);
    }
  }

  pass('result-only carousel policy verified');
}

function assertNoAdPlaceholderText() {
  const targetFiles = [
    'fe/src/pages/dunsmile/balance-game/content.html',
    'fe/src/pages/dunsmile/name-compatibility/content.html',
    'fe/src/pages/dunsmile/wealth-dna-test/content.html',
    'fe/public/dunsmile/balance-game/index.html',
    'fe/public/dunsmile/name-compatibility/index.html',
    'fe/public/dunsmile/wealth-dna-test/index.html',
  ];
  const bannedPatterns = [
    /ad\s*slot/i,
    /광고\s*영역/i,
    /광고가\s*들어갈/i,
    /ad\s*placeholder/i,
    /광고\s*placeholder/i,
  ];

  for (const file of targetFiles) {
    const text = readUtf8(file);
    for (const pattern of bannedPatterns) {
      if (pattern.test(text)) fail(`${file} contains banned placeholder ad text: ${pattern}`);
    }
  }

  pass('ad placeholder text guard verified');
}

function assertLegacyResultCarouselCount() {
  const legacyBodies = [
    'fe/src/pages/dunsmile/daily-fortune/body.html',
    'fe/src/pages/dunsmile/tarot-reading/body.html',
    'fe/src/pages/dunsmile/rich-face/body.html',
  ];

  for (const file of legacyBodies) {
    const text = readUtf8(file);
    assertSingleOccurrence(text, '{{RELATED_CAROUSEL}}', file);
  }

  pass('legacy result carousel marker count verified');
}

function assertLegacyPresetSignatures() {
  const cases = [
    {
      file: 'fe/src/pages/dunsmile/daily-fortune/body.html',
      mustContain: ['svc-hero-cta-amber', 'startFortune()', 'svc-result-hero-amber'],
    },
    {
      file: 'fe/src/pages/dunsmile/tarot-reading/body.html',
      mustContain: ['svc-hero-cta-purple', 'startReading()', 'svc-result-hero-purple'],
    },
    {
      file: 'fe/src/pages/dunsmile/rich-face/body.html',
      mustContain: ['svc-hero-cta-purple', 'startAnalysis()', 'svc-result-hero-purple'],
    },
  ];

  for (const { file, mustContain } of cases) {
    const text = readUtf8(file);
    for (const token of mustContain) {
      if (!text.includes(token)) {
        fail(`${file} missing preset signature token '${token}'`);
      }
    }
  }

  pass('legacy preset signatures verified');
}

function main() {
  assertShellAndLegacyFrames();
  assertResultOnlyCarouselForInteractiveServices();
  assertNoAdPlaceholderText();
  assertLegacyResultCarouselCount();
  assertLegacyPresetSignatures();
  pass('all template guards passed');
}

main();
