#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const ROOT = process.cwd();
const WATCH_DIRS = [
  'fe/src',
  'fe/styles',
  'fe/public/js',
  'fe/public/dunsmile/js',
  'fe/public/dunsmile/css',
].map((p) => path.join(ROOT, p));

const EXCLUDE_DIRS = new Set(['node_modules', '.git']);
let pending = false;
let running = false;
let timer = null;

function runBuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  const child = spawn('npm', ['run', 'build'], { stdio: 'inherit', cwd: ROOT, shell: true });
  child.on('exit', () => {
    running = false;
    if (pending) {
      pending = false;
      runBuild();
    }
  });
}

function scheduleBuild() {
  clearTimeout(timer);
  timer = setTimeout(runBuild, 200);
}

function watchDir(dir) {
  if (!fs.existsSync(dir)) return;

  fs.watch(dir, (eventType, filename) => {
    if (!filename) return;
    scheduleBuild();
  });

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (EXCLUDE_DIRS.has(entry.name)) continue;
    watchDir(path.join(dir, entry.name));
  }
}

for (const dir of WATCH_DIRS) watchDir(dir);
console.log('[build-watch] Watching source files...');
runBuild();
