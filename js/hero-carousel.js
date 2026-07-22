(() => {
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

  const removeInjectedAnchors = () => {
    document.querySelectorAll('a[href$="#request-info"]').forEach((link) => {
      const href = link.getAttribute('href') || '';
      const cleanHref = href.replace(/#request-info$/, '');
      if (cleanHref) link.setAttribute('href', cleanHref);
      else link.removeAttribute('href');
    });

    document.querySelector('.page-location-bar')?.remove();
    document.getElementById('request-info')?.remove();

    if (window.location.hash === '#request-info') {
      window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}`);
    }
  };

  removeInjectedAnchors();
  window.setTimeout(removeInjectedAnchors, 120);
})();

(() => {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  document.documentElement.classList.add('force-homepage-motion', 'force-site-motion');
  if (!document.getElementById('homepageMotionOverride')) {
    const motionStyle = document.createElement('style');
    motionStyle.id = 'homepageMotionOverride';
    motionStyle.textContent = `
      @keyframes shyne-story-dot-drift {
        0% { background-position: 0 0; opacity: .18; }
        50% { opacity: .34; }
        100% { background-position: 80px 48px; opacity: .18; }
      }

      @keyframes shyne-shared-panel-border {
        to { background-position: 0 0, 320% 0; }
      }

      html.force-site-motion body.home-page .shynetyme-story::before {
        animation: shyne-story-dot-drift 18s linear infinite;
        will-change: background-position, opacity;
      }

      html.force-site-motion body.home-page .story-led-matrix span {
        animation-play-state: running;
        will-change: transform;
      }

      html.force-site-motion .preview-card.card,
      html.force-site-motion .summary-box,
      html.force-site-motion .catalog-page #catalog > .container,
      html.force-site-motion .contact-panel,
      html.force-site-motion .map-panel,
      html.force-site-motion .thanks-panel {
        background-size: auto, 320% 100% !important;
        background-position: 0 0, 0 0;
        animation: shyne-shared-panel-border 14s linear infinite !important;
        will-change: background-position;
      }

      @media (max-width: 767.98px) {
        html.force-site-motion body.home-page .effects-center {
          animation: story-border 14s linear infinite !important;
        }

        html.force-site-motion body.home-page .shynetyme-story::before {
          animation: shyne-story-dot-drift 18s linear infinite !important;
        }

        html.force-site-motion body.home-page .story-led-matrix span {
          animation: story-message 34s linear infinite !important;
        }

        html.force-site-motion body.home-page .story-led-matrix span:nth-child(2) {
          animation-direction: reverse !important;
          animation-duration: 41s !important;
        }

        html.force-site-motion body.home-page .story-led-matrix span:nth-child(3) {
          animation-duration: 37s !important;
        }
      }

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
        html.force-homepage-motion .hero-led-storefront .led-storefront-sign__frame {
          animation: led-panel-border-flow 14s linear infinite !important;
        }
        html.force-homepage-motion .btn {
          transition: transform .16s ease, box-shadow .16s ease, filter .16s ease !important;
        }
        html.force-homepage-motion .card:hover {
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease !important;
        }
        html.force-site-motion body.home-page .effects-center {
          animation: story-border 14s linear infinite !important;
        }
        html.force-site-motion body.home-page .shynetyme-story::before {
          animation: shyne-story-dot-drift 18s linear infinite !important;
        }
        html.force-site-motion body.home-page .story-led-matrix span {
          animation: story-message 34s linear infinite !important;
        }
        html.force-site-motion body.home-page .story-led-matrix span:nth-child(2) {
          animation-direction: reverse !important;
          animation-duration: 41s !important;
        }
        html.force-site-motion body.home-page .story-led-matrix span:nth-child(3) {
          animation-duration: 37s !important;
        }
        html.force-homepage-motion .led-storefront-sign__row span {
          animation-iteration-count: infinite !important;
        }
        html.force-homepage-motion .site-guide-button img {
          transition: transform .2s ease !important;
        }
        html.force-site-motion .preview-card.card,
        html.force-site-motion .summary-box,
        html.force-site-motion .catalog-page #catalog > .container,
        html.force-site-motion .contact-panel,
        html.force-site-motion .map-panel,
        html.force-site-motion .thanks-panel {
          animation: shyne-shared-panel-border 14s linear infinite !important;
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
