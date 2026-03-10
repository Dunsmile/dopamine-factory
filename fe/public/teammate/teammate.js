(function initTeammateOps() {
  const SETTINGS_URL = '/dunsmile/site-settings.json';
  const MANIFEST_URL = '/dunsmile/services.manifest.json';

  const refs = {
    homeReference: document.getElementById('homeReference'),
    homeBannerMode: document.getElementById('homeBannerMode'),
    homeBannerBadge: document.getElementById('homeBannerBadge'),
    homeBannerCta: document.getElementById('homeBannerCta'),
    homeBanner1Service: document.getElementById('homeBanner1Service'),
    homeBanner2Service: document.getElementById('homeBanner2Service'),
    serviceShellDefaultSkin: document.getElementById('serviceShellDefaultSkin'),
    allServiceSkin: document.getElementById('allServiceSkin'),
    commandPreview: document.getElementById('commandPreview'),
    copyCommandBtn: document.getElementById('copyCommandBtn'),
    copyBuildBtn: document.getElementById('copyBuildBtn'),
    statusText: document.getElementById('statusText'),
  };

  const state = {
    settings: null,
    services: [],
  };

  function setStatus(text, isError) {
    if (!refs.statusText) return;
    refs.statusText.textContent = text || '';
    refs.statusText.style.color = isError ? '#b91c1c' : '#047857';
  }

  function shellEscape(value) {
    return `'${String(value || '').replace(/'/g, "'\\''")}'`;
  }

  function buildCommand() {
    const args = [
      '--home-reference', refs.homeReference.value,
      '--home-banner-mode', refs.homeBannerMode.value,
      '--home-banner1-service', refs.homeBanner1Service.value,
      '--home-banner2-service', refs.homeBanner2Service.value,
      '--home-banner-badge', refs.homeBannerBadge.value,
      '--home-banner-cta', refs.homeBannerCta.value,
      '--service-shell-default-skin', refs.serviceShellDefaultSkin.value,
    ];

    const cmd = ['npm run settings:update --'];
    for (let i = 0; i < args.length; i += 2) {
      cmd.push(args[i], shellEscape(args[i + 1]));
    }
    if (refs.allServiceSkin.value) {
      cmd.push('--all-service-skin', shellEscape(refs.allServiceSkin.value));
    }
    return cmd.join(' ');
  }

  function syncCommandPreview() {
    if (!refs.commandPreview) return;
    refs.commandPreview.value = buildCommand();
  }

  function buildServiceOptions() {
    const items = state.services
      .filter((service) => service && service.status !== 'disabled' && service.homeVisible !== false)
      .sort((a, b) => String(a.fullName || a.name || a.id).localeCompare(String(b.fullName || b.name || b.id), 'ko'));

    const optionsHtml = items.map((service) => (
      `<option value="${service.id}">${service.emoji || '✨'} ${service.fullName || service.name || service.id}</option>`
    )).join('');

    refs.homeBanner1Service.innerHTML = optionsHtml;
    refs.homeBanner2Service.innerHTML = optionsHtml;
  }

  function applyInitialValues() {
    const home = (state.settings && state.settings.home) || {};
    const banner = home.banner || {};
    const cards = Array.isArray(banner.cards) ? banner.cards : [];

    refs.homeReference.value = String(home.referencePreset || 'testmoa');
    refs.homeBannerMode.value = String(banner.mode || 'auto');
    refs.homeBannerBadge.value = String(banner.badgeText || '추천테스트');
    refs.homeBannerCta.value = String(banner.ctaText || '테스트시작');
    refs.homeBanner1Service.value = String((cards[0] && cards[0].serviceId) || refs.homeBanner1Service.value || '');
    refs.homeBanner2Service.value = String((cards[1] && cards[1].serviceId) || refs.homeBanner2Service.value || '');
    refs.serviceShellDefaultSkin.value = String((state.settings.serviceShell && state.settings.serviceShell.defaultSkin) || 'A');
    refs.allServiceSkin.value = '';
    syncCommandPreview();
  }

  function bindEvents() {
    [
      refs.homeReference,
      refs.homeBannerMode,
      refs.homeBannerBadge,
      refs.homeBannerCta,
      refs.homeBanner1Service,
      refs.homeBanner2Service,
      refs.serviceShellDefaultSkin,
      refs.allServiceSkin,
    ].forEach((el) => {
      el.addEventListener('change', syncCommandPreview);
      el.addEventListener('input', syncCommandPreview);
    });

    refs.copyCommandBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(refs.commandPreview.value);
        setStatus('설정 명령을 복사했습니다.');
      } catch (_error) {
        setStatus('복사에 실패했습니다. 수동으로 복사해주세요.', true);
      }
    });

    refs.copyBuildBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText('npm run build:pages');
        setStatus('빌드 명령을 복사했습니다.');
      } catch (_error) {
        setStatus('복사에 실패했습니다. 수동으로 복사해주세요.', true);
      }
    });
  }

  async function loadJson(url) {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw new Error(`${url} ${response.status}`);
    return response.json();
  }

  async function init() {
    try {
      const [settings, manifest] = await Promise.all([
        loadJson(SETTINGS_URL),
        loadJson(MANIFEST_URL),
      ]);
      state.settings = settings || {};
      state.services = Array.isArray(manifest.services) ? manifest.services : [];

      buildServiceOptions();
      applyInitialValues();
      bindEvents();
      setStatus('현재 설정을 불러왔습니다.');
    } catch (error) {
      setStatus(`설정 로드 실패: ${error.message}`, true);
    }
  }

  init();
})();
