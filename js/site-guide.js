(() => {
  "use strict";

  if (window.ShynetymeSiteGuide?.initialized) return;
  window.ShynetymeSiteGuide = { initialized: true };

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const sharedStyles = [
    ["css/site-motion.css", "data-shynetyme-motion"],
    ["css/site-navigation.css", "data-shynetyme-navigation"],
    ["css/site-hero.css", "data-shynetyme-hero"],
    ["css/site-led-matrix.css?v=20260724-short-matrix", "data-shynetyme-led-matrix"],
    ["css/site-chuck.css?v=20260724-cloud-guidance", "data-shynetyme-site-chuck"],
    ["css/site-chuck-cloud.css?v=20260725-neon-position-v2", "data-shynetyme-site-chuck-cloud"]
  ];

  const loadStyle = ([path, attribute]) => {
    const existing = document.querySelector(`link[${attribute}]`);
    const href = new URL(path, siteRoot).href;
    if (existing) {
      if (existing.href !== href) existing.href = href;
      return;
    }
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(attribute, "true");
    document.head.appendChild(link);
  };

  const loadScript = (path, attribute, globalName) => new Promise((resolve) => {
    const globalObject = window[globalName];
    if (globalObject) {
      globalObject.init?.();
      resolve(globalObject);
      return;
    }

    const existing = document.querySelector(`script[${attribute}]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window[globalName] || null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = new URL(path, siteRoot).href;
    script.defer = true;
    script.setAttribute(attribute, "true");
    script.addEventListener("load", () => resolve(window[globalName] || null), { once: true });
    document.head.appendChild(script);
  });

  const getPageKey = () => (window.location.pathname.split("/").filter(Boolean).pop() || "index.html").toLowerCase();
  const bikeBuilderUrl = new URL("build-my-bike.html", siteRoot).href;
  const homeBuilderUrl = new URL("build-my-home.html", siteRoot).href;
  const catalogUrl = new URL("led-catalog.html", siteRoot).href;
  const aboutDekeUrl = new URL("aboutme.html", siteRoot).href;
  const contactUrl = new URL("contact.html", siteRoot).href;

  const installNavigation = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav) return;

    const page = getPageKey();
    const bikeActive = page === "build-my-bike.html";
    const homeActive = page === "build-my-home.html";
    const catalogActive = page === "led-catalog.html";
    const aboutActive = page === "aboutme.html";
    const contactActive = page === "contact.html";

    nav.innerHTML = `
      <div class="nav-item dropdown shynetyme-build-menu" data-shynetyme-build-menu="true">
        <button class="nav-link dropdown-toggle${bikeActive || homeActive ? " active" : ""}" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Open Sim menu">Sim</button>
        <ul class="dropdown-menu dropdown-menu-dark" aria-label="LED simulator pages">
          <li><a class="dropdown-item${bikeActive ? " active" : ""}"${bikeActive ? " aria-current=\"page\"" : ""} href="${bikeBuilderUrl}">LED SIM BIKE</a></li>
          <li><a class="dropdown-item${homeActive ? " active" : ""}"${homeActive ? " aria-current=\"page\"" : ""} href="${homeBuilderUrl}">LED SIM HOME</a></li>
        </ul>
      </div>
      <a class="nav-link${catalogActive ? " active" : ""}"${catalogActive ? " aria-current=\"page\"" : ""} href="${catalogUrl}">LED Catalog</a>
      <a class="nav-link${aboutActive ? " active" : ""}"${aboutActive ? " aria-current=\"page\"" : ""} href="${aboutDekeUrl}">About Deke</a>
      <a class="nav-link${contactActive ? " active" : ""}"${contactActive ? " aria-current=\"page\"" : ""} href="${contactUrl}">Request Install</a>`;
  };

  const bindNavigationFlare = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav || nav.dataset.navigationFlareBound === "true") return;
    nav.dataset.navigationFlareBound = "true";
    nav.addEventListener("click", (event) => {
      const target = event.target.closest(".nav-link, .dropdown-item");
      if (!target || !nav.contains(target)) return;
      target.classList.remove("nav-link--flare-click");
      void target.offsetWidth;
      target.classList.add("nav-link--flare-click");
      window.setTimeout(() => target.classList.remove("nav-link--flare-click"), 620);
    });
  };

  const loadBikeBuilder = () => {
    if (!document.getElementById("bikeBuilderForm")) return;
    loadScript("js/bike-builder-upgrade.js", "data-bike-builder-upgrade", "ShynetymeBikeBuilderRenderer")
      .finally(() => loadScript("js/bike-builder-size-hotfix.js", "data-bike-builder-size-hotfix", "ShynetymeBikeBuilderSizeHotfix"));
  };

  sharedStyles.forEach(loadStyle);
  installNavigation();
  bindNavigationFlare();
  loadScript("js/hero-carousel.js", "data-shynetyme-hero-carousel", "ShynetymeHeroCarousel")
    .finally(() => loadScript("js/site-led-matrix.js", "data-shynetyme-led-matrix-script", "ShynetymeLedMatrix"));
  loadBikeBuilder();
  loadScript("js/site-chuck.js?v=20260725-neon-position-v2", "data-shynetyme-site-chuck-script", "ShynetymeChuck");
})();