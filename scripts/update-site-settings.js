#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SETTINGS_PATH = path.join(ROOT, 'fe', 'src', 'data', 'site-settings.json');

function fail(message) {
  console.error(`[update-site-settings] ${message}`);
  process.exit(1);
}

function readSettings() {
  if (!fs.existsSync(SETTINGS_PATH)) fail(`Missing file: ${path.relative(ROOT, SETTINGS_PATH)}`);
  return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf8'));
}

function writeSettings(payload) {
  fs.writeFileSync(SETTINGS_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function parseArgs(argv) {
  const args = argv.slice(2);
  const result = {
    homeSkin: '',
    homeHero: '',
    homeReference: '',
    homeBannerMode: '',
    homeBannerBadge: '',
    homeBannerCta: '',
    homeBannerPrimaryService: '',
    homeBannerSecondaryServices: '',
    homeBannerFallback: '',
    homeBannerMaxSecondary: '',
    homeBanner1Service: '',
    homeBanner2Service: '',
    serviceShellDefaultSkin: '',
    allServiceSkin: '',
    serviceId: '',
    serviceSkin: '',
    serviceHero: '',
  };

  for (let i = 0; i < args.length; i += 1) {
    const token = args[i];
    const next = args[i + 1];
    if ((token === '--home-skin' || token === '--skin-home') && next) {
      result.homeSkin = String(next).toUpperCase();
      i += 1;
      continue;
    }
    if ((token === '--home-hero' || token === '--home-banner') && next) {
      result.homeHero = String(next);
      i += 1;
      continue;
    }
    if ((token === '--home-reference' || token === '--home-preset') && next) {
      result.homeReference = String(next).toLowerCase();
      i += 1;
      continue;
    }
    if (token === '--home-banner-mode' && next) {
      result.homeBannerMode = String(next).toLowerCase();
      i += 1;
      continue;
    }
    if (token === '--home-banner-badge' && next) {
      result.homeBannerBadge = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner-cta' && next) {
      result.homeBannerCta = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner-primary-service' && next) {
      result.homeBannerPrimaryService = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner-secondary-services' && next) {
      result.homeBannerSecondaryServices = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner-fallback' && next) {
      result.homeBannerFallback = String(next).toLowerCase();
      i += 1;
      continue;
    }
    if (token === '--home-banner-max-secondary' && next) {
      result.homeBannerMaxSecondary = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner1-service' && next) {
      result.homeBanner1Service = String(next);
      i += 1;
      continue;
    }
    if (token === '--home-banner2-service' && next) {
      result.homeBanner2Service = String(next);
      i += 1;
      continue;
    }
    if ((token === '--service-shell-default-skin' || token === '--shell-default-skin') && next) {
      result.serviceShellDefaultSkin = String(next).toUpperCase();
      i += 1;
      continue;
    }
    if (token === '--all-service-skin' && next) {
      result.allServiceSkin = String(next).toUpperCase();
      i += 1;
      continue;
    }
    if (token === '--service' && next) {
      result.serviceId = String(next);
      i += 1;
      continue;
    }
    if ((token === '--service-skin' || token === '--skin') && next) {
      result.serviceSkin = String(next).toUpperCase();
      i += 1;
      continue;
    }
    if ((token === '--service-hero' || token === '--hero') && next) {
      result.serviceHero = String(next);
      i += 1;
      continue;
    }
  }

  return result;
}

function main() {
  const opts = parseArgs(process.argv);
  const settings = readSettings();
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  let changed = false;

  settings.home = settings.home || {};
  settings.home.skins = settings.home.skins || {};
  settings.home.banner = settings.home.banner || {};
  settings.serviceShell = settings.serviceShell || {};
  settings.serviceShell.skins = settings.serviceShell.skins || {};
  settings.services = settings.services || {};

  if (opts.homeSkin) {
    if (!settings.home.skins[opts.homeSkin]) {
      fail(`Unknown home skin '${opts.homeSkin}'. Define it first in site-settings.json`);
    }
    settings.home.activeSkin = opts.homeSkin;
    changed = true;
    console.log(`[update-site-settings] home active skin -> ${opts.homeSkin}`);
  }

  if (opts.homeHero) {
    const activeSkin = settings.home.activeSkin || 'A';
    settings.home.skins[activeSkin] = settings.home.skins[activeSkin] || {};
    settings.home.skins[activeSkin].heroImage = opts.homeHero;
    changed = true;
    console.log(`[update-site-settings] home ${activeSkin} hero image -> ${opts.homeHero}`);
  }

  if (opts.homeReference) {
    if (!['testmoa', 'poomang', 'banggooso'].includes(opts.homeReference)) {
      fail(`Unknown home reference '${opts.homeReference}'. Use: testmoa, poomang, banggooso`);
    }
    settings.home.referencePreset = opts.homeReference;
    changed = true;
    console.log(`[update-site-settings] home reference preset -> ${opts.homeReference}`);
  }

  if (opts.homeBannerMode) {
    if (!['auto', 'manual'].includes(opts.homeBannerMode)) {
      fail(`Unknown home banner mode '${opts.homeBannerMode}'. Use: auto, manual`);
    }
    settings.home.banner.mode = opts.homeBannerMode;
    changed = true;
    console.log(`[update-site-settings] home banner mode -> ${opts.homeBannerMode}`);
  }

  if (opts.homeBannerBadge) {
    settings.home.banner.badgeText = opts.homeBannerBadge;
    changed = true;
    console.log(`[update-site-settings] home banner badge -> ${opts.homeBannerBadge}`);
  }

  if (opts.homeBannerCta) {
    settings.home.banner.ctaText = opts.homeBannerCta;
    changed = true;
    console.log(`[update-site-settings] home banner cta -> ${opts.homeBannerCta}`);
  }

  if (opts.homeBannerFallback) {
    if (!['auto', 'strict'].includes(opts.homeBannerFallback)) {
      fail(`Unknown home banner fallback '${opts.homeBannerFallback}'. Use: auto, strict`);
    }
    settings.home.banner.fallback = opts.homeBannerFallback;
    changed = true;
    console.log(`[update-site-settings] home banner fallback -> ${opts.homeBannerFallback}`);
  }

  if (opts.homeBannerMaxSecondary) {
    const parsed = Number(opts.homeBannerMaxSecondary);
    if (!Number.isInteger(parsed) || parsed < 0 || parsed > 2) {
      fail(`Invalid home banner max secondary '${opts.homeBannerMaxSecondary}'. Use integer 0~2`);
    }
    settings.home.banner.maxSecondary = parsed;
    changed = true;
    console.log(`[update-site-settings] home banner max secondary -> ${parsed}`);
  }

  if (opts.homeBannerPrimaryService || opts.homeBannerSecondaryServices || opts.homeBanner1Service || opts.homeBanner2Service) {
    const primaryServiceId = opts.homeBannerPrimaryService || opts.homeBanner1Service;
    if (primaryServiceId) {
      settings.home.banner.primaryServiceId = primaryServiceId;
      changed = true;
      console.log(`[update-site-settings] home banner primary -> ${primaryServiceId}`);
    }

    if (opts.homeBannerSecondaryServices) {
      const secondaryServiceIds = opts.homeBannerSecondaryServices
        .split(',')
        .map((value) => String(value || '').trim())
        .filter(Boolean)
        .slice(0, 2);
      settings.home.banner.secondaryServiceIds = secondaryServiceIds;
      changed = true;
      console.log(`[update-site-settings] home banner secondary -> ${secondaryServiceIds.join(', ') || '(empty)'}`);
    }

    if (opts.homeBanner2Service) {
      const nextSecondary = [opts.homeBanner2Service];
      settings.home.banner.secondaryServiceIds = nextSecondary;
      changed = true;
      console.log(`[update-site-settings] home banner secondary -> ${opts.homeBanner2Service}`);
    }

    const card1 = settings.home.banner.primaryServiceId ? {
      serviceId: settings.home.banner.primaryServiceId,
      variant: 1,
    } : null;
    const card2 = Array.isArray(settings.home.banner.secondaryServiceIds) && settings.home.banner.secondaryServiceIds[0]
      ? {
          serviceId: settings.home.banner.secondaryServiceIds[0],
          variant: 2,
        }
      : null;
    settings.home.banner.cards = [card1, card2].filter(Boolean);
    console.log('[update-site-settings] home banner manual targets updated');
  }

  if (opts.serviceShellDefaultSkin) {
    if (!['A', 'B'].includes(opts.serviceShellDefaultSkin)) {
      fail(`Unknown shell default skin '${opts.serviceShellDefaultSkin}'. Use: A, B`);
    }
    settings.serviceShell.defaultSkin = opts.serviceShellDefaultSkin;
    changed = true;
    console.log(`[update-site-settings] service shell default skin -> ${opts.serviceShellDefaultSkin}`);
  }

  if (opts.allServiceSkin) {
    if (!['A', 'B'].includes(opts.allServiceSkin)) {
      fail(`Unknown all-service skin '${opts.allServiceSkin}'. Use: A, B`);
    }
    settings.serviceShell.defaultSkin = opts.allServiceSkin;
    Object.keys(settings.services).forEach((serviceId) => {
      const service = settings.services[serviceId];
      if (!service || typeof service !== 'object') return;
      delete service.skin;
    });
    changed = true;
    console.log(`[update-site-settings] all services skin -> ${opts.allServiceSkin} (overrides cleared)`);
  }

  if (opts.serviceId) {
    settings.services[opts.serviceId] = settings.services[opts.serviceId] || {};
    if (opts.serviceSkin) {
      settings.services[opts.serviceId].skin = opts.serviceSkin;
      changed = true;
      console.log(`[update-site-settings] ${opts.serviceId} skin -> ${opts.serviceSkin}`);
    }
    if (opts.serviceHero) {
      settings.services[opts.serviceId].heroImage = opts.serviceHero;
      changed = true;
      console.log(`[update-site-settings] ${opts.serviceId} hero image -> ${opts.serviceHero}`);
    }
  }

  if (!changed) {
    console.log('[update-site-settings] No changes. Example:');
    console.log('  npm run settings:update -- --home-skin B');
    console.log('  npm run settings:update -- --home-reference testmoa|poomang|banggooso');
    console.log('  npm run settings:update -- --home-banner-mode manual --home-banner-primary-service daily-fortune --home-banner-secondary-services wealth-dna-test,balance-game');
    console.log('  npm run settings:update -- --home-banner-fallback auto --home-banner-max-secondary 2');
    console.log('  npm run settings:update -- --service-shell-default-skin A');
    console.log('  npm run settings:update -- --all-service-skin B');
    console.log('  npm run settings:update -- --service wealth-dna-test --service-skin A');
    console.log('  npm run settings:update -- --service wealth-dna-test --service-hero /dunsmile/assets/og-image.png');
    return;
  }

  settings.updatedAt = `${y}-${m}-${d}`;
  writeSettings(settings);
  console.log('[update-site-settings] Updated fe/src/data/site-settings.json');
  console.log('[update-site-settings] Next step: npm run build:pages');
}

main();
