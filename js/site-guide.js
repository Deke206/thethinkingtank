(() => {
  "use strict";

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src
    ? new URL(scriptElement.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);

  const motionCssUrl = new URL("css/site-motion.css?v=20260723-real-chuck-frames", siteRoot).href;
  const heroCssUrl = new URL("css/site-hero.css?v=20260724-bright-carousel-repair", siteRoot).href;
  const chuckCssUrl = new URL("css/about-deke-chuck.css?v=20260724-sitewide-chuck-200", siteRoot).href;
  const chuckComponentUrl = new URL("js/about-deke-chuck.js?v=20260724-restored-sitewide-chuck", siteRoot).href;
  const bikeBuilderUpgradeUrl = new URL("js/bike-builder-upgrade.js?v=20260723-liveview-upgrade", siteRoot).href;
  const bikeBuilderSizeHotfixUrl = new URL("js/bike-builder-size-hotfix.js?v=20260724-primary-only-small-frames", siteRoot).href;
  const aboutDekeUrl = new URL("aboutmeDeke/", siteRoot).href;
  const homeBuilderUrl = new URL("build-my-home.html", siteRoot).href;

  const loadSharedStylesheet = (href, dataAttribute) => {
    if (document.querySelector(`link[${dataAttribute}]`)) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute(dataAttribute, "true");
    document.head.appendChild(link);
  };

  const loadSharedStyles = () => {
    loadSharedStylesheet(motionCssUrl, "data-shynetyme-motion");
    loadSharedStylesheet(heroCssUrl, "data-shynetyme-hero");
    loadSharedStylesheet(chuckCssUrl, "data-shynetyme-chuck");
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
    "build-my-bike.html": "Build",
    "build-my-home.html": "Home Builder",
    "led-catalog.html": "LED Catalog",
    "contact.html": "Request Install"
  };

  const insertHomeBuilderLinks = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (!nav || [...nav.querySelectorAll("a")].some((item) => item.getAttribute("href")?.includes("build-my-home"))) return;
    const link = document.createElement("a");
    link.className = "nav-link";
    link.href = homeBuilderUrl;
    link.textContent = "Home Builder";
    link.dataset.homeBuilderLink = "true";
    const bikeLink = [...nav.querySelectorAll("a")].find((item) => item.getAttribute("href")?.includes("build-my-bike"));
    nav.insertBefore(link, bikeLink?.nextSibling || null);
  };

  const insertAboutDekeLinks = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (nav && !nav.querySelector("[data-about-deke-link]")) {
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = aboutDekeUrl;
      link.textContent = "About Deke";
      link.dataset.aboutDekeLink = "true";
      const contactLink = [...nav.querySelectorAll("a")].find((item) => item.getAttribute("href")?.includes("contact"));
      nav.insertBefore(link, contactLink || null);
    }
    const footerRow = document.querySelector("footer .container");
    const footerLinks = footerRow?.querySelector("span:last-child");
    if (footerLinks && !footerLinks.querySelector("[data-about-deke-link]")) {
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
    document.querySelectorAll(".navbar .nav-link").forEach((link) => {
      link.addEventListener("click", () => {
        link.classList.remove("nav-link--flare-click");
        void link.offsetWidth;
        link.classList.add("nav-link--flare-click");
        window.setTimeout(() => link.classList.remove("nav-link--flare-click"), 560);
      });
    });
  };

  loadSharedStyles();
  insertHomeBuilderLinks();
  insertAboutDekeLinks();
  insertBreadcrumbTicker();
  bindNavigationFlare();
  loadBikeBuilderUpgrade();
  loadSitewideChuck();
})();
