(() => {
  'use strict';

  const navToggle = document.querySelector('.site-nav__toggle');
  const navMenu = document.getElementById('siteNavMenu');
  const dropdown = document.querySelector('.nav-dropdown');
  const dropdownToggle = document.querySelector('.nav-dropdown__toggle');
  const guideButton = document.querySelector('.site-guide-button');
  const guidePanel = document.getElementById('siteGuidePanel');
  const guideClose = document.querySelector('.site-guide-close');
  const carousel = document.getElementById('heroCarousel');

  const setNavOpen = (open) => {
    if (!navToggle || !navMenu) return;
    navMenu.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  };

  const setDropdownOpen = (open) => {
    if (!dropdown || !dropdownToggle) return;
    dropdown.classList.toggle('is-open', open);
    dropdownToggle.setAttribute('aria-expanded', String(open));
  };

  navToggle?.addEventListener('click', () => {
    setNavOpen(!navMenu?.classList.contains('is-open'));
  });

  dropdownToggle?.addEventListener('click', () => {
    setDropdownOpen(!dropdown?.classList.contains('is-open'));
  });

  document.addEventListener('click', (event) => {
    if (dropdown && !dropdown.contains(event.target)) setDropdownOpen(false);
    if (navMenu && navToggle && !navMenu.contains(event.target) && !navToggle.contains(event.target)) {
      setNavOpen(false);
    }
  });

  const setGuideOpen = (open) => {
    if (!guideButton || !guidePanel) return;
    guidePanel.hidden = !open;
    guideButton.setAttribute('aria-expanded', String(open));
    if (open) guidePanel.querySelector('a')?.focus();
  };

  guideButton?.addEventListener('click', () => setGuideOpen(Boolean(guidePanel?.hidden)));
  guideClose?.addEventListener('click', () => {
    setGuideOpen(false);
    guideButton?.focus();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    setDropdownOpen(false);
    setNavOpen(false);
    if (guidePanel && !guidePanel.hidden) {
      setGuideOpen(false);
      guideButton?.focus();
    }
  });

  if (!carousel) return;

  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  if (scenes.length < 2) return;

  const sceneDuration = 12000;
  let currentScene = 0;
  let timer = 0;

  const showScene = (index) => {
    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === currentScene;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));
    });

    window.clearTimeout(timer);
    if (!document.hidden) timer = window.setTimeout(() => showScene(currentScene + 1), sceneDuration);
  };

  document.addEventListener('visibilitychange', () => {
    window.clearTimeout(timer);
    if (!document.hidden) showScene(currentScene);
  });

  showScene(0);
})();
