#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TOOL_DIRS = [
  '.adal',
  '.agent',
  '.agents',
  '.augment',
  '.claude',
  '.codebuddy',
  '.commandcode',
  '.continue',
  '.cortex',
  '.crush',
  '.factory',
  '.goose',
  '.iflow',
  '.junie',
  '.kilocode',
  '.kiro',
  '.kode',
  '.mcpjam',
  '.mux',
  '.neovate',
  '.openhands',
  '.pi',
  '.pochi',
  '.qoder',
  '.qwen',
  '.roo',
  '.trae',
  '.vibe',
  '.windsurf',
  '.zencoder',
];

function parseArgs(argv) {
  const options = {
    apply: false,
    root: process.cwd(),
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--apply') {
      options.apply = true;
    } else if (arg === '--root') {
      options.root = path.resolve(argv[i + 1] || options.root);
      i += 1;
    }
  }

  return options;
}

function safeLstat(targetPath) {
  try {
    return fs.lstatSync(targetPath);
  } catch {
    return null;
  }
}

function listSkillFiles(rootPath) {
  const files = [];

  function walk(currentPath) {
    for (const entry of fs.readdirSync(currentPath, { withFileTypes: true })) {
      const fullPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  }

  walk(rootPath);
  return files;
}

function ensureCanonicalSkills(rootPath) {
  const canonicalPath = path.join(rootPath, 'skills');
  const stat = safeLstat(canonicalPath);
  if (!stat || !stat.isDirectory()) {
    throw new Error(`Missing canonical skills directory: ${canonicalPath}`);
  }

  const fileCount = listSkillFiles(canonicalPath).length;
  if (fileCount === 0) {
    throw new Error(`Canonical skills directory is empty: ${canonicalPath}`);
  }

  return { canonicalPath, fileCount };
}

function inspectToolSkills(rootPath, toolDir) {
  const toolPath = path.join(rootPath, toolDir);
  const skillsPath = path.join(toolPath, 'skills');
  const toolStat = safeLstat(toolPath);
  const skillsStat = safeLstat(skillsPath);

  if (!toolStat || !toolStat.isDirectory()) {
    return { toolDir, toolPath, skillsPath, state: 'missing-tool-dir' };
  }

  if (!skillsStat) {
    return { toolDir, toolPath, skillsPath, state: 'missing-skills-path' };
  }

  if (skillsStat.isSymbolicLink()) {
    const target = fs.readlinkSync(skillsPath);
    const normalized = path.normalize(target);
    if (normalized === '../skills') {
      return { toolDir, toolPath, skillsPath, state: 'ok-link', target };
    }
    return { toolDir, toolPath, skillsPath, state: 'wrong-link', target };
  }

  if (skillsStat.isDirectory()) {
    return { toolDir, toolPath, skillsPath, state: 'directory-copy' };
  }

  return { toolDir, toolPath, skillsPath, state: 'unexpected-file' };
}

function replaceWithLink(report) {
  fs.rmSync(report.skillsPath, { recursive: true, force: true });
  fs.symlinkSync('../skills', report.skillsPath);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  const { root, apply } = options;
  const { fileCount } = ensureCanonicalSkills(root);

  const reports = TOOL_DIRS.map((toolDir) => inspectToolSkills(root, toolDir));
  const fixable = reports.filter((report) =>
    ['directory-copy', 'wrong-link', 'missing-skills-path'].includes(report.state)
  );
  const broken = reports.filter((report) =>
    ['unexpected-file'].includes(report.state)
  );

  if (apply) {
    for (const report of fixable) {
      if (report.state === 'missing-skills-path') {
        fs.mkdirSync(report.toolPath, { recursive: true });
        fs.symlinkSync('../skills', report.skillsPath);
      } else {
        replaceWithLink(report);
      }
    }
  }

  console.log(`Canonical skills: ${fileCount} files`);
  for (const report of reports) {
    const suffix = report.target ? ` (${report.target})` : '';
    console.log(`${report.toolDir}: ${report.state}${suffix}`);
  }

  if (broken.length > 0) {
    console.error(`Found ${broken.length} unexpected tool skill path(s).`);
    process.exitCode = 1;
    return;
  }

  if (fixable.length > 0 && !apply) {
    console.error(`Found ${fixable.length} tool skill path(s) to normalize. Re-run with --apply.`);
    process.exitCode = 1;
    return;
  }
}

main();
