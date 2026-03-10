#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const MANIFEST_PATH = path.join(ROOT, 'fe', 'src', 'data', 'services.manifest.json');
const SSG_PATH = path.join(ROOT, 'fe', 'src', 'ssg', 'static-pages.json');
const RELATED_PATH = path.join(ROOT, 'fe', 'src', 'data', 'related-services.json');
const SHELL_UI_PATH = path.join(ROOT, 'fe', 'src', 'data', 'shell-ui.json');
const SSG_COVERAGE_EXCLUDED_IDS = new Set(['dopamine-lab']);
const ALLOWED_CATEGORIES = new Set(['fortune', 'luck', 'finance', 'fun', 'utility', 'experimental', 'other']);

function fail(message) {
  console.error(`[validate-service-data] ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) fail(`Missing file: ${path.relative(ROOT, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function assertServiceFields(service) {
  const requiredFields = [
    'id',
    'name',
    'fullName',
    'category',
    'route',
    'updatedAt',
    'estimatedDuration',
    'questionCount',
    'featuredRank',
    'trendingScore',
  ];

  for (const field of requiredFields) {
    if (service[field] == null || service[field] === '') {
      fail(`Service '${service.id || '(unknown)'}' missing field '${field}'`);
    }
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(service.updatedAt)) {
    fail(`Service '${service.id}' has invalid updatedAt format: ${service.updatedAt}`);
  }
}

function assertSsgCoverage(manifest, ssgConfig) {
  const pageIds = new Set((ssgConfig.pages || []).map((page) => page.id));
  const missing = [];

  for (const service of manifest.services || []) {
    if (SSG_COVERAGE_EXCLUDED_IDS.has(service.id)) continue;
    if (!pageIds.has(service.id)) {
      missing.push(service.id);
    }
  }

  if (missing.length > 0) {
    fail(`Missing SSG page entries for service IDs: ${missing.join(', ')}`);
  }
}

function parseServiceIdFromRoute(route) {
  const matched = String(route || '').match(/^\/dunsmile\/([^/]+)\/$/);
  return matched ? matched[1] : '';
}

function assertRelatedServices(related, manifestServiceIds) {
  if (!related || typeof related !== 'object' || Array.isArray(related)) {
    fail('related-services.json must be an object keyed by source service id.');
  }

  for (const [sourceServiceId, cfg] of Object.entries(related)) {
    if (!manifestServiceIds.has(sourceServiceId)) {
      fail(`related-services.json has unknown source service id '${sourceServiceId}'`);
    }
    if (!cfg || typeof cfg !== 'object' || Array.isArray(cfg)) {
      fail(`related-services '${sourceServiceId}' must be an object`);
    }
    if (!Array.isArray(cfg.cards)) {
      fail(`related-services '${sourceServiceId}' missing cards array`);
    }
    for (const [idx, card] of cfg.cards.entries()) {
      if (!card || typeof card !== 'object' || Array.isArray(card)) {
        fail(`related-services '${sourceServiceId}' card[${idx}] must be an object`);
      }
      const requiredCardFields = ['href', 'title', 'description', 'linkText'];
      for (const field of requiredCardFields) {
        if (!card[field] || String(card[field]).trim() === '') {
          fail(`related-services '${sourceServiceId}' card[${idx}] missing '${field}'`);
        }
      }
      if (!/^\/dunsmile\/[^/]+\/$/.test(String(card.href))) {
        fail(`related-services '${sourceServiceId}' card[${idx}] has invalid href '${card.href}'`);
      }
      const targetServiceId = parseServiceIdFromRoute(card.href);
      if (!manifestServiceIds.has(targetServiceId)) {
        fail(`related-services '${sourceServiceId}' card[${idx}] points to unknown service '${targetServiceId}'`);
      }
    }
  }
}

function assertShellUi(shellUi, manifestServiceIds) {
  if (!shellUi || typeof shellUi !== 'object' || Array.isArray(shellUi)) {
    fail('shell-ui.json must be an object.');
  }

  if (!Array.isArray(shellUi.fallbackServiceLinks) || shellUi.fallbackServiceLinks.length === 0) {
    fail('shell-ui.json fallbackServiceLinks must be a non-empty array.');
  }

  for (const [idx, link] of shellUi.fallbackServiceLinks.entries()) {
    const requiredFields = ['id', 'label', 'href', 'category'];
    for (const field of requiredFields) {
      if (!link || link[field] == null || String(link[field]).trim() === '') {
        fail(`shell-ui fallbackServiceLinks[${idx}] missing '${field}'`);
      }
    }
    if (!/^\/dunsmile\/[^/]+\/$/.test(String(link.href))) {
      fail(`shell-ui fallbackServiceLinks[${idx}] has invalid href '${link.href}'`);
    }
    const targetServiceId = parseServiceIdFromRoute(link.href);
    if (!manifestServiceIds.has(targetServiceId)) {
      fail(`shell-ui fallbackServiceLinks[${idx}] points to unknown service '${targetServiceId}'`);
    }
    if (!ALLOWED_CATEGORIES.has(String(link.category))) {
      fail(`shell-ui fallbackServiceLinks[${idx}] has unsupported category '${link.category}'`);
    }
  }

  if (!shellUi.categoryMeta || typeof shellUi.categoryMeta !== 'object' || Array.isArray(shellUi.categoryMeta)) {
    fail('shell-ui.json categoryMeta must be an object.');
  }
  if (!shellUi.categoryStyleMeta || typeof shellUi.categoryStyleMeta !== 'object' || Array.isArray(shellUi.categoryStyleMeta)) {
    fail('shell-ui.json categoryStyleMeta must be an object.');
  }
  if (!shellUi.carousel || typeof shellUi.carousel !== 'object' || Array.isArray(shellUi.carousel)) {
    fail('shell-ui.json carousel must be an object.');
  }
  if (!Number.isInteger(shellUi.carousel.targetCount) || shellUi.carousel.targetCount < 1) {
    fail('shell-ui.json carousel.targetCount must be an integer >= 1.');
  }
}

function main() {
  const manifest = readJson(MANIFEST_PATH);
  const ssgConfig = readJson(SSG_PATH);
  const related = readJson(RELATED_PATH);
  const shellUi = readJson(SHELL_UI_PATH);

  if (!Array.isArray(manifest.services) || manifest.services.length === 0) {
    fail('Manifest must contain at least one service.');
  }

  const manifestServiceIds = new Set();
  for (const service of manifest.services) {
    assertServiceFields(service);
    manifestServiceIds.add(service.id);
  }

  assertSsgCoverage(manifest, ssgConfig);
  assertRelatedServices(related, manifestServiceIds);
  assertShellUi(shellUi, manifestServiceIds);
  console.log('[validate-service-data] OK');
}

main();
