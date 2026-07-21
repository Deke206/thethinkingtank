(() => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const routeConfig = {
    'index.html': {
      label: 'Home',
      target: '#showcase'
    },
    'build-my-bike.html': {
      label: 'Build My Bicycle',
      target: '.builder-shell'
    },
    'build-my-auto.html': {
      label: 'Build My Auto',
      target: '.builder-shell'
    },
    'build-my-yacht.html': {
      label: 'Build My Yacht',
      target: '.builder-shell'
    },
    'catalog.html': {
      label: 'Compatible Parts Catalog',
      target: '#catalog .container, #catalog'
    },
    'contact.html': {
      label: 'Request an Installation',
      target: '.contact-panel, main'
    },
    'contact-thanks.html': {
      label: 'Request Received',
      target: '.thanks-panel, main'
    },
    'sitemap.html': {
      label: 'Site Map',
      target: 'main'
    }
  };

  const config = routeConfig[currentPage];
  const globalTheme = document.querySelector('link[href*="css/global-theme.css"]');
  if (globalTheme) globalTheme.href = 'css/global-theme.css?v=20260721-6';

  const brand = document.querySelector('.brand-lockup');
  if (brand) {
    const brandIcon = brand.querySelector('img');
    const brandLabel = brand.querySelector('span');
    if (brandIcon) {
      brandIcon.width = 40;
      brandIcon.height = 40;
    }
    if (brandLabel) brandLabel.innerHTML = 'ShyneTyme<span class="brand-dot">.</span>Works';
  }

  const requestRoutes = new Set([
    'build-my-bike.html',
    'build-my-auto.html',
    'build-my-yacht.html',
    'catalog.html',
    'contact.html'
  ]);

  const addRequestAnchor = () => {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      if (!href || href.startsWith('#') || href.includes('://') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

      const [path, hash = ''] = href.split('#');
      const fileName = path.split('/').pop();
      if (!requestRoutes.has(fileName)) return;
      if (hash === 'request-info') return;

      link.setAttribute('href', `${path}#request-info`);
    });
  };

  const installPageLocation = () => {
    if (!config || document.querySelector('.page-location-bar')) return;

    const target = document.querySelector(config.target);
    if (!target) return;

    target.id = 'request-info';
    target.setAttribute('tabindex', '-1');

    const hero = document.querySelector('.interior-hero, body.home-page > header.hero, body > header.hero');
    if (!hero) return;

    const bar = document.createElement('nav');
    bar.className = 'page-location-bar';
    bar.setAttribute('aria-label', 'Current page and content jump');
    bar.innerHTML = `
      <div class="container page-location-bar__inner">
        <span class="page-location-bar__site">ShyneTyme.Works</span>
        <span class="page-location-bar__separator" aria-hidden="true"></span>
        <a class="page-location-bar__anchor" href="#request-info">${config.label}</a>
        <span class="page-location-bar__hint">Jump to request information</span>
      </div>`;
    hero.insertAdjacentElement('afterend', bar);

    const centerRequestInfo = (behavior = 'auto') => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          target.scrollIntoView({ behavior, block: 'center', inline: 'nearest' });
          target.focus({ preventScroll: true });
        }, 60);
      });
    };

    bar.querySelector('.page-location-bar__anchor')?.addEventListener('click', (event) => {
      event.preventDefault();
      window.history.replaceState(null, '', '#request-info');
      centerRequestInfo('smooth');
    });

    if (window.location.hash === '#request-info') centerRequestInfo('auto');
  };

  addRequestAnchor();
  installPageLocation();
  window.setTimeout(() => {
    addRequestAnchor();
    installPageLocation();
  }, 120);
})();

(() => {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  document.documentElement.classList.add('force-homepage-motion');
  if (!document.getElementById('homepageMotionOverride')) {
    const motionStyle = document.createElement('style');
    motionStyle.id = 'homepageMotionOverride';
    motionStyle.textContent = `
      @media (prefers-reduced-motion: reduce) {
        html.force-homepage-motion body.home-page .nav-link::after {
          transition: transform .2s ease !important;
        }
        html.force-homepage-motion .hero-carousel__scene {
          transition: opacity 1.4s ease, visibility 1.4s step-end !important;
        }
        html.force-homepage-motion .hero-carousel__scene.is-active {
          transition: opacity 1.4s ease, visibility 0s !important;
        }
        html.force-homepage-motion .hero-carousel__scene.is-active img {
          animation: hero-scene-drift var(--scene-duration, 12000ms) ease-out both !important;
        }
        html.force-homepage-motion .hero-carousel__sparkle {
          animation: hero-stars 8s steps(4, end) infinite alternate !important;
        }
        html.force-homepage-motion .btn {
          transition: transform .16s ease, box-shadow .16s ease, filter .16s ease !important;
        }
        html.force-homepage-motion .card:hover {
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease !important;
        }
        html.force-homepage-motion body.home-page .effects-center {
          animation: story-border 14s linear infinite !important;
        }
        html.force-homepage-motion .led-storefront-sign__row span {
          animation-iteration-count: infinite !important;
        }
        html.force-homepage-motion .site-guide-button img {
          transition: transform .2s ease !important;
        }
      }
    `;
    document.head.appendChild(motionStyle);
  }

  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  if (scenes.length < 2) return;

  const previewMode = new URLSearchParams(window.location.search).has('preview');
  const sceneDuration = previewMode ? 6000 : 12000;

  let currentScene = 0;
  let timer;

  carousel.style.setProperty('--scene-duration', `${sceneDuration}ms`);

  function restartTimer() {
    window.clearTimeout(timer);
    if (document.hidden) return;
    timer = window.setTimeout(() => showScene(currentScene + 1), sceneDuration);
  }

  function showScene(index) {
    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === currentScene;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
    });

    restartTimer();
  }

  document.addEventListener('visibilitychange', restartTimer);
  showScene(0);
})();
