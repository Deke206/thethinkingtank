(() => {
  "use strict";

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const motionCssUrl = new URL("css/site-motion.css?v=20260723-real-chuck-frames", siteRoot).href;
  const heroCssUrl = new URL("css/site-hero.css?v=20260724-clean-shared-hero", siteRoot).href;
  const matrixCssUrl = new URL("css/site-led-matrix.css?v=20260724-performance-cleanup", siteRoot).href;
  const navigationCssUrl = new URL("css/site-navigation.css?v=20260724-build-dropdown-flare", siteRoot).href;
  const matrixScriptUrl = new URL("js/site-led-matrix.js?v=20260724-performance-cleanup", siteRoot).href;
  const chuckComponentUrl = new URL("js/about-deke-chuck.js?v=20260724-bottom-only-chuck", siteRoot).href;
  const bikeBuilderUpgradeUrl = new URL("js/bike-builder-upgrade.js?v=20260723-liveview-upgrade", siteRoot).href;
  const bikeBuilderSizeHotfixUrl = new URL("js/bike-builder-size-hotfix.js?v=20260724-primary-only-small-frames", siteRoot).href;
  const bikeBuilderUrl = new URL("build-my-bike.html", siteRoot).href;
  const homeBuilderUrl = new URL("build-my-home.html", siteRoot).href;
  const aboutDekeUrl = new URL("aboutmeDeke/", siteRoot).href;

  const loadSharedStylesheet = (href, dataAttribute) => {
    const existing = document.querySelector(`link[${dataAttribute}]`);
    if (existing) {
      if (existing.href !== href) existing.href = href;
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(dataAttribute, "true");
    document.head.appendChild(link);
  };

  const loadSharedStyles = () => {
    loadSharedStylesheet(motionCssUrl, "data-shynetyme-motion");
    loadSharedStylesheet(heroCssUrl, "data-shynetyme-hero");
    loadSharedStylesheet(matrixCssUrl, "data-shynetyme-led-matrix");
    loadSharedStylesheet(navigationCssUrl, "data-shynetyme-navigation");
  };

  const loadSiteLedMatrix = () => {
    if (window.ShynetymeLedMatrix) {
      window.ShynetymeLedMatrix.init();
      return;
    }

    const existing = document.querySelector("script[data-shynetyme-led-matrix]");
    if (existing) {
      existing.addEventListener("load", () => window.ShynetymeLedMatrix?.init(), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = matrixScriptUrl;
    script.defer = true;
    script.dataset.shynetymeLedMatrix = "true";
    script.addEventListener("load", () => window.ShynetymeLedMatrix?.init(), { once: true });
    document.head.appendChild(script);
  };

  const loadSitewideChuck = () => {
    if (window.ShynetymeChuck?.mounted || document.querySelector("script[data-shynetyme-chuck-component]")) return;

    const script = document.createElement("script");
    script.src = chuckComponentUrl;
    script.defer = true;
    script.dataset.shynetymeChuckComponent = "true";
    document.body.appendChild(script);
  };

  const loadBikeBuilderSizeHotfix = () => {
    if (document.querySelector("script[data-bike-builder-size-hotfix]")) return;

    const script = document.createElement("script");
    script.src = bikeBuilderSizeHotfixUrl;
    script.defer = true;
    script.dataset.bikeBuilderSizeHotfix = "true";
    document.body.appendChild(script);
  };

  const loadBikeBuilderUpgrade = () => {
    if (!document.getElementById("bikeBuilderForm")) return;

    const existing = document.querySelector("script[data-bike-builder-upgrade]");
    if (existing) {
      if (window.ShynetymeBikeBuilderRenderer) loadBikeBuilderSizeHotfix();
      else existing.addEventListener("load", loadBikeBuilderSizeHotfix, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = bikeBuilderUpgradeUrl;
    script.defer = true;
    script.dataset.bikeBuilderUpgrade = "true";
    script.addEventListener("load", loadBikeBuilderSizeHotfix, { once: true });
    document.body.appendChild(script);
  };

  const getPageKey = () => {
    const fileName = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    return fileName.toLowerCase();
  };

  const pageLabels = {
    "build-my-bike.html": "Bike Builder",
    "build-my-home.html": "Home Builder",
    "led-catalog.html": "LED Catalog",
    "contact.html": "Request Install"
  };

  const directAnchor = (element) => {
    if (element?.matches("a, button")) return element;
    return element?.querySelector(":scope > a, :scope > button") || null;
  };

  const isEffectsNavigationItem = (element) => {
    const link = directAnchor(element);
    if (!link) return false;
    const label = link.textContent.trim().toLowerCase();
    const href = link.getAttribute("href") || "";
    return label === "effects" || href.includes("#effects");
  };

  const isStandaloneBuilderItem = (element) => {
    if (element?.matches("[data-shynetyme-build-menu]")) return true;
    const link = directAnchor(element);
    if (!link) return false;
    const label = link.textContent.trim().toLowerCase();
    const href = link.getAttribute("href") || "";
    return label === "build" || href.includes("build-my-bike") || href.includes("build-my-home");
  };

  const installBuildDropdown = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav) return;

    const originalChildren = [...nav.children];
    const firstBuildIndex = originalChildren.findIndex(isStandaloneBuilderItem);
    const followingKeptItem = firstBuildIndex >= 0
      ? originalChildren.slice(firstBuildIndex + 1).find((child) => !isEffectsNavigationItem(child) && !isStandaloneBuilderItem(child))
      : originalChildren.find((child) => !isEffectsNavigationItem(child));

    originalChildren.forEach((child) => {
      if (isEffectsNavigationItem(child) || isStandaloneBuilderItem(child)) child.remove();
    });

    const pageKey = getPageKey();
    const bikeActive = pageKey === "build-my-bike.html";
    const homeActive = pageKey === "build-my-home.html";
    const buildActive = bikeActive || homeActive;

    const dropdown = document.createElement("div");
    dropdown.className = "nav-item dropdown shynetyme-build-menu";
    dropdown.dataset.shynetymeBuildMenu = "true";
    dropdown.innerHTML = `
      <button class="nav-link dropdown-toggle${buildActive ? " active" : ""}" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Open Build menu">
        Build
      </button>
      <ul class="dropdown-menu dropdown-menu-dark" aria-label="Build pages">
        <li><a class="dropdown-item${bikeActive ? " active" : ""}"${bikeActive ? " aria-current=\"page\"" : ""} href="${bikeBuilderUrl}">Bike Builder</a></li>
        <li><a class="dropdown-item${homeActive ? " active" : ""}"${homeActive ? " aria-current=\"page\"" : ""} href="${homeBuilderUrl}">Home Builder</a></li>
      </ul>`;

    nav.insertBefore(dropdown, followingKeptItem?.isConnected ? followingKeptItem : null);
  };

  const insertAboutDekeLinks = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    const hasAboutLink = nav && [...nav.querySelectorAll("a")].some((item) => {
      const label = item.textContent.trim().toLowerCase();
      const href = item.getAttribute("href") || "";
      return label === "about deke" || href.toLowerCase().includes("aboutmedeke");
    });

    if (nav && !hasAboutLink) {
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = aboutDekeUrl;
      link.textContent = "About Deke";
      link.dataset.aboutDekeLink = "true";

      const contactLink = [...nav.children].find((item) => directAnchor(item)?.getAttribute("href")?.includes("contact"));
      nav.insertBefore(link, contactLink || null);
    }

    const footerRow = document.querySelector("footer .container");
    const footerLinks = footerRow?.querySelector("span:last-child");

    if (footerLinks && !footerLinks.querySelector("[data-about-deke-link]") && ![...footerLinks.querySelectorAll("a")].some((item) => item.textContent.trim().toLowerCase() === "about deke")) {
      footerLinks.append(document.createTextNode(" · "));
      const footerLink = document.createElement("a");
      footerLink.href = aboutDekeUrl;
      footerLink.textContent = "About Deke";
      footerLink.dataset.aboutDekeLink = "true";
      footerLinks.appendChild(footerLink);
    }
  };

  const insertBreadcrumbTicker = () => {
    const pageKey = getPageKey();
    const isHome = document.body.classList.contains("home-page") || pageKey === "index.html";
    if (isHome || document.querySelector(".breadcrumb-ticker")) return;

    const currentLabel = pageLabels[pageKey] || document.title.split("|")[0].trim() || "Current Page";
    const ticker = document.createElement("nav");
    ticker.className = "breadcrumb-ticker";
    ticker.setAttribute("aria-label", "Breadcrumb");
    ticker.innerHTML = `<div class="breadcrumb-ticker__rail"><ol class="breadcrumb-ticker__list"><li class="breadcrumb-ticker__item"><a href="${new URL("index.html", siteRoot).href}">Home</a></li><li class="breadcrumb-ticker__item"><span aria-current="page">${currentLabel}</span></li></ol></div>`;

    const banner = document.querySelector("header");
    if (banner) banner.insertAdjacentElement("afterend", ticker);
    else document.querySelector("main")?.insertAdjacentElement("beforebegin", ticker);
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

  loadSharedStyles();
  installBuildDropdown();
  insertAboutDekeLinks();
  insertBreadcrumbTicker();
  bindNavigationFlare();
  loadSiteLedMatrix();
  loadBikeBuilderUpgrade();
  loadSitewideChuck();
})();
