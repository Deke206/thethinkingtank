(() => {
  "use strict";

  if (window.ShynetymeHeroCarousel?.initialized) {
    window.ShynetymeHeroCarousel.init();
    return;
  }

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/hero-carousel.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  const fallbackUrl = new URL("assets/images/shynetyme-works-hero.webp", siteRoot).href;
  const slides = [
    ["hero-scene-work.webp", "After-work homecoming"],
    ["hero-scene-school.webp", "School-day homecoming"],
    ["hero-scene-dance.webp", "Neighborhood dance break"],
    ["hero-scene-marina.webp", "Marina homecoming"]
  ];
  const timers = new Set();

  const buildCarousel = (hero) => {
    hero.querySelectorAll(":scope > .hero-carousel, :scope > .home-builder-hero__scene").forEach((node) => node.remove());

    const carousel = document.createElement("div");
    carousel.className = "hero-carousel";
    carousel.id = "heroCarousel";
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "ShyneTyme community scenes");

    slides.forEach(([fileName, label], index) => {
      const scene = document.createElement("div");
      scene.className = `hero-carousel__scene${index === 0 ? " is-active" : ""}`;
      scene.setAttribute("role", "group");
      scene.setAttribute("aria-roledescription", "slide");
      scene.setAttribute("aria-label", `${index + 1} of ${slides.length}: ${label}`);
      scene.setAttribute("aria-hidden", String(index !== 0));

      const image = document.createElement("img");
      image.src = new URL(`assets/images/${fileName}`, siteRoot).href;
      image.width = 1600;
      image.height = 900;
      image.alt = "";
      if (index === 0) image.fetchPriority = "high";
      else image.loading = "lazy";
      image.addEventListener("error", () => {
        if (image.dataset.heroFallback === "true") return;
        image.dataset.heroFallback = "true";
        image.src = fallbackUrl;
      });

      scene.appendChild(image);
      carousel.appendChild(scene);
    });

    hero.prepend(carousel);
    return carousel;
  };

  const startCarousel = (hero) => {
    if (hero.dataset.siteCarouselReady === "true") return;
    hero.dataset.siteCarouselReady = "true";
    const carousel = buildCarousel(hero);
    const scenes = [...carousel.querySelectorAll(".hero-carousel__scene")];
    let current = 0;
    let timer = 0;

    const schedule = () => {
      window.clearTimeout(timer);
      timers.delete(timer);
      if (document.hidden) return;
      timer = window.setTimeout(() => show(current + 1), 5500);
      timers.add(timer);
    };

    const show = (index) => {
      current = (index + scenes.length) % scenes.length;
      scenes.forEach((scene, sceneIndex) => {
        const active = sceneIndex === current;
        scene.classList.toggle("is-active", active);
        scene.setAttribute("aria-hidden", String(!active));
      });
      schedule();
    };

    document.addEventListener("visibilitychange", schedule);
    schedule();
  };

  const init = () => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
      return;
    }
    document.querySelectorAll("header.hero").forEach(startCarousel);
  };

  window.addEventListener("pagehide", () => {
    timers.forEach((timer) => window.clearTimeout(timer));
    timers.clear();
  });
  window.ShynetymeHeroCarousel = { initialized: true, init };
  init();
})();
