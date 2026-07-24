(() => {
  "use strict";

  const carousel = document.getElementById("heroCarousel");
  if (!carousel) return;

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/hero-carousel.js", window.location.href);
  const fallbackUrl = new URL("../assets/images/shynetyme-works-hero.webp", scriptUrl).href;
  const scenes = [...carousel.querySelectorAll(".hero-carousel__scene")];
  if (!scenes.length) return;

  const repairImage = (image) => {
    if (!image || image.dataset.heroFallback === "true") return;
    image.dataset.heroFallback = "true";
    image.alt = "";
    image.src = fallbackUrl;
  };

  scenes.forEach((scene) => {
    const image = scene.querySelector("img");
    if (!image) return;

    image.alt = "";
    image.addEventListener("error", () => repairImage(image));
    if (image.complete && image.naturalWidth === 0) repairImage(image);
  });

  if (scenes.length < 2) return;

  const sceneDuration = 5500;
  let currentScene = 0;
  let timer = 0;

  const scheduleNextScene = () => {
    window.clearTimeout(timer);
    if (document.hidden) return;
    timer = window.setTimeout(() => showScene(currentScene + 1), sceneDuration);
  };

  const showScene = (index) => {
    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === currentScene;
      scene.classList.toggle("is-active", active);
      scene.setAttribute("aria-hidden", String(!active));
    });

    scheduleNextScene();
  };

  document.addEventListener("visibilitychange", scheduleNextScene);
  window.addEventListener("pagehide", () => window.clearTimeout(timer));
  showScene(0);
})();
