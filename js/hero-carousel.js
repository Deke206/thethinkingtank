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
        html.force-homepage-motion body.home-page .hero-carousel__scene {
          transition: opacity 1.4s ease, visibility 1.4s step-end !important;
        }
        html.force-homepage-motion body.home-page .hero-carousel__scene.is-active {
          transition: opacity 1.4s ease, visibility 0s !important;
        }
        html.force-homepage-motion body.home-page .hero-carousel__scene.is-active img {
          animation: hero-scene-drift var(--scene-duration, 35000ms) ease-out both !important;
        }
        html.force-homepage-motion body.home-page .hero-carousel__sparkle {
          animation: hero-stars 8s steps(4, end) infinite alternate !important;
        }
        html.force-homepage-motion body.home-page .hero-carousel.is-running .hero-carousel__progress span {
          animation: hero-progress var(--scene-duration, 35000ms) linear forwards !important;
        }
        html.force-homepage-motion body.home-page .hero-carousel__button {
          transition: transform .16s ease, color .16s ease, border-color .16s ease !important;
        }
        html.force-homepage-motion body.home-page .btn {
          transition: transform .16s ease, box-shadow .16s ease, filter .16s ease !important;
        }
        html.force-homepage-motion body.home-page .card:hover {
          transition: transform .2s ease, border-color .2s ease, box-shadow .2s ease !important;
        }
        html.force-homepage-motion body.home-page .effects-center {
          animation: story-border 14s linear infinite !important;
        }
        html.force-homepage-motion body.home-page .story-led-matrix span {
          animation: story-message 34s linear infinite !important;
        }
        html.force-homepage-motion body.home-page .story-led-matrix span:nth-child(2) {
          animation-direction: reverse !important;
          animation-duration: 41s !important;
        }
        html.force-homepage-motion body.home-page .story-led-matrix span:nth-child(3) {
          animation-duration: 37s !important;
        }
        html.force-homepage-motion body.home-page .site-guide-button img {
          transition: transform .2s ease !important;
        }
      }
    `;
    document.head.appendChild(motionStyle);
  }

  const hero = carousel.closest('.hero');
  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  const dots = [...carousel.querySelectorAll('[data-hero-slide]')];
  const previousButton = carousel.querySelector('[data-hero-prev]');
  const nextButton = carousel.querySelector('[data-hero-next]');
  const toggleButton = carousel.querySelector('[data-hero-toggle]');
  const status = carousel.querySelector('[data-hero-status]');
  const previewMode = new URLSearchParams(window.location.search).has('preview');
  const sceneDuration = previewMode ? 6500 : 35000;
  const sceneNames = [
    'After-work homecoming',
    'School-day homecoming',
    'Neighborhood dance break',
    'Marina homecoming'
  ];

  let currentScene = 0;
  let timer;
  let userPaused = false;
  let temporarilyPaused = false;

  carousel.style.setProperty('--scene-duration', `${sceneDuration}ms`);

  const canRotate = () => !userPaused && !temporarilyPaused && !document.hidden;

  function updateToggle() {
    toggleButton.textContent = userPaused ? 'Play' : 'Pause';
    toggleButton.setAttribute('aria-pressed', String(userPaused));
    toggleButton.setAttribute('aria-label', userPaused ? 'Resume scene rotation' : 'Pause scene rotation');
  }

  function restartTimer() {
    window.clearTimeout(timer);
    carousel.classList.remove('is-running');

    if (!canRotate()) return;

    // Restart the small timing bar whenever a scene begins or interaction ends.
    void carousel.offsetWidth;
    carousel.classList.add('is-running');
    timer = window.setTimeout(() => showScene(currentScene + 1), sceneDuration);
  }

  function showScene(index, announce = false) {
    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === currentScene;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
    });

    dots.forEach((dot, dotIndex) => {
      if (dotIndex === currentScene) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });

    status.textContent = `Scene ${currentScene + 1} of ${scenes.length} · ${sceneNames[currentScene]}`;
    if (announce) {
      status.setAttribute('aria-live', 'polite');
      window.setTimeout(() => status.removeAttribute('aria-live'), 1000);
    }
    restartTimer();
  }

  previousButton.addEventListener('click', () => showScene(currentScene - 1, true));
  nextButton.addEventListener('click', () => showScene(currentScene + 1, true));
  dots.forEach((dot) => dot.addEventListener('click', () => showScene(Number(dot.dataset.heroSlide), true)));

  toggleButton.addEventListener('click', () => {
    userPaused = !userPaused;
    updateToggle();
    restartTimer();
  });

  hero.addEventListener('mouseenter', () => {
    temporarilyPaused = true;
    restartTimer();
  });

  hero.addEventListener('mouseleave', () => {
    temporarilyPaused = false;
    restartTimer();
  });

  hero.addEventListener('focusin', () => {
    temporarilyPaused = true;
    restartTimer();
  });

  hero.addEventListener('focusout', (event) => {
    if (hero.contains(event.relatedTarget)) return;
    temporarilyPaused = false;
    restartTimer();
  });

  document.addEventListener('visibilitychange', restartTimer);

  updateToggle();
  showScene(0);
})();