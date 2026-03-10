(function initServiceShell(global) {
  const MANIFEST_URL = '/dunsmile/services.manifest.json';
  const SHARED_SCRIPTS = ['/dunsmile/js/service-ui.js', '/dunsmile/js/module-layout.js'];

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function getServiceId() {
    const bodyId = document.body ? document.body.getAttribute('data-service-id') : '';
    if (bodyId) return bodyId;

    const url = new URL(window.location.href);
    const queryId = url.searchParams.get('service');
    if (queryId) return queryId;

    const segments = url.pathname.split('/').filter(Boolean);
    if (segments.length >= 2 && segments[0] === 'dunsmile') {
      return segments[1];
    }

    return '';
  }

  async function fetchManifest() {
    const response = await fetch(MANIFEST_URL, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Manifest request failed: ${response.status}`);
    }

    const payload = await response.json();
    return Array.isArray(payload.services) ? payload.services : [];
  }

  function ensureRootShell() {
    let root = document.getElementById('serviceShellRoot');
    if (root) return root;

    root = document.createElement('main');
    root.id = 'serviceShellRoot';
    root.className = 'service-shell-root';
    document.body.appendChild(root);
    return root;
  }

  function renderError(message) {
    const root = ensureRootShell();
    root.innerHTML = `
      <section class="service-shell-message" role="alert">
        <h1 class="service-shell-title">Service Load Error</h1>
        <p class="service-shell-desc">${escapeHtml(message)}</p>
        <a href="/" class="service-shell-link">홈으로 이동</a>
      </section>
    `;
  }

  function renderLoading() {
    const root = ensureRootShell();
    root.innerHTML = `
      <section class="service-shell-message" aria-live="polite">
        <h1 class="service-shell-title">Loading...</h1>
        <p class="service-shell-desc">서비스를 불러오고 있습니다.</p>
      </section>
    `;
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const exists = document.querySelector(`script[data-module-src="${src}"]`);
      if (exists) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = src;
      script.async = false;
      script.dataset.moduleSrc = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load module: ${src}`));
      document.body.appendChild(script);
    });
  }

  async function mountService(service) {
    for (const scriptSrc of SHARED_SCRIPTS) {
      await loadScript(scriptSrc);
    }

    if (!service || !service.module) {
      throw new Error('Service definition is invalid.');
    }

    if (service.module.type === 'legacy-page') {
      const legacyPath = service.module.entry || service.route;
      if (legacyPath && window.location.pathname !== legacyPath) {
        window.location.replace(service.route);
      }
      return;
    }

    await loadScript(service.module.entry);

    const registry = global.DunsmileModules || {};
    const mod = registry[service.id];
    if (!mod || typeof mod.mount !== 'function') {
      throw new Error(`Module mount() not found for service '${service.id}'.`);
    }

    const root = ensureRootShell();
    root.innerHTML = '';
    mod.mount(root, service);
  }

  async function boot() {
    try {
      renderLoading();

      const serviceId = getServiceId();
      if (!serviceId) {
        throw new Error('Service ID is missing.');
      }

      const services = await fetchManifest();
      const service = services.find((item) => item.id === serviceId && item.status !== 'disabled');
      if (!service) {
        throw new Error(`Service not found: ${serviceId}`);
      }

      await mountService(service);
    } catch (error) {
      renderError(String(error && error.message ? error.message : error));
    }
  }

  document.addEventListener('DOMContentLoaded', boot);
})(window);
