(() => {
  "use strict";

  if (window.ShynetymeDesignChain?.initialized) return;

  const chuck = window.ShynetymeChuck;
  if (!chuck?.showMessage || !chuck?.showChoices) return;

  const scriptUrl = document.currentScript?.src
    ? new URL(document.currentScript.src, window.location.href)
    : new URL("js/customer-design-chain.js", window.location.href);
  const siteRoot = new URL("../", scriptUrl);
  const pageKey = (window.location.pathname.split("/").filter(Boolean).pop() || "index.html").toLowerCase();

  const DESIGN_KEY = "shynetymeDesignChainDraft";
  const CONTACT_KEY = "shynetymeContactDraft";
  const RECOMMENDATIONS_URL = new URL("project-recommendations.html", siteRoot);
  const CONTACT_URL = new URL("contact.html", siteRoot);

  const projectPages = {
    "build-my-bike.html": {
      type: "bike",
      label: "LED Bike Simulator",
      defaultFamilies: ["pixel-ws2815", "pixel-sk6812-rgbw-12v", "pixel-ws2812b-2020", "fcob-rgbic-5mm"]
    },
    "build-my-home.html": {
      type: "home",
      label: "LED Home Simulator",
      defaultFamilies: ["fcob-rgbcct-addressable", "pixel-ws2811-24v-108", "pixel-ws2805-rgbcct", "fcob-cct-ip30-ip65"]
    },
    "build-my-auto.html": {
      type: "auto",
      label: "LED Auto Simulator",
      defaultFamilies: ["pixel-ws2815", "pixel-sk6812-rgbw-12v", "pixel-ws2814-rgbw", "fcob-rgbic-576"]
    }
  };

  const familyNames = {
    "pixel-ws2815": "WS2815 Dual-Signal Pixel Strip",
    "pixel-sk6812-rgbw-12v": "12V SK6812 RGBW Pixel Strip",
    "pixel-ws2812b-2020": "5mm WS2812B SMD2020 Pixel Strip",
    "fcob-rgbic-5mm": "5mm Narrow Addressable RGBIC FCOB",
    "fcob-single-5-8mm": "Single-Color FCOB - 5mm / 8mm",
    "fcob-rgbic-576": "RGBIC FCOB - 576 LEDs/m",
    "fcob-rgbic-864": "RGBIC FCOB - 864 LEDs/m",
    "pixel-ws2811-bright": "WS2811 Grouped Pixel Strip - Bright",
    "pixel-ws2814-rgbw": "WS2814 RGBW Grouped Pixel Strip",
    "fcob-rgbcct-addressable": "Addressable RGBCCT FCOB",
    "pixel-ws2811-24v-108": "24V WS2811 108 LEDs/m",
    "pixel-ws2805-rgbcct": "WS2805 RGBCCT Dual-Signal Strip",
    "fcob-cct-ip30-ip65": "Tunable White CCT FCOB",
    "fcob-rgbw-analog": "Analog RGBW FCOB",
    "fcob-rgbcct-analog": "Analog RGBCCT FCOB",
    "fcob-white-ip67-480": "Solid White FCOB - IP67 480",
    "pixel-tm1934": "TM1934 Dual-Signal Grouped Pixel Strip",
    "fcob-rgbic-720": "RGBIC FCOB - 720 LEDs/m"
  };

  const supportCatalog = {
    controller: {
      id: "support-controller",
      name: "Project Controller System",
      category: "Controls",
      description: "WLED-compatible Wi-Fi, Bluetooth or preprogrammed control selected for the final zones and effects."
    },
    power: {
      id: "support-power",
      name: "Sized Power and Voltage System",
      category: "Power",
      description: "Power supply, converter, distribution and voltage-injection plan sized after measurements."
    },
    wiring: {
      id: "support-wiring",
      name: "Wiring, Connectors and Fusing",
      category: "Electrical",
      description: "Correct wire gauge, branch protection, connectors, disconnects and service loops for the installation."
    },
    mounting: {
      id: "support-mounting",
      name: "Mounting Channels and Project Hardware",
      category: "Installation",
      description: "Channels, clips, diffusers, fasteners, adhesives and custom mounting pieces for a finished result."
    },
    weatherproofing: {
      id: "support-weatherproofing",
      name: "Weatherproof Enclosures and Sealing",
      category: "Protection",
      description: "Protected enclosures, glands, sealing and drainage planning for exterior or mobile installations."
    },
    measurement: {
      id: "support-measurement",
      name: "Measurement and Layout Package",
      category: "Design",
      description: "Final lengths, zone map, wire routes and controller placement verified before ordering."
    }
  };

  let inputTimer = 0;
  let hasAnnouncedSuggestions = false;

  const unique = (values) => [...new Set(values.filter(Boolean))];

  const readDraft = () => {
    try {
      const draft = JSON.parse(localStorage.getItem(DESIGN_KEY) || "null");
      return draft && typeof draft === "object" ? draft : null;
    } catch {
      return null;
    }
  };

  const isVisible = (element) => {
    if (!(element instanceof HTMLElement)) return false;
    if (element.hidden) return false;
    const style = window.getComputedStyle(element);
    return style.display !== "none" && style.visibility !== "hidden";
  };

  const fieldLabel = (field) => {
    const explicit = field.id ? document.querySelector(`label[for="${CSS.escape(field.id)}"]`) : null;
    const wrapping = field.closest("label");
    const aria = field.getAttribute("aria-label") || field.getAttribute("title");
    return String(explicit?.textContent || wrapping?.textContent || aria || field.name || field.id || "Option")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 120);
  };

  const collectSelections = () => {
    const selections = [];
    const fields = [...document.querySelectorAll("main input, main select, main textarea, form input, form select, form textarea")];

    for (const field of fields) {
      if (!(field instanceof HTMLInputElement || field instanceof HTMLSelectElement || field instanceof HTMLTextAreaElement)) continue;
      if (field.disabled || field.type === "hidden" || field.closest("#dekeChuckWidget")) continue;
      if (!isVisible(field) && field.type !== "checkbox" && field.type !== "radio") continue;

      let value = "";
      if (field instanceof HTMLInputElement && ["checkbox", "radio"].includes(field.type)) {
        if (!field.checked) continue;
        value = field.value && field.value !== "on" ? field.value : "Selected";
      } else if (field instanceof HTMLSelectElement) {
        value = field.selectedOptions[0]?.textContent?.trim() || field.value;
        if (!value || /select|choose|none/i.test(value)) continue;
      } else {
        value = String(field.value || "").trim();
        if (!value) continue;
      }

      selections.push({
        label: fieldLabel(field),
        value: String(value).replace(/\s+/g, " ").trim().slice(0, 180)
      });
      if (selections.length >= 70) break;
    }

    const selectedControls = [...document.querySelectorAll("main [aria-pressed='true'], main .is-selected, main .selected, main .active")]
      .filter((element) => !element.closest("nav, .navbar, #dekeChuckWidget, .carousel-indicators"))
      .map((element) => String(element.getAttribute("aria-label") || element.textContent || "").replace(/\s+/g, " ").trim())
      .filter((value) => value && value.length <= 140)
      .slice(0, 20);

    selectedControls.forEach((value) => selections.push({ label: "Selected area or effect", value }));

    return selections.filter((selection, index, list) =>
      list.findIndex((item) => `${item.label}|${item.value}` === `${selection.label}|${selection.value}`) === index
    );
  };

  const collectVisibleSummary = () => {
    const candidates = [
      document.getElementById("buildSummary"),
      document.getElementById("homeBuildSummary"),
      document.querySelector(".build-summary"),
      document.querySelector("[id*='build'][id*='summary']"),
      document.querySelector("[class*='build'][class*='summary']")
    ].filter(Boolean);

    return candidates
      .map((element) => String(element.textContent || "").replace(/\s+/g, " ").trim())
      .find((value) => value.length >= 20)
      ?.slice(0, 3000) || "";
  };

  const selectionText = (selections) => selections
    .map((selection) => `${selection.label}: ${selection.value}`)
    .join("\n");

  const recommendationEngine = (type, selections, existing = {}) => {
    const page = Object.values(projectPages).find((item) => item.type === type);
    const text = `${selectionText(selections)} ${existing.summary || ""}`.toLowerCase();
    const families = [...(page?.defaultFamilies || [])];
    const support = ["controller", "power", "wiring", "mounting", "measurement"];
    const flags = { ...(existing.flags || {}) };

    if (type === "bike") {
      if (/turn|signal|brake|tail|safety|orange|red/.test(text)) {
        families.push("pixel-ws2815", "fcob-single-5-8mm");
      }
      if (/wheel|frame|basket|helmet|flag|pouch|narrow/.test(text)) {
        families.push("pixel-ws2812b-2020", "fcob-rgbic-5mm");
      }
      if (/outdoor|water|rain|delivery/.test(text)) support.push("weatherproofing");
    }

    if (type === "auto") {
      if (/underglow|rocker|wheel|exterior|grille|outline/.test(text)) {
        families.push("pixel-ws2815", "pixel-ws2811-bright", "fcob-rgbic-864");
        support.push("weatherproofing");
      }
      if (/interior|dash|footwell|door|console|trunk/.test(text)) {
        families.push("fcob-rgbic-576", "pixel-sk6812-rgbw-12v");
      }
      if (/turn|signal|brake|tail|white/.test(text)) families.push("pixel-ws2814-rgbw", "pixel-ws2815");
    }

    if (type === "home") {
      if (/garage/.test(text)) {
        families.push("pixel-ws2811-24v-108", "pixel-tm1934", "fcob-rgbic-864");
        support.push("weatherproofing");
        flags.garageBorder = true;
      }
      if (/panel|story|animation/.test(text) || flags.garagePanelStories) flags.garagePanelStories = true;
      if (/path|yard|outdoor|exterior|soffit|patio|roof|landscape/.test(text)) {
        families.push("pixel-ws2805-rgbcct", "pixel-tm1934", "fcob-white-ip67-480");
        support.push("weatherproofing");
      }
      if (/room|cove|ceiling|cabinet|interior|wall|stair|kitchen|bedroom/.test(text)) {
        families.push("fcob-rgbw-analog", "fcob-rgbcct-analog", "fcob-cct-ip30-ip65", "fcob-rgbcct-addressable");
      }
    }

    return {
      recommendedFamilyIds: unique(families),
      supportItems: unique(support).map((key) => supportCatalog[key]).filter(Boolean),
      flags
    };
  };

  const saveDraft = (reason = "simulator-input") => {
    const page = projectPages[pageKey];
    if (!page) return readDraft();

    const previous = readDraft() || {};
    const sameProject = previous.projectType === page.type;
    const selections = collectSelections();
    const visibleSummary = collectVisibleSummary();
    const recommendation = recommendationEngine(page.type, selections, {
      ...(sameProject ? previous : {}),
      summary: visibleSummary || (sameProject ? previous.summary : "") || ""
    });

    const draft = {
      version: 1,
      source: "simulator",
      reason,
      projectType: page.type,
      projectLabel: page.label,
      simulatorPage: pageKey,
      selections,
      summary: visibleSummary || selectionText(selections),
      recommendedFamilyIds: recommendation.recommendedFamilyIds,
      selectedFamilyIds: sameProject && previous.selectionCustomized && Array.isArray(previous.selectedFamilyIds)
        ? previous.selectedFamilyIds
        : recommendation.recommendedFamilyIds,
      supportItems: recommendation.supportItems,
      selectedSupportIds: sameProject && previous.selectionCustomized && Array.isArray(previous.selectedSupportIds)
        ? previous.selectedSupportIds
        : recommendation.supportItems.map((item) => item.id),
      selectionCustomized: Boolean(sameProject && previous.selectionCustomized),
      flags: recommendation.flags,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem(DESIGN_KEY, JSON.stringify(draft));
    return draft;
  };

  const materialSummary = (draft) => {
    const selectionLines = draft.selections?.length
      ? draft.selections.map((item) => `- ${item.label}: ${item.value}`).join("\n")
      : "- Simulator options will be finalized during consultation.";
    const familyLines = (draft.selectedFamilyIds || draft.recommendedFamilyIds || [])
      .map((id) => `- ${familyNames[id] || id}`)
      .join("\n");
    const supportLines = (draft.supportItems || [])
      .filter((item) => !draft.selectedSupportIds || draft.selectedSupportIds.includes(item.id))
      .map((item) => `- ${item.name}`)
      .join("\n");

    return [
      `${draft.projectLabel || "ShyneTyme LED Project"}`,
      "",
      "Simulator selections:",
      selectionLines,
      "",
      "Suggested lighting families:",
      familyLines || "- Final lighting family selected after measurements.",
      "",
      "Project support items:",
      supportLines || "- Final support materials selected after measurements.",
      draft.flags?.garagePanelStories ? "\nComing soon interest: Garage-door LED panel story animations." : ""
    ].filter(Boolean).join("\n");
  };

  const writeContactDraft = (draft = readDraft()) => {
    if (!draft) return null;
    const selectedFamilies = draft.selectedFamilyIds || draft.recommendedFamilyIds || [];
    const selectedSupport = (draft.supportItems || [])
      .filter((item) => !draft.selectedSupportIds || draft.selectedSupportIds.includes(item.id));

    const project = [
      ...selectedFamilies.map((id) => ({
        key: `design-${id}`,
        productId: id,
        productName: familyNames[id] || id,
        category: "Suggested lighting system",
        sourceItems: "Generated from simulator selections",
        variant: null,
        addedAt: new Date().toISOString()
      })),
      ...selectedSupport.map((item) => ({
        key: `design-${item.id}`,
        productId: item.id,
        productName: item.name,
        category: item.category,
        sourceItems: item.description,
        variant: null,
        addedAt: new Date().toISOString()
      }))
    ];

    const contactDraft = {
      source: "design-chain",
      createdAt: new Date().toISOString(),
      project,
      summary: materialSummary(draft),
      requestType: "Complete LED materials and installation consultation",
      pricingModel: "ShyneTyme-supplied materials, design, controls, fabrication and installation",
      designDraft: draft
    };
    localStorage.setItem(CONTACT_KEY, JSON.stringify(contactDraft));
    return contactDraft;
  };

  const recommendationsHref = (draft = readDraft()) => {
    const url = new URL(RECOMMENDATIONS_URL);
    if (draft?.projectType) url.searchParams.set("type", draft.projectType);
    return url.href;
  };

  const showSuggestionsReady = (draft) => {
    if (!draft) return;
    const total = (draft.recommendedFamilyIds?.length || 0) + (draft.supportItems?.length || 0);
    chuck.showChoices(
      `I found ${total} material groups\nfor this ${draft.projectType} build.`,
      [
        { label: "Suggested Items", href: recommendationsHref(draft), primary: true },
        { label: "Keep Designing", action: "dismiss" }
      ],
      0
    );
  };

  const showBuildDecision = () => {
    const draft = saveDraft("build-output");
    if (!draft) return;
    writeContactDraft(draft);
    chuck.showChoices(
      "How about taking a look at our suggested project items based on your selections?",
      [
        { label: "Go Here", href: recommendationsHref(draft), primary: true },
        { label: "Consultation", action: "consultation" }
      ],
      0
    );
  };

  const installStyles = () => {
    if (document.getElementById("designChainStyles")) return;
    const style = document.createElement("style");
    style.id = "designChainStyles";
    style.textContent = `
      .design-chain-start-target{outline:3px solid rgba(114,239,255,.78)!important;outline-offset:4px!important;box-shadow:0 0 0 7px rgba(114,239,255,.12)!important}
      .design-chain-coming-soon{margin:.8rem 0;padding:.85rem;border:1px dashed rgba(255,120,199,.6);border-radius:.85rem;background:linear-gradient(135deg,rgba(255,90,185,.1),rgba(49,230,255,.08))}
      .design-chain-coming-soon strong{display:block;color:#fff;margin-bottom:.25rem}
      .design-chain-coming-soon p{margin:0 0 .65rem;color:#c7d8e5;font-size:.84rem}
      .design-chain-coming-soon button{font-weight:800}
    `;
    document.head.appendChild(style);
  };

  const findStartTarget = () => {
    const page = projectPages[pageKey];
    if (!page) return null;
    const selectors = [
      "main form input:not([type='hidden']):not([disabled])",
      "main form select:not([disabled])",
      "main [role='button']",
      "main button:not([disabled])",
      "main input:not([type='hidden']):not([disabled])",
      "main select:not([disabled])"
    ];

    for (const selector of selectors) {
      const target = [...document.querySelectorAll(selector)]
        .find((element) => isVisible(element) && !element.closest("nav, footer, #dekeChuckWidget"));
      if (target) return target;
    }
    return document.querySelector("main");
  };

  const showSimulatorStart = (attempt = 0) => {
    const page = projectPages[pageKey];
    if (!page) return;
    const target = findStartTarget();
    if (!target && attempt < 10) {
      window.setTimeout(() => showSimulatorStart(attempt + 1), 300);
      return;
    }
    if (!target) return;

    if (!target.id) target.id = "designChainStart";
    target.classList.add("design-chain-start-target");
    window.setTimeout(() => target.classList.remove("design-chain-start-target"), 9000);
    chuck.showMessage({
      text: `You picked the\n${page.label}.\nStart here.`,
      label: "Start Here",
      href: `#${target.id}`,
      theme: "cyan"
    }, 0);
  };

  const installHomeComingSoon = (attempt = 0) => {
    if (pageKey !== "build-my-home.html" || document.getElementById("garagePanelStoryComingSoon")) return;

    const candidates = [...document.querySelectorAll("main label, main button, main h2, main h3, main h4, main .form-check, main .option-card, main .accordion-item")]
      .filter((element) => /garage/i.test(element.textContent || ""));
    const anchor = candidates.sort((a, b) => (a.textContent || "").length - (b.textContent || "").length)[0]
      || document.querySelector("main form")
      || document.querySelector("main");

    if (!anchor && attempt < 12) {
      window.setTimeout(() => installHomeComingSoon(attempt + 1), 350);
      return;
    }
    if (!anchor) return;

    const card = document.createElement("div");
    card.id = "garagePanelStoryComingSoon";
    card.className = "design-chain-coming-soon";
    card.innerHTML = `
      <strong>Garage-Door LED Panel Story Animations</strong>
      <p>Animated panel stories for children, holidays and custom scenes are planned. Garage-door border lighting can be designed now.</p>
      <button class="btn btn-outline-light btn-sm" type="button" aria-disabled="true">Coming Soon</button>`;

    const block = anchor.closest(".accordion-item, .option-card, .form-check, section, fieldset") || anchor;
    block.insertAdjacentElement("afterend", card);

    card.querySelector("button")?.addEventListener("click", () => {
      const draft = saveDraft("garage-panel-coming-soon") || {};
      draft.flags = { ...(draft.flags || {}), garagePanelStories: true, garageBorder: true };
      localStorage.setItem(DESIGN_KEY, JSON.stringify(draft));
      chuck.showChoices(
        "Panel story animations are coming soon. Garage border lighting can be quoted now.",
        [
          { label: "Suggested Border Items", href: recommendationsHref(draft), primary: true },
          { label: "Keep Designing", action: "dismiss" }
        ],
        0
      );
    });
  };

  const isBuildOutputControl = (control) => {
    const label = [
      control.textContent,
      control.getAttribute("aria-label"),
      control.getAttribute("title"),
      control.id,
      control.getAttribute("name")
    ].filter(Boolean).join(" ").replace(/\s+/g, " ").trim();

    const isCopy = /copy.*(build|summary|notes)|(?:build|summary|notes).*copy/i.test(label);
    const isSend = /(send|request|submit|contact|consult).*(build|quote|project|notes|install)|(?:build|quote|project|notes).*(send|request|submit|contact|consult)/i.test(label);
    const contactLink = control instanceof HTMLAnchorElement
      && /contact\.html/i.test(control.getAttribute("href") || "")
      && Boolean(control.closest("main"));
    return { isCopy, isSend: isSend || contactLink };
  };

  const bindSimulatorEvents = () => {
    if (!projectPages[pageKey]) return;

    const scheduleSave = () => {
      window.clearTimeout(inputTimer);
      inputTimer = window.setTimeout(() => {
        const draft = saveDraft("simulator-input");
        if (!draft || hasAnnouncedSuggestions || !draft.selections.length) return;
        hasAnnouncedSuggestions = true;
        showSuggestionsReady(draft);
      }, 650);
    };

    document.addEventListener("change", scheduleSave, true);
    document.addEventListener("input", scheduleSave, true);
    document.addEventListener("click", (event) => {
      const control = event.target.closest("button, a, input[type='button'], input[type='submit']");
      if (!control || control.closest("nav, footer, #dekeChuckWidget")) return;
      const output = isBuildOutputControl(control);
      if (output.isCopy) {
        window.setTimeout(showBuildDecision, 120);
        return;
      }
      if (output.isSend) {
        event.preventDefault();
        event.stopPropagation();
        showBuildDecision();
      }
    }, true);
  };

  const showHomepagePrompt = () => {
    chuck.showChoices(
      "What do you want\nto light up?",
      [
        { label: "Bike", href: new URL("build-my-bike.html?from=chuck", siteRoot).href, primary: true },
        { label: "Home", href: new URL("build-my-home.html?from=chuck", siteRoot).href },
        { label: "Auto", href: new URL("build-my-auto.html?from=chuck", siteRoot).href },
        { label: "Consultation", action: "consultation" }
      ],
      0
    );
  };

  document.addEventListener("shynetyme:chuck-choice", (event) => {
    const action = event.detail?.action;
    if (action === "consultation") {
      const draft = projectPages[pageKey] ? saveDraft("consultation") : readDraft();
      if (draft) writeContactDraft(draft);
      const url = new URL(CONTACT_URL);
      url.searchParams.set("source", "design-chain");
      url.hash = "contact-request";
      window.location.href = url.href;
    }
  });

  installStyles();
  installHomeComingSoon();
  bindSimulatorEvents();

  if (pageKey === "index.html") {
    window.setTimeout(showHomepagePrompt, 650);
  } else if (projectPages[pageKey]) {
    window.setTimeout(showSimulatorStart, 700);
  } else if (pageKey === "project-recommendations.html") {
    window.setTimeout(() => chuck.showMessage({
      text: "These are the usual materials that bring your selected build to life.",
      label: "Review Items",
      href: "#recommendedMaterials"
    }, 9000), 700);
  }

  window.ShynetymeDesignChain = {
    initialized: true,
    readDraft,
    saveDraft,
    writeContactDraft,
    recommendationsHref,
    recommendationEngine
  };
})();
