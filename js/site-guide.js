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
    ["css/site-led-matrix.css", "data-shynetyme-led-matrix"],
    ["css/site-chuck.css", "data-shynetyme-site-chuck"]
  ];

  const loadStyle = ([path, attribute]) => {
    if (document.querySelector(`link[${attribute}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = new URL(path, siteRoot).href;
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
  const aboutDekeUrl = new URL("aboutme.html", siteRoot).href;
  const directAnchor = (element) => element?.matches("a, button") ? element : element?.querySelector(":scope > a, :scope > button");

  const installBuildDropdown = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav) return;
    const children = [...nav.children];
    const isEffects = (item) => {
      const link = directAnchor(item);
      return link && (link.textContent.trim().toLowerCase() === "effects" || (link.getAttribute("href") || "").includes("#effects"));
    };
    const isBuild = (item) => {
      if (item.matches?.("[data-shynetyme-build-menu]")) return true;
      const link = directAnchor(item);
      const href = link?.getAttribute("href") || "";
      return link && (link.textContent.trim().toLowerCase() === "build" || href.includes("build-my-bike") || href.includes("build-my-home"));
    };
    const firstBuild = children.findIndex(isBuild);
    const following = firstBuild >= 0 ? children.slice(firstBuild + 1).find((item) => !isEffects(item) && !isBuild(item)) : children.find((item) => !isEffects(item));
    children.forEach((item) => { if (isEffects(item) || isBuild(item)) item.remove(); });

    const page = getPageKey();
    const bikeActive = page === "build-my-bike.html";
    const homeActive = page === "build-my-home.html";
    const dropdown = document.createElement("div");
    dropdown.className = "nav-item dropdown shynetyme-build-menu";
    dropdown.dataset.shynetymeBuildMenu = "true";
    dropdown.innerHTML = `<button class="nav-link dropdown-toggle${bikeActive || homeActive ? " active" : ""}" type="button" data-bs-toggle="dropdown" aria-expanded="false">Build</button><ul class="dropdown-menu dropdown-menu-dark"><li><a class="dropdown-item${bikeActive ? " active" : ""}" href="${bikeBuilderUrl}">Bike Builder</a></li><li><a class="dropdown-item${homeActive ? " active" : ""}" href="${homeBuilderUrl}">Home Builder</a></li></ul>`;
    nav.insertBefore(dropdown, following?.isConnected ? following : null);
  };

  const insertAboutLink = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav) return;
    const exists = [...nav.querySelectorAll("a")].some((link) => link.textContent.trim().toLowerCase() === "about deke" || (link.getAttribute("href") || "").includes("aboutme.html"));
    if (exists) return;
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = aboutDekeUrl;
    link.textContent = "About Deke";
    const contact = [...nav.children].find((item) => (directAnchor(item)?.getAttribute("href") || "").includes("contact"));
    nav.insertBefore(link, contact || null);
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
  installBuildDropdown();
  insertAboutLink();
  bindNavigationFlare();
  loadScript("js/hero-carousel.js", "data-shynetyme-hero-carousel", "ShynetymeHeroCarousel")
    .finally(() => loadScript("js/site-led-matrix.js", "data-shynetyme-led-matrix-script", "ShynetymeLedMatrix"));
  loadBikeBuilder();
  loadScript("js/site-chuck.js", "data-shynetyme-site-chuck-script", "ShynetymeChuck");
})();
