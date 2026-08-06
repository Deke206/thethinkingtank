(() => {
  "use strict";

  if (window.ShynetymeSiteGuide?.initialized) return;
  window.ShynetymeSiteGuide = { initialized: true };

  const CONTACT_DRAFT_KEY = "shynetymeContactDraft";
  const PROJECT_STORAGE_KEY = "shynetymeBtfProject";

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  const sharedRevision = scriptUrl.searchParams.get("v") || "shared-ui-14";
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
  const autoBuilderUrl = new URL("build-my-auto.html", siteRoot).href;
  const catalogUrl = new URL("led-catalog.html", siteRoot).href;
  const expoUrl = new URL("LEDexpo.html", siteRoot).href;
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
    const autoActive = page === "build-my-auto.html";
    const catalogActive = page === "led-catalog.html";
    const expoActive = page === "ledexpo.html";
    const aboutActive = page === "aboutme.html";
    const contactActive = page === "contact.html";

    nav.innerHTML = `
      <div class="nav-item dropdown shynetyme-build-menu" data-shynetyme-build-menu="true">
        <button class="nav-link dropdown-toggle${bikeActive || homeActive || autoActive ? " active" : ""}" type="button" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Open LED simulator menu">Sim</button>
        <ul class="dropdown-menu dropdown-menu-dark" aria-label="LED simulator pages">
          <li><a class="dropdown-item${bikeActive ? " active" : ""}"${bikeActive ? " aria-current=\"page\"" : ""} href="${bikeBuilderUrl}">LED BIKE SIM</a></li>
          <li><a class="dropdown-item${homeActive ? " active" : ""}"${homeActive ? " aria-current=\"page\"" : ""} href="${homeBuilderUrl}">LED HOME SIM</a></li>
          <li><a class="dropdown-item${autoActive ? " active" : ""}"${autoActive ? " aria-current=\"page\"" : ""} href="${autoBuilderUrl}">LED AUTO SIM</a></li>
        </ul>
      </div>
      <a class="nav-link${catalogActive ? " active" : ""}"${catalogActive ? " aria-current=\"page\"" : ""} href="${catalogUrl}">Catalog</a>
      <a class="nav-link${expoActive ? " active" : ""}"${expoActive ? " aria-current=\"page\"" : ""} href="${expoUrl}">LED EXPO</a>
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

  const installBikePreviewRules = () => {
    if (getPageKey() !== "build-my-bike.html") return;
    const firstBody = document.querySelector("#bikeSetup .accordion-body");
    if (!firstBody || firstBody.querySelector(".home-preview-rules")) return;

    const rules = document.createElement("div");
    rules.className = "home-preview-rules mt-3";
    rules.innerHTML = `<div><span class="home-legend home-legend--on" aria-hidden="true"></span>Selected lighting zone</div><div><span class="home-legend home-legend--off" aria-hidden="true"></span>Available but not selected</div><p class="mb-0">Use all four views before copying the summary so the front, rear and yard details are represented.</p>`;
    firstBody.appendChild(rules);

    if (!document.getElementById("bikePreviewRulesStyles")) {
      const style = document.createElement("style");
      style.id = "bikePreviewRulesStyles";
      style.textContent = `
        #bikeSetup .home-preview-rules{display:grid;gap:.48rem;padding:.8rem;border:1px solid rgba(155,131,255,.24);border-radius:.8rem;color:#dceaf8;background:rgba(3,9,24,.55);font-size:.84rem}
        #bikeSetup .home-preview-rules>div{display:flex;align-items:center;gap:.5rem}
        #bikeSetup .home-preview-rules p{color:#aebed5}
        #bikeSetup .home-legend{display:inline-block;flex:0 0 auto;width:.85rem;height:.85rem;border-radius:50%}
        #bikeSetup .home-legend--on{background:linear-gradient(135deg,#ff5ab9,#ffe76a,#31e6ff);box-shadow:0 0 8px rgba(49,230,255,.8)}
        #bikeSetup .home-legend--off{background:#ff7189;opacity:.6}`;
      document.head.appendChild(style);
    }
  };

  const readContactDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(CONTACT_DRAFT_KEY) || "null");
      return draft && typeof draft === "object" ? draft : null;
    } catch {
      return null;
    }
  };

  const inferProjectType = (draft) => {
    const text = JSON.stringify(draft?.project || []).toLowerCase();
    if (/house|home|room|garage|pathway|yard|property|architectural|exterior/.test(text)) return "House Exterior";
    if (/car|vehicle|auto/.test(text)) return "Car";
    if (/motorcycle/.test(text)) return "Motorcycle";
    if (/boat|marina/.test(text)) return "Boat";
    if (/bike|bicycle|e-bike/.test(text)) return "Bicycle";
    return "Special Request";
  };

  const installContactRequestFields = () => {
    if (getPageKey() !== "contact.html") return;

    const form = document.querySelector(".contact-form");
    const fieldsRow = form?.querySelector(".row.g-3");
    const message = form?.querySelector("#contactMessage");
    if (!form || !fieldsRow || !message || document.getElementById("contactProjectDetails")) return;

    form.id = "contact-request";
    const draft = readContactDraft();
    const project = Array.isArray(draft?.project) ? draft.project : [];
    const selectionSummary = String(draft?.summary || "").trim();

    const section = document.createElement("div");
    section.id = "contactProjectDetails";
    section.className = "col-12";
    section.innerHTML = `
      <section class="contact-project-details" aria-labelledby="contactProjectDetailsTitle">
        <div class="contact-project-details__heading">
          <div>
            <p class="section-kicker mb-1">Project logistics</p>
            <h2 id="contactProjectDetailsTitle" class="h4 mb-1">Materials, delivery and installation address</h2>
          </div>
          <span class="contact-project-details__count">${project.length} selected</span>
        </div>
        <p class="contact-project-details__note">ShyneTyme supplies the approved materials as part of the complete project quote. A material deposit is collected before products are ordered.</p>

        <div class="row g-3">
          <div class="col-12">
            <label class="form-label" for="serviceAddress">Service address</label>
            <input class="form-control" id="serviceAddress" name="service_address" type="text" autocomplete="street-address" placeholder="Street address where the installation will be completed">
          </div>
          <div class="col-md-5">
            <label class="form-label" for="serviceCity">City</label>
            <input class="form-control" id="serviceCity" name="service_city" type="text" autocomplete="address-level2" value="Los Angeles">
          </div>
          <div class="col-md-3">
            <label class="form-label" for="serviceState">State</label>
            <input class="form-control" id="serviceState" name="service_state" type="text" autocomplete="address-level1" value="CA">
          </div>
          <div class="col-md-4">
            <label class="form-label" for="serviceZip">ZIP code</label>
            <input class="form-control" id="serviceZip" name="service_zip" type="text" inputmode="numeric" autocomplete="postal-code">
          </div>
          <div class="col-md-6">
            <label class="form-label" for="materialDelivery">Material delivery</label>
            <select class="form-select" id="materialDelivery" name="material_delivery">
              <option value="hold-for-installation">Hold materials for the scheduled installation</option>
              <option value="service-address">Ship materials to the service address</option>
              <option value="customer-address">Ship materials to a different customer address</option>
            </select>
          </div>
          <div class="col-md-6">
            <label class="form-label" for="appointmentTiming">Appointment timing</label>
            <select class="form-select" id="appointmentTiming" name="appointment_timing">
              <option>Schedule after materials arrive</option>
              <option>Need an on-site measurement first</option>
              <option>Requesting an estimate only</option>
            </select>
          </div>
          <div class="col-12 d-none" id="shippingAddressGroup">
            <label class="form-label" for="shippingAddress">Different shipping address</label>
            <textarea class="form-control" id="shippingAddress" name="shipping_address" rows="3" autocomplete="shipping street-address" placeholder="Recipient name and complete delivery address"></textarea>
          </div>
          <div class="col-12">
            <label class="form-label" for="catalogSelectionSummary">Selected catalog systems</label>
            <textarea class="form-control contact-selection-summary" id="catalogSelectionSummary" name="catalog_selections" rows="${project.length ? Math.min(14, Math.max(5, project.length * 3)) : 4}" readonly placeholder="Selections added from the BTF-LIGHTING project catalog will appear here.">${selectionSummary}</textarea>
            <input id="catalogSelectionJson" name="catalog_selection_json" type="hidden" value="">
          </div>
          <div class="col-12">
            <div class="form-check">
              <input class="form-check-input" id="materialDepositAcknowledgement" name="material_deposit_acknowledgement" type="checkbox" value="Acknowledged">
              <label class="form-check-label" for="materialDepositAcknowledgement">I understand that approved project materials require a deposit before ShyneTyme places the order.</label>
            </div>
          </div>
        </div>
      </section>`;

    message.closest(".col-12")?.insertAdjacentElement("beforebegin", section);

    const projectJson = section.querySelector("#catalogSelectionJson");
    if (projectJson) projectJson.value = JSON.stringify(project);

    const delivery = section.querySelector("#materialDelivery");
    const shippingGroup = section.querySelector("#shippingAddressGroup");
    const updateShippingVisibility = () => {
      shippingGroup?.classList.toggle("d-none", delivery?.value !== "customer-address");
    };
    delivery?.addEventListener("change", updateShippingVisibility);
    updateShippingVisibility();

    const projectType = form.querySelector("#contactProject");
    if (draft && projectType) projectType.value = inferProjectType(draft);

    if (selectionSummary && !message.value.trim()) {
      message.value = [
        "I am requesting a complete materials-and-installation quote for the selected lighting systems.",
        "",
        selectionSummary,
        "",
        "Project measurements and effect goals:",
        "Preferred timeline:"
      ].join("\n");
    }

    form.addEventListener("submit", () => {
      if (!selectionSummary || message.value.includes(selectionSummary)) return;
      message.value = `${message.value.trim()}\n\nSelected catalog systems:\n${selectionSummary}`.trim();
    });

    if (!document.getElementById("contactProjectDetailsStyles")) {
      const style = document.createElement("style");
      style.id = "contactProjectDetailsStyles";
      style.textContent = `
        .contact-project-details{margin:.35rem 0;padding:1rem;border:1px solid rgba(92,238,255,.24);border-radius:1rem;background:linear-gradient(145deg,rgba(6,28,54,.88),rgba(5,15,32,.94))}
        .contact-project-details__heading{display:flex;align-items:start;justify-content:space-between;gap:1rem}
        .contact-project-details__count{flex:0 0 auto;padding:.32rem .6rem;color:#04151f;border-radius:999px;background:#72efff;font-size:.76rem;font-weight:900}
        .contact-project-details__note{margin:.85rem 0 1rem;color:#ffd18e;font-size:.86rem;line-height:1.55}
        .contact-selection-summary{min-height:9rem;white-space:pre-wrap;background:rgba(2,13,28,.82)!important}`;
      document.head.appendChild(style);
    }

    if (window.location.hash === "#contact-request") {
      window.setTimeout(() => form.scrollIntoView({ behavior: "smooth", block: "start" }), 120);
    }
  };

  document.documentElement.lang = document.documentElement.lang || "en";
  sharedStyles.forEach(loadStyle);
  installBrandLockup();
  installNavigation();
  installBikePreviewRules();
  installContactRequestFields();
  loadScript("js/site-chuck.js", "data-shynetyme-site-chuck-script", "ShynetymeChuck");
})();

(() => {
  "use strict";

  const page = (window.location.pathname.split("/").filter(Boolean).pop() || "index.html").toLowerCase();
  if (page !== "contact.html") return;

  const source = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/site-guide.js", window.location.href);
  const root = new URL("../", source);
  const revision = source.searchParams.get("v") || "shared-ui-14";

  const load = (path, attribute, globalName) => new Promise((resolve, reject) => {
    if (window[globalName]) {
      resolve(window[globalName]);
      return;
    }

    const existing = document.querySelector(`script[${attribute}]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(window[globalName] || null), { once: true });
      existing.addEventListener("error", reject, { once: true });
      return;
    }

    const script = document.createElement("script");
    const url = new URL(path, root);
    url.searchParams.set("v", revision);
    script.src = url.href;
    script.defer = true;
    script.setAttribute(attribute, "true");
    script.addEventListener("load", () => resolve(window[globalName] || null), { once: true });
    script.addEventListener("error", reject, { once: true });
    document.head.appendChild(script);
  });

  load("js/contact-lead-config.js", "data-shynetyme-lead-config", "ShynetymeLeadConfig")
    .then(() => load("js/contact-lead-form.js", "data-shynetyme-lead-form", "ShynetymeLeadForm"))
    .catch((error) => console.error("ShyneTyme lead form failed to load", error));
})();
