(() => {
  "use strict";

  const scriptElement = document.currentScript;
  const scriptUrl = scriptElement?.src ? new URL(scriptElement.src, window.location.href) : null;
  const siteRoot = scriptUrl ? new URL("../", scriptUrl) : new URL("./", window.location.href);
  const motionCssUrl = new URL("css/site-motion.css?v=20260723-real-chuck-frames", siteRoot).href;
  const heroCssUrl = new URL("css/site-hero.css?v=20260723-uniform-carousel", siteRoot).href;
  const chuckSpriteUrl = new URL("js/chuck-sprite.js?v=20260723-real-chuck-frames", siteRoot).href;
  const scanAtlasUrl = new URL("assets/brand/chuck-search-map.webp?v=20260723", siteRoot).href;
  const laptopAtlasUrl = new URL("assets/brand/chuck-search-laptop.webp?v=20260723", siteRoot).href;
  const aboutDekeUrl = new URL("aboutmeDeke/", siteRoot).href;

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
  };

  const loadChuckSprite = () => new Promise((resolve) => {
    if (window.ShynetymeChuckSprite) {
      resolve(window.ShynetymeChuckSprite);
      return;
    }

    const existing = document.querySelector('script[data-shynetyme-chuck-sprite]');
    if (existing) {
      existing.addEventListener("load", () => resolve(window.ShynetymeChuckSprite || null), { once: true });
      existing.addEventListener("error", () => resolve(null), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = chuckSpriteUrl;
    script.defer = true;
    script.dataset.shynetymeChuckSprite = "true";
    script.addEventListener("load", () => resolve(window.ShynetymeChuckSprite || null), { once: true });
    script.addEventListener("error", () => resolve(null), { once: true });
    document.head.appendChild(script);
  });

  const getPageKey = () => {
    const fileName = window.location.pathname.split("/").filter(Boolean).pop() || "index.html";
    return fileName.toLowerCase();
  };

  const pageLabels = {
    "build-my-bike.html": "Build",
    "led-catalog.html": "LED Catalog",
    "contact.html": "Request Install"
  };

  const insertAboutDekeLinks = () => {
    const nav = document.querySelector(".navbar .navbar-nav");
    if (nav && !nav.querySelector("[data-about-deke-link]")) {
      const link = document.createElement("a");
      link.className = "nav-link";
      link.href = aboutDekeUrl;
      link.textContent = "About Deke";
      link.dataset.aboutDekeLink = "true";

      const contactLink = [...nav.querySelectorAll("a")].find((item) =>
        item.getAttribute("href")?.includes("contact")
      );
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
    ticker.innerHTML = `
      <div class="breadcrumb-ticker__rail">
        <ol class="breadcrumb-ticker__list">
          <li class="breadcrumb-ticker__item"><a href="${new URL("index.html", siteRoot).href}">Home</a></li>
          <li class="breadcrumb-ticker__item"><span aria-current="page">${currentLabel}</span></li>
        </ol>
      </div>
    `;

    const banner = document.querySelector("header");
    if (banner) {
      banner.insertAdjacentElement("afterend", ticker);
      return;
    }

    document.querySelector("main")?.insertAdjacentElement("beforebegin", ticker);
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
  insertAboutDekeLinks();
  insertBreadcrumbTicker();
  bindNavigationFlare();

  const button = document.querySelector(".site-guide-button");
  const panel = document.getElementById("siteGuidePanel");
  const close = panel?.querySelector(".site-guide-close");
  if (!button) return;

  let chuckAnimation = null;
  let previousScrollY = window.scrollY;
  let scrollTimer = 0;

  loadChuckSprite().then((spriteApi) => {
    chuckAnimation = spriteApi?.mount({
      button,
      image: button.querySelector("img"),
      scanUrl: scanAtlasUrl,
      laptopUrl: laptopAtlasUrl
    }) || null;
  });

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const mode = currentScrollY < previousScrollY ? "scan" : "laptop";
    previousScrollY = currentScrollY;

    button.classList.add("is-searching");
    chuckAnimation?.start(mode);
    window.clearTimeout(scrollTimer);
    scrollTimer = window.setTimeout(() => {
      button.classList.remove("is-searching");
      chuckAnimation?.stop();
    }, 620);
  }, { passive: true });

  if (panel && !panel.querySelector("[data-about-deke-link]")) {
    const aboutLink = document.createElement("a");
    aboutLink.href = aboutDekeUrl;
    aboutLink.textContent = "About Deke";
    aboutLink.dataset.aboutDekeLink = "true";
    panel.appendChild(aboutLink);
  }

  if (!panel || !close) return;

  const setOpen = (open) => {
    panel.hidden = !open;
    button.setAttribute("aria-expanded", String(open));
    if (open) panel.querySelector("a")?.focus();
  };

  button.addEventListener("click", () => setOpen(panel.hidden));
  close.addEventListener("click", () => {
    setOpen(false);
    button.focus();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      setOpen(false);
      button.focus();
    }
  });
})();
