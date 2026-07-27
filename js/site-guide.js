(() => {
  "use strict";

  if (window.ShynetymeSiteGuide?.initialized) return;
  window.ShynetymeSiteGuide = { initialized: true };

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  const sharedRevision = scriptUrl.searchParams.get("v") || "shared-ui-9";
  const withRevision = (path) => {
    const url = new URL(path, siteRoot);
    url.searchParams.set("v", sharedRevision);
    return url.href;
  };

  const sharedStyles = [
    ["css/site-motion.css", "data-shynetyme-motion"],
    ["css/site-navigation.css", "data-shynetyme-navigation"],
    ["css/site-hero.css", "data-shynetyme-hero"],
    ["css/site-chuck.css", "data-shynetyme-site-chuck"],
    ["css/site-chuck-cloud.css", "data-shynetyme-site-chuck-cloud"]
  ];

  const loadStyle = ([path, attribute]) => {
    const existing = document.querySelector(`link[${attribute}]`);
    const href = withRevision(path);
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
    script.src = withRevision(path);
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

  const getPageUrl = () => {
    const canonical = document.querySelector('link[rel="canonical"]')?.href;
    const url = new URL(canonical || window.location.href);
    url.hash = "";
    return url;
  };

  const getSpanishTranslationUrl = () => {
    const url = new URL("https://translate.google.com/translate");
    url.searchParams.set("sl", "auto");
    url.searchParams.set("tl", "es");
    url.searchParams.set("u", getPageUrl().href);
    return url.href;
  };

  const installBrandLockup = () => {
    document.querySelectorAll(".brand-lockup").forEach((brand) => {
      const textNode = brand.querySelector("span");
      if (textNode) textNode.innerHTML = "ShyneTyme.<em>Works</em>";
      brand.setAttribute("aria-label", "ShyneTyme.Works");
      brand.setAttribute("title", "ShyneTyme.Works");
    });
  };

  const installNavigation = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav) return;

    const navbar = nav.closest("nav");
    if (navbar && !navbar.hasAttribute("aria-label")) navbar.setAttribute("aria-label", "Primary navigation");

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
      <a class="nav-link${catalogActive ? " active" : ""}"${catalogActive ? " aria-current=\"page\"" : ""} href="${catalogUrl}">Catalog</a>
      <a class="nav-link${aboutActive ? " active" : ""}"${aboutActive ? " aria-current=\"page\"" : ""} href="${aboutDekeUrl}">About Deke</a>
      <a class="nav-link${contactActive ? " active" : ""}"${contactActive ? " aria-current=\"page\"" : ""} href="${contactUrl}">Contact</a>
      <div class="nav-item dropdown shynetyme-language-menu" data-shynetyme-language-menu="true">
        <button class="nav-link dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Change language">Language</button>
        <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-end" aria-label="Choose page language">
          <li><a class="dropdown-item active" aria-current="page" href="${getPageUrl().href}" hreflang="en" lang="en">English</a></li>
          <li><a class="dropdown-item" href="${getSpanishTranslationUrl()}" hreflang="es" lang="es" rel="nofollow">Español</a></li>
        </ul>
      </div>`;
  };

  const loadBikeBuilder = () => {
    if (!document.getElementById("bikeBuilderForm")) return;
    loadScript("js/bike-builder-upgrade.js", "data-bike-builder-upgrade", "ShynetymeBikeBuilderRenderer")
      .finally(() => loadScript("js/bike-builder-size-hotfix.js", "data-bike-builder-size-hotfix", "ShynetymeBikeBuilderSizeHotfix"));
  };

  document.documentElement.lang = document.documentElement.lang || "en";
  sharedStyles.forEach(loadStyle);
  installBrandLockup();
  installNavigation();
  loadBikeBuilder();
  loadScript("js/site-chuck.js", "data-shynetyme-site-chuck-script", "ShynetymeChuck");
})();
