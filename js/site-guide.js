(() => {
  const interactionStylesHref = 'css/site-interactions.css?v=20260722-nav-breadcrumb';

  const ensureInteractionStyles = () => {
    const alreadyLoaded = [...document.styleSheets].some((sheet) => sheet.href?.includes('site-interactions.css'));
    if (alreadyLoaded || document.querySelector('link[href*="site-interactions.css"]')) return;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = interactionStylesHref;
    document.head.appendChild(link);
  };

  const getPageKey = () => {
    const fileName = window.location.pathname.split('/').filter(Boolean).pop() || 'index.html';
    return fileName.toLowerCase();
  };

  const pageLabels = {
    'build-my-bike.html': 'Build',
    'led-catalog.html': 'LED Catalog'
  };

  const insertBreadcrumbTicker = () => {
    const pageKey = getPageKey();
    const isHome = document.body.classList.contains('home-page') || pageKey === 'index.html';
    if (isHome || document.querySelector('.breadcrumb-ticker')) return;

    const currentLabel = pageLabels[pageKey] || document.title.split('|')[0].trim() || 'Current Page';
    const ticker = document.createElement('nav');
    ticker.className = 'breadcrumb-ticker';
    ticker.setAttribute('aria-label', 'Breadcrumb');
    ticker.innerHTML = `
      <div class="breadcrumb-ticker__rail">
        <ol class="breadcrumb-ticker__list">
          <li class="breadcrumb-ticker__item"><a href="index.html">Home</a></li>
          <li class="breadcrumb-ticker__item"><span aria-current="page">${currentLabel}</span></li>
        </ol>
      </div>
    `;

    const banner = document.querySelector('header');
    if (banner) {
      banner.insertAdjacentElement('afterend', ticker);
      return;
    }

    document.querySelector('main')?.insertAdjacentElement('beforebegin', ticker);
  };

  const bindNavigationFlare = () => {
    document.querySelectorAll('.navbar .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        link.classList.remove('nav-link--flare-click');
        void link.offsetWidth;
        link.classList.add('nav-link--flare-click');
        window.setTimeout(() => link.classList.remove('nav-link--flare-click'), 560);
      });
    });
  };

  ensureInteractionStyles();
  insertBreadcrumbTicker();
  bindNavigationFlare();

  const button = document.querySelector('.site-guide-button');
  const panel = document.getElementById('siteGuidePanel');
  const close = panel?.querySelector('.site-guide-close');
  if (!button || !panel || !close) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute('aria-expanded', String(open));
    if (open) panel.querySelector('a')?.focus();
  };

  button.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => { setOpen(false); button.focus(); });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !panel.hidden) { setOpen(false); button.focus(); }
  });
})();
