(() => {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  if (scenes.length < 2) return;

  const sceneDuration = 8000;
  let currentScene = 0;
  let timer;

  carousel.style.setProperty('--scene-duration', `${sceneDuration}ms`);

  function scheduleNextScene() {
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

    scheduleNextScene();
  }

  document.addEventListener('visibilitychange', scheduleNextScene);
  showScene(0);
})();
