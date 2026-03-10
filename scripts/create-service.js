#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC_ROOT = path.join(ROOT, 'fe', 'src');
const PUBLIC_ROOT = path.join(ROOT, 'fe', 'public');

const MANIFEST_PATH = path.join(SRC_ROOT, 'data', 'services.manifest.json');
const SSG_CONFIG_PATH = path.join(SRC_ROOT, 'ssg', 'static-pages.json');
const SITE_SETTINGS_PATH = path.join(SRC_ROOT, 'data', 'site-settings.json');

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    id: '',
    name: '',
    fullName: '',
    category: 'experimental',
    emoji: '✨',
    desc: 'New service',
    status: 'beta',
    homeVisible: true,
    dryRun: false,
    blueprint: 'basic',
    skin: '',
    showHelp: false,
  };

  if (args.length === 0) return result;
  if (args.includes('--help') || args.includes('-h')) {
    result.showHelp = true;
    return result;
  }
  result.id = args[0];

  for (let i = 1; i < args.length; i += 1) {
    const token = args[i];
    const next = args[i + 1];
    if (token === '--name' && next) {
      result.name = next;
      i += 1;
    } else if (token === '--full-name' && next) {
      result.fullName = next;
      i += 1;
    } else if (token === '--category' && next) {
      result.category = next;
      i += 1;
    } else if (token === '--emoji' && next) {
      result.emoji = next;
      i += 1;
    } else if (token === '--desc' && next) {
      result.desc = next;
      i += 1;
    } else if (token === '--hidden-home') {
      result.homeVisible = false;
    } else if (token === '--dry-run') {
      result.dryRun = true;
    } else if ((token === '--blueprint' || token === '--template') && next) {
      result.blueprint = next;
      i += 1;
    } else if (token === '--skin' && next) {
      result.skin = String(next).toUpperCase();
      i += 1;
    }
  }

  return result;
}

function printHelp() {
  console.log('Usage: npm run create:service -- <service-id> [options]');
  console.log('');
  console.log('Options:');
  console.log('  --name <text>');
  console.log('  --full-name <text>');
  console.log('  --category <fortune|luck|finance|fun|utility|experimental>');
  console.log('  --emoji <emoji>');
  console.log('  --desc <text>');
  console.log('  --template, --blueprint <basic|fortune>');
  console.log('  --skin <A|B>');
  console.log('  --hidden-home');
  console.log('  --dry-run');
  console.log('  --help, -h');
}

function fail(msg) {
  console.error(`[create-service] ${msg}`);
  process.exit(1);
}

function ensureValidId(id) {
  if (!id) fail('Service ID is required. Usage: npm run create:service -- <service-id>');
  if (!/^[a-z0-9-]+$/.test(id)) {
    fail('Invalid service ID. Use lowercase letters, numbers, hyphen only.');
  }
}

function readJson(filePath, label) {
  if (!fs.existsSync(filePath)) fail(`Missing ${label}: ${path.relative(ROOT, filePath)}`);
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function writeFileIfMissing(filePath, content, dryRun) {
  if (fs.existsSync(filePath)) fail(`File already exists: ${path.relative(ROOT, filePath)}`);
  if (dryRun) return;
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

function titleFromId(id) {
  return id
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function toSlugLabel(id) {
  return id.replace(/-/g, ' ');
}

function normalizeOpts(rawOpts) {
  const opts = { ...rawOpts };
  opts.name = opts.name || toSlugLabel(opts.id);
  opts.fullName = opts.fullName || titleFromId(opts.id);
  if (!['basic', 'fortune'].includes(opts.blueprint)) {
    fail(`Unknown blueprint '${opts.blueprint}'. Use: basic, fortune`);
  }
  if (opts.skin && !['A', 'B'].includes(opts.skin)) {
    fail(`Unknown skin '${opts.skin}'. Use: A, B`);
  }
  return opts;
}

function buildTemplateHtml(opts) {
  const pageTitle = `${opts.fullName} | Dopamine Factory`;
  const scriptTag = opts.blueprint === 'fortune'
    ? `\n  <script src="/dunsmile/js/${opts.id}.js" defer></script>`
    : '';
  return `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${pageTitle}</title>
  <meta name="description" content="${opts.desc}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${opts.fullName}">
  <meta property="og:description" content="${opts.desc}">
  <meta property="og:image" content="https://dopamine-factory.pages.dev/dunsmile/assets/og-image.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${opts.fullName}">
  <meta name="twitter:description" content="${opts.desc}">
  <meta name="twitter:image" content="https://dopamine-factory.pages.dev/dunsmile/assets/og-image.png">
  <link rel="canonical" href="https://dopamine-factory.pages.dev/dunsmile/${opts.id}/">

  <link rel="stylesheet" href="/assets/css/tailwind-built.css">
  <link rel="stylesheet" href="/dunsmile/css/style.css">
</head>
<body class="bg-white md:bg-gray-50">
{{BODY}}
${scriptTag}
</body>
</html>
`;
}

function buildBodyHtml(opts) {
  return `<main class="main-container">
  <section class="content-area">
    <div class="max-w-md md:max-w-xl mx-auto min-h-screen bg-white p-4 space-y-4">
      <header class="sticky top-0 bg-white border-b border-gray-200 z-10 py-3">
        <div class="flex items-center gap-2">
          <a href="/" class="dp-header-home">도파민 공작소</a><span class="dp-header-sep">›</span>
          <h1 class="text-lg font-bold">${opts.fullName}</h1>
        </div>
      </header>

      <section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p class="text-sm text-gray-500">${opts.emoji} ${opts.category}</p>
        <h2 class="mt-2 text-2xl font-black text-gray-900">${opts.fullName}</h2>
        <p class="mt-3 text-sm text-gray-600">${opts.desc}</p>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
        기본 스캐폴드가 생성되었습니다.\n서비스별 실제 UI/로직을 이 body 템플릿에 구현하세요.
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-4">
        <h3 class="text-base font-bold text-gray-900">FAQ</h3>
        <ul class="mt-3 space-y-2 text-sm text-gray-600">
          <li>Q. ${opts.fullName}는 어떻게 동작하나요?</li>
          <li>A. 질문/입력 기반으로 결과를 생성하는 서비스입니다.</li>
        </ul>
      </section>

      <section class="rounded-2xl border border-gray-200 bg-white p-4 text-xs text-gray-500">
        <p data-analytics-event="impression">analytics: impression</p>
        <p data-analytics-event="start">analytics: start</p>
        <p data-analytics-event="complete">analytics: complete</p>
        <p data-analytics-event="share">analytics: share</p>
      </section>
    </div>
  </section>
</main>
`;
}

function buildFortuneBodyHtml(opts) {
  return `<!-- Google Tag Manager (noscript) -->
<noscript>
  <iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TD8GQFFB" height="0" width="0" class="dp-noscript-frame"></iframe>
</noscript>

<div id="toast" class="toast"><span id="toastMessage"></span></div>

<div class="main-container dp-shell-no-edge">
  <div class="content-area">
    <div class="dp-service-frame">
      <div class="sticky top-0 bg-white border-b border-gray-200 z-10 shadow-sm">
        <div class="dp-service-topbar-row">
          <div class="dp-service-topbar-brand">
            <a href="/" class="dp-header-home">도파민 공작소</a><span class="dp-header-sep">›</span>
            <h1 class="svc-title-gradient-amber">${opts.fullName}</h1>
          </div>
          <div class="flex items-center gap-1">
            <button onclick="openSettings()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">⚙️</button>
            <button onclick="openServiceMenu()" class="p-2 hover:bg-gray-100 rounded-lg transition-colors">☰</button>
          </div>
        </div>
      </div>

      <div id="step1" class="step active dp-service-step space-y-4">
        <div class="text-center py-6">
          <div class="text-6xl mb-4">${opts.emoji}</div>
          <h2 class="text-2xl font-black text-gray-900 mb-2">${opts.fullName}</h2>
          <p class="text-gray-600">${opts.desc}</p>
        </div>

        <section class="bg-white rounded-2xl p-5 shadow-lg border border-gray-200 space-y-4">
          <div>
            <label class="text-sm font-semibold text-gray-700 block mb-2">이름</label>
            <input id="userName" type="text" class="svc-input-text svc-input-text-amber" placeholder="이름을 입력하세요" maxlength="20">
          </div>
          <button onclick="startFortuneLikeFlow()" class="svc-hero-cta svc-hero-cta-amber">결과 보기</button>
        </section>
      </div>

      <div id="step2" class="step dp-service-step">
        <div class="flex flex-col items-center justify-center min-h-[70vh]">
          <div class="text-6xl mb-4 fortune-pulse">${opts.emoji}</div>
          <p class="text-xl font-bold text-gray-900">분석 중...</p>
        </div>
      </div>

      <div id="step3" class="step dp-service-step pb-8 space-y-4">
        <section class="svc-result-hero svc-result-hero-amber">
          <div class="text-sm text-amber-700 font-medium mb-2">오늘의 결과</div>
          <div class="text-4xl font-black text-amber-600">87점</div>
        </section>

        <section class="bg-white rounded-2xl p-5 shadow border border-gray-200">
          <h3 class="font-bold text-gray-900 mb-2">결과 요약</h3>
          <p class="text-sm text-gray-600">이 페이지는 fortune 블루프린트로 생성되었습니다. 서비스 로직을 연결해 완성하세요.</p>
        </section>

        {{RELATED_CAROUSEL}}
      </div>
    </div>
  </div>
</div>
`;
}

function buildFortuneScript(opts) {
  return `(() => {
  function showStep(stepNumber) {
    document.querySelectorAll('.step').forEach((step) => step.classList.remove('active'));
    const target = document.getElementById('step' + stepNumber);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
  }

  function showToast(message) {
    const toast = document.getElementById('toast');
    const text = document.getElementById('toastMessage');
    if (!toast || !text) return;
    text.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1800);
  }

  window.startFortuneLikeFlow = function startFortuneLikeFlow() {
    const name = document.getElementById('userName');
    if (!name || !name.value.trim()) {
      showToast('이름을 입력해주세요');
      return;
    }
    showStep(2);
    setTimeout(() => showStep(3), 900);
  };

  window.openSettings = function openSettings() {
    showToast('설정 기능은 서비스별로 구현하세요');
  };

  window.openServiceMenu = function openServiceMenu() {
    if (typeof window.openServiceMenu === 'function' && window.openServiceMenu !== openServiceMenu) return;
    showToast('메뉴 기능은 공통 셸/스크립트 연동 시 활성화됩니다');
  };

  showStep(1);
})();\n`;
}

function createSourceFiles(opts) {
  const pageDir = path.join(SRC_ROOT, 'pages', 'dunsmile', opts.id);
  const templatePath = path.join(pageDir, 'template.html');
  const bodyPath = path.join(pageDir, 'body.html');

  writeFileIfMissing(templatePath, buildTemplateHtml(opts), opts.dryRun);
  writeFileIfMissing(
    bodyPath,
    opts.blueprint === 'fortune' ? buildFortuneBodyHtml(opts) : buildBodyHtml(opts),
    opts.dryRun,
  );

  if (opts.blueprint === 'fortune') {
    const scriptPath = path.join(PUBLIC_ROOT, 'dunsmile', 'js', `${opts.id}.js`);
    writeFileIfMissing(scriptPath, buildFortuneScript(opts), opts.dryRun);
  }
}

function updateManifest(opts) {
  const manifest = readJson(MANIFEST_PATH, 'manifest');
  const services = Array.isArray(manifest.services) ? manifest.services : [];

  if (services.some((service) => service.id === opts.id)) {
    fail(`Service already exists in manifest: ${opts.id}`);
  }

  services.push({
    id: opts.id,
    name: opts.name,
    fullName: opts.fullName,
    emoji: opts.emoji,
    desc: opts.desc,
    category: opts.category,
    status: opts.status,
    route: `/dunsmile/${opts.id}/`,
    homeVisible: opts.homeVisible,
    shellEnabled: false,
    module: {
      type: 'legacy-page',
      entry: `/dunsmile/${opts.id}/index.html`,
    },
    ogImage: '/dunsmile/assets/og-image.png',
    updatedAt: manifest.updatedAt || '2026-02-21',
    estimatedDuration: 3,
    questionCount: 10,
    featuredRank: services.length + 1,
    trendingScore: 0,
    socialProof: {
      views: 0,
      likes: 0,
    },
    tags: [opts.category, 'new'],
  });

  services.sort((a, b) => String(a.id).localeCompare(String(b.id)));
  manifest.services = services;

  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(now.getUTCDate()).padStart(2, '0');
  manifest.updatedAt = `${yyyy}-${mm}-${dd}`;

  if (!opts.dryRun) {
    writeJson(MANIFEST_PATH, manifest);
  }
}

function validateManifestShape() {
  const manifest = readJson(MANIFEST_PATH, 'manifest');
  const services = Array.isArray(manifest.services) ? manifest.services : [];
  const required = ['updatedAt', 'estimatedDuration', 'questionCount', 'featuredRank', 'trendingScore'];

  for (const service of services) {
    for (const key of required) {
      if (service[key] == null) {
        fail(`Manifest validation failed: missing '${key}' in service '${service.id}'`);
      }
    }
  }
}

function updateSsgConfig(opts) {
  const config = readJson(SSG_CONFIG_PATH, 'ssg config');
  const pages = Array.isArray(config.pages) ? config.pages : [];

  if (pages.some((page) => page.id === opts.id)) {
    fail(`Service already exists in ssg config: ${opts.id}`);
  }

  pages.push({
    id: opts.id,
    template: `fe/src/pages/dunsmile/${opts.id}/template.html`,
    body: `fe/src/pages/dunsmile/${opts.id}/body.html`,
    output: `fe/public/dunsmile/${opts.id}/index.html`,
  });

  config.pages = pages;

  if (!opts.dryRun) {
    writeJson(SSG_CONFIG_PATH, config);
  }
}

function updateSiteSettings(opts) {
  if (!opts.skin) return;
  const settings = readJson(SITE_SETTINGS_PATH, 'site settings');
  settings.services = settings.services || {};
  settings.services[opts.id] = settings.services[opts.id] || {};
  settings.services[opts.id].skin = opts.skin;

  if (!opts.dryRun) {
    writeJson(SITE_SETTINGS_PATH, settings);
  }
}

function main() {
  const rawOpts = parseArgs(process.argv);
  if (rawOpts.showHelp) {
    printHelp();
    return;
  }
  ensureValidId(rawOpts.id);
  const opts = normalizeOpts(rawOpts);

  const sourceOutputPath = path.join(PUBLIC_ROOT, 'dunsmile', opts.id, 'index.html');
  if (fs.existsSync(sourceOutputPath)) {
    fail(`Service output already exists: ${path.relative(ROOT, sourceOutputPath)}`);
  }

  createSourceFiles(opts);
  updateManifest(opts);
  updateSsgConfig(opts);
  updateSiteSettings(opts);
  validateManifestShape();

  if (opts.dryRun) {
    console.log(`[create-service] Dry run passed for '${opts.id}'`);
    return;
  }

  console.log(`[create-service] Created service '${opts.id}'`);
  console.log(`[create-service] Source template: fe/src/pages/dunsmile/${opts.id}/template.html`);
  console.log(`[create-service] Source body: fe/src/pages/dunsmile/${opts.id}/body.html`);
  if (opts.blueprint === 'fortune') {
    console.log(`[create-service] Source script: fe/public/dunsmile/js/${opts.id}.js`);
  }
  if (opts.skin) {
    console.log(`[create-service] Site skin: ${opts.skin}`);
  }
  console.log('[create-service] Next step: npm run build:pages');
}

main();
