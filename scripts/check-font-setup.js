#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TOKENS_PATH = path.join(ROOT, 'fe', 'public', 'dunsmile', 'css', 'tokens.css');
const STYLE_PATH = path.join(ROOT, 'fe', 'public', 'dunsmile', 'css', 'style.css');
const HOME_CSS_PATH = path.join(ROOT, 'fe', 'public', 'assets', 'css', 'home.css');

function fail(message) {
  console.error(`[font-check] ${message}`);
  process.exit(1);
}

function read(filePath) {
  if (!fs.existsSync(filePath)) fail(`missing file: ${path.relative(ROOT, filePath)}`);
  return fs.readFileSync(filePath, 'utf8');
}

function ensureIncludes(content, needle, label) {
  if (!content.includes(needle)) fail(`${label} not found: ${needle}`);
}

function main() {
  const tokens = read(TOKENS_PATH);
  const style = read(STYLE_PATH);
  const homeCss = read(HOME_CSS_PATH);

  ensureIncludes(tokens, 'pretendard.css', 'Pretendard import');
  ensureIncludes(tokens, "--font-family-base: 'Pretendard'", 'font token');
  ensureIncludes(tokens, 'font-family: var(--font-family-base);', 'global font apply');

  ensureIncludes(style, "@import url('/dunsmile/css/tokens.css');", 'service style token import');
  ensureIncludes(homeCss, "font-family: var(--font-family-base);", 'home font apply');

  console.log('[font-check] PASS Pretendard path and application are valid.');
}

main();
