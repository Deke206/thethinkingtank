(() => {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  const hero = carousel.closest('.hero');
  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  const dots = [...carousel.querySelectorAll('[data-hero-slide]')];
  const previousButton = carousel.querySelector('[data-hero-prev]');
  const nextButton = carousel.querySelector('[data-hero-next]');
  const toggleButton = carousel.querySelector('[data-hero-toggle]');
  const status = carousel.querySelector('[data-hero-status]');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
  let userPaused = reducedMotion.matches;
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
  reducedMotion.addEventListener('change', (event) => {
    userPaused = event.matches;
    updateToggle();
    restartTimer();
  });

  updateToggle();
  showScene(0);
})();
