(async () => {
  "use strict";

  const DESIGN_KEY = "shynetymeDesignChainDraft";
  const CONTACT_KEY = "shynetymeContactDraft";
  const params = new URLSearchParams(window.location.search);
  const typeFromUrl = params.get("type");

  const defaults = {
    bike: ["pixel-ws2815", "pixel-sk6812-rgbw-12v", "pixel-ws2812b-2020", "fcob-rgbic-5mm"],
    home: ["fcob-rgbcct-addressable", "pixel-ws2811-24v-108", "pixel-ws2805-rgbcct", "fcob-cct-ip30-ip65"],
    auto: ["pixel-ws2815", "pixel-sk6812-rgbw-12v", "pixel-ws2814-rgbw", "fcob-rgbic-576"]
  };

  const projectLabels = {
    bike: "LED Bike Simulator",
    home: "LED Home Simulator",
    auto: "LED Auto Simulator"
  };

  const simulatorPages = {
    bike: "build-my-bike.html",
    home: "build-my-home.html",
    auto: "build-my-auto.html"
  };

  const fallbackSupport = [
    {
      id: "support-controller",
      name: "Project Controller System",
      category: "Controls",
      description: "WLED-compatible Wi-Fi, Bluetooth or preprogrammed control selected for the final zones and effects."
    },
    {
      id: "support-power",
      name: "Sized Power and Voltage System",
      category: "Power",
      description: "Power supply, converter, distribution and voltage-injection plan sized after measurements."
    },
    {
      id: "support-wiring",
      name: "Wiring, Connectors and Fusing",
      category: "Electrical",
      description: "Correct wire gauge, branch protection, connectors, disconnects and service loops for the installation."
    },
    {
      id: "support-mounting",
      name: "Mounting Channels and Project Hardware",
      category: "Installation",
      description: "Channels, clips, diffusers, fasteners, adhesives and custom mounting pieces for a finished result."
    },
    {
      id: "support-measurement",
      name: "Measurement and Layout Package",
      category: "Design",
      description: "Final lengths, zone map, wire routes and controller placement verified before ordering."
    }
  ];

  const elements = {
    back: document.getElementById("backToSimulator"),
    projectType: document.getElementById("projectType"),
    selectionCount: document.getElementById("selectionCount"),
    suggestedCount: document.getElementById("suggestedCount"),
    recordedSelections: document.getElementById("recordedSelections"),
    familyGrid: document.getElementById("familyGrid"),
    supportGrid: document.getElementById("supportGrid"),
    familyCount: document.getElementById("familyCount"),
    supportCount: document.getElementById("supportCount"),
    comingSoon: document.getElementById("comingSoonSection"),
    requestTop: document.getElementById("requestConsultationTop"),
    requestBottom: document.getElementById("requestConsultation")
  };

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const readDraft = () => {
    try {
      const parsed = JSON.parse(localStorage.getItem(DESIGN_KEY) || "null");
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch {
      return null;
    }
  };

  const writeDraft = (draft) => {
    draft.updatedAt = new Date().toISOString();
    localStorage.setItem(DESIGN_KEY, JSON.stringify(draft));
  };

  const projectType = ["bike", "home", "auto"].includes(typeFromUrl)
    ? typeFromUrl
    : readDraft()?.projectType || "home";

  const draft = readDraft() || {
    version: 1,
    source: "recommendations-page",
    projectType,
    projectLabel: projectLabels[projectType],
    simulatorPage: simulatorPages[projectType],
    selections: [],
    summary: "",
    recommendedFamilyIds: defaults[projectType],
    selectedFamilyIds: defaults[projectType],
    supportItems: fallbackSupport,
    selectedSupportIds: fallbackSupport.map((item) => item.id),
    flags: {},
    updatedAt: new Date().toISOString()
  };

  draft.projectType = projectType;
  draft.projectLabel = draft.projectLabel || projectLabels[projectType];
  draft.simulatorPage = draft.simulatorPage || simulatorPages[projectType];
  draft.recommendedFamilyIds = Array.isArray(draft.recommendedFamilyIds) && draft.recommendedFamilyIds.length
    ? draft.recommendedFamilyIds
    : defaults[projectType];
  draft.selectedFamilyIds = Array.isArray(draft.selectedFamilyIds)
    ? draft.selectedFamilyIds
    : [...draft.recommendedFamilyIds];
  draft.supportItems = Array.isArray(draft.supportItems) && draft.supportItems.length
    ? draft.supportItems
    : fallbackSupport;
  draft.selectedSupportIds = Array.isArray(draft.selectedSupportIds)
    ? draft.selectedSupportIds
    : draft.supportItems.map((item) => item.id);
  draft.flags = draft.flags || {};
  writeDraft(draft);

  const catalog = await window.SHYNETYME_BTF_READY.catch(() => null);
  const allProducts = Array.isArray(catalog?.products) ? catalog.products : [];
  const products = draft.recommendedFamilyIds
    .map((id) => allProducts.find((product) => product.id === id))
    .filter(Boolean);

  const selectedFamilies = new Set(draft.selectedFamilyIds);
  const selectedSupport = new Set(draft.selectedSupportIds);

  const updateCounts = () => {
    elements.familyCount.textContent = `${selectedFamilies.size} selected`;
    elements.supportCount.textContent = `${selectedSupport.size} selected`;
    elements.suggestedCount.textContent = String(selectedFamilies.size + selectedSupport.size);
  };

  const renderSelections = () => {
    const selections = Array.isArray(draft.selections) ? draft.selections : [];
    elements.selectionCount.textContent = String(selections.length);
    elements.projectType.textContent = draft.projectLabel || projectLabels[projectType];
    elements.back.href = simulatorPages[projectType] || "index.html";

    if (!selections.length) {
      elements.recordedSelections.innerHTML = "<p>No detailed options were recorded. Return to the simulator to refine the build, or continue with the standard material groups shown here.</p>";
      return;
    }

    elements.recordedSelections.innerHTML = selections.map((selection) => `
      <div class="recorded-selection">
        <strong>${escapeHtml(selection.label)}</strong>
        <span>${escapeHtml(selection.value)}</span>
      </div>`).join("");
  };

  const renderFamilyGrid = () => {
    if (!products.length) {
      elements.familyGrid.innerHTML = '<div class="recommendations-empty">The selected BTF product families could not be loaded. The consultation can still continue with the recorded simulator build.</div>';
      return;
    }

    elements.familyGrid.innerHTML = products.map((product) => {
      const checked = selectedFamilies.has(product.id);
      return `
        <article class="recommendation-card${checked ? "" : " is-unselected"}" data-family-card="${escapeHtml(product.id)}">
          <div class="recommendation-card__top">
            <span class="recommendation-card__category">${escapeHtml(product.category)}</span>
            <label class="recommendation-card__toggle">
              <input type="checkbox" data-family-toggle="${escapeHtml(product.id)}"${checked ? " checked" : ""}>
              Include
            </label>
          </div>
          <div class="recommendation-card__body">
            <h3>${escapeHtml(product.name)}</h3>
            <p>${escapeHtml(product.description)}</p>
            <div class="recommendation-card__chips">
              <span class="recommendation-card__chip">${escapeHtml(product.voltages)}</span>
              <span class="recommendation-card__chip">${escapeHtml(product.waterproof)}</span>
              <span class="recommendation-card__chip">${escapeHtml(product.control)}</span>
              <span class="recommendation-card__chip">${product.variants.length} configurations</span>
            </div>
          </div>
        </article>`;
    }).join("");
  };

  const renderSupportGrid = () => {
    elements.supportGrid.innerHTML = draft.supportItems.map((item) => {
      const checked = selectedSupport.has(item.id);
      return `
        <article class="recommendation-card${checked ? "" : " is-unselected"}" data-support-card="${escapeHtml(item.id)}">
          <div class="recommendation-card__top">
            <span class="recommendation-card__category">${escapeHtml(item.category)}</span>
            <label class="recommendation-card__toggle">
              <input type="checkbox" data-support-toggle="${escapeHtml(item.id)}"${checked ? " checked" : ""}>
              Include
            </label>
          </div>
          <div class="recommendation-card__body">
            <h3>${escapeHtml(item.name)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <div class="recommendation-card__chips">
              <span class="recommendation-card__chip">Quantity after measurement</span>
              <span class="recommendation-card__chip">Included in project quote</span>
            </div>
          </div>
        </article>`;
    }).join("");
  };

  const saveSelections = () => {
    draft.selectionCustomized = true;
    draft.selectedFamilyIds = [...selectedFamilies];
    draft.selectedSupportIds = [...selectedSupport];
    writeDraft(draft);
    updateCounts();
  };

  const materialSummary = () => {
    const buildLines = draft.selections?.length
      ? draft.selections.map((item) => `- ${item.label}: ${item.value}`).join("\n")
      : "- Exact simulator options to be confirmed during consultation.";
    const familyLines = products
      .filter((product) => selectedFamilies.has(product.id))
      .map((product) => `- ${product.name}`)
      .join("\n");
    const supportLines = draft.supportItems
      .filter((item) => selectedSupport.has(item.id))
      .map((item) => `- ${item.name}`)
      .join("\n");

    return [
      draft.projectLabel || projectLabels[projectType],
      "",
      "Simulator selections:",
      buildLines,
      "",
      "Selected lighting systems:",
      familyLines || "- Final lighting system selected after measurements.",
      "",
      "Selected project support materials:",
      supportLines || "- Final support materials selected after measurements.",
      draft.flags?.garagePanelStories ? "\nComing soon interest: Garage-door LED panel story animations." : ""
    ].filter(Boolean).join("\n");
  };

  const continueToConsultation = () => {
    saveSelections();
    const chosenProducts = products.filter((product) => selectedFamilies.has(product.id));
    const chosenSupport = draft.supportItems.filter((item) => selectedSupport.has(item.id));
    const now = new Date().toISOString();

    const project = [
      ...chosenProducts.map((product) => ({
        key: `recommendation-${product.id}`,
        productId: product.id,
        productName: product.name,
        category: product.category,
        sourceItems: product.sourceItems,
        variant: null,
        addedAt: now
      })),
      ...chosenSupport.map((item) => ({
        key: `recommendation-${item.id}`,
        productId: item.id,
        productName: item.name,
        category: item.category,
        sourceItems: item.description,
        variant: null,
        addedAt: now
      }))
    ];

    localStorage.setItem(CONTACT_KEY, JSON.stringify({
      source: "project-recommendations",
      createdAt: now,
      project,
      summary: materialSummary(),
      requestType: "Complete LED materials and installation consultation",
      pricingModel: "ShyneTyme-supplied materials, design, controls, fabrication and installation",
      designDraft: draft
    }));

    window.location.href = "contact.html?source=project-recommendations#contact-request";
  };

  elements.familyGrid.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-family-toggle]");
    if (!toggle) return;
    const id = toggle.dataset.familyToggle;
    toggle.checked ? selectedFamilies.add(id) : selectedFamilies.delete(id);
    toggle.closest(".recommendation-card")?.classList.toggle("is-unselected", !toggle.checked);
    saveSelections();
  });

  elements.supportGrid.addEventListener("change", (event) => {
    const toggle = event.target.closest("[data-support-toggle]");
    if (!toggle) return;
    const id = toggle.dataset.supportToggle;
    toggle.checked ? selectedSupport.add(id) : selectedSupport.delete(id);
    toggle.closest(".recommendation-card")?.classList.toggle("is-unselected", !toggle.checked);
    saveSelections();
  });

  elements.requestTop.addEventListener("click", continueToConsultation);
  elements.requestBottom.addEventListener("click", continueToConsultation);

  renderSelections();
  renderFamilyGrid();
  renderSupportGrid();
  elements.comingSoon.hidden = !(draft.flags?.garagePanelStories || draft.flags?.garageBorder);
  updateCounts();
})();
