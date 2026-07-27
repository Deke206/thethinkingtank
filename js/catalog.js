(() => {
  "use strict";

  const STORAGE_KEY = "shynetymeMaterialNotes";
  const CATEGORY_ORDER = [
    "LED Lighting",
    "Controllers",
    "Connectors and Wiring",
    "Installation Supplies",
    "Mobile Power",
    "Power Supplies",
    "Splitters and Boosters"
  ];
  const products = Array.isArray(window.SHYNETYME_PRODUCTS) ? window.SHYNETYME_PRODUCTS : [];

  const catalogGrid = document.getElementById("catalogGrid");
  const categoryFilter = document.getElementById("categoryFilter");
  const catalogSearch = document.getElementById("catalogSearch");
  const catalogCount = document.getElementById("catalogCount");

  const modalElement = document.getElementById("productModal");
  const productModal = modalElement ? new bootstrap.Modal(modalElement) : null;
  const productModalCategory = document.getElementById("productModalCategory");
  const productModalDescription = document.getElementById("productModalDescription");
  const productModalImage = document.getElementById("productModalImage");
  const productModalSpecs = document.getElementById("productModalSpecs");
  const productModalIncluded = document.getElementById("productModalIncluded");
  const modalQuantity = document.getElementById("modalQuantity");
  const modalArea = document.getElementById("modalArea");
  const modalAddMaterial = document.getElementById("modalAddMaterial");
  const modalMaterialStatus = document.getElementById("modalMaterialStatus");

  let selectedCategory = "all";
  let activeProductId = null;

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatPrice(value) {
    if (typeof value !== "number" || Number.isNaN(value)) return "Not listed";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(value);
  }

  function productCategory(product) {
    const name = String(product.name || "").toLowerCase();
    const originalCategory = String(product.category || "").toLowerCase();

    if (
      name.includes("signal amplifier") ||
      name.includes("signal repeater") ||
      name.includes("data signal") ||
      name.includes("splitter") ||
      name.includes("booster") ||
      name.includes("sp901e")
    ) {
      return "Splitters and Boosters";
    }

    if (
      name.includes("aluminum channel") ||
      name.includes("mounting channel") ||
      name.includes("diffuser") ||
      name.includes("mounting clip")
    ) {
      return "Installation Supplies";
    }

    if (
      originalCategory.includes("connectors") ||
      name.includes("connector") ||
      name.includes("extension cable") ||
      name.includes("extension wire") ||
      name.includes("jst-sm")
    ) {
      return "Connectors and Wiring";
    }

    if (
      name.includes("power bank") ||
      name.includes("portable battery") ||
      name.includes("mobile power")
    ) {
      return "Mobile Power";
    }

    if (originalCategory.includes("power supplies") || name.includes("power supply")) {
      return "Power Supplies";
    }

    if (originalCategory.includes("controllers")) {
      return "Controllers";
    }

    return "LED Lighting";
  }

  function preferredSpecs(product) {
    const preferredKeys = [
      "Voltage",
      "Input voltage",
      "Water protection",
      "Length",
      "LED density",
      "Output",
      "Wire",
      "Connector",
      "Compatibility"
    ];

    const chips = preferredKeys
      .filter((key) => product.specs?.[key])
      .slice(0, 3)
      .map((key) => `<span class="catalog-spec-chip">${escapeHtml(product.specs[key])}</span>`);

    chips.push(`<span class="catalog-spec-chip catalog-price-chip">Price: ${escapeHtml(formatPrice(product.price))}</span>`);
    return chips.join("");
  }

  function visibleProducts() {
    const query = catalogSearch.value.trim().toLowerCase();

    return products.filter((product) => {
      const displayCategory = productCategory(product);
      const categoryMatch = selectedCategory === "all" || displayCategory === selectedCategory;
      const searchableText = [
        product.name,
        displayCategory,
        formatPrice(product.price),
        ...Object.values(product.specs || {}),
        ...(product.included || [])
      ].join(" ").toLowerCase();

      return categoryMatch && (!query || searchableText.includes(query));
    });
  }

  function populateCategoryFilter() {
    const actualCategories = [...new Set(products.map(productCategory))]
      .sort((a, b) => {
        const aIndex = CATEGORY_ORDER.indexOf(a);
        const bIndex = CATEGORY_ORDER.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });

    categoryFilter.innerHTML = [
      '<option value="all">All categories</option>',
      ...actualCategories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`)
    ].join("");
    categoryFilter.value = selectedCategory;
  }

  function materialControls(product, context = "card") {
    const prefix = `${context}-${product.id}`;
    return `
      <div class="catalog-material-controls" data-material-controls="${escapeHtml(product.id)}">
        <label class="catalog-number-field" for="${prefix}-quantity">
          <span>Quantity Needed</span>
          <input id="${prefix}-quantity" class="form-control form-control-sm material-quantity" type="number" min="1" step="1" inputmode="numeric" value="1">
        </label>
        <label class="catalog-number-field" for="${prefix}-area">
          <span>Area Sq Ft</span>
          <input id="${prefix}-area" class="form-control form-control-sm material-area" type="number" min="0" step="0.01" inputmode="decimal" placeholder="0">
        </label>
        <button class="btn btn-neon-cyan catalog-add-button" type="button" data-add-material="${escapeHtml(product.id)}">Add Material</button>
        <span class="catalog-add-status" aria-live="polite"></span>
      </div>`;
  }

  function renderCatalog() {
    const items = visibleProducts();
    catalogCount.textContent = `${items.length} of ${products.length} items`;

    if (!items.length) {
      catalogGrid.innerHTML = `
        <div class="col-12">
          <div class="catalog-empty">
            <strong>No products match that search.</strong><br>
            Try another specification or category.
          </div>
        </div>`;
      return;
    }

    catalogGrid.innerHTML = items.map((product) => `
      <div class="col-sm-6 col-xl-4">
        <article class="catalog-product-card">
          <div class="catalog-product-image-wrap">
            <img
              class="catalog-product-image"
              src="${escapeHtml(product.image)}"
              alt="${escapeHtml(product.name)}"
              loading="lazy">
          </div>
          <div class="catalog-product-body">
            <p class="catalog-product-category">${escapeHtml(productCategory(product))}</p>
            <div class="catalog-product-title-area">
              <h2 class="catalog-product-title">${escapeHtml(product.name)}</h2>
            </div>
            <div class="catalog-product-specs">${preferredSpecs(product)}</div>
            ${materialControls(product)}
            <div class="catalog-card-actions">
              <button
                class="btn btn-outline-light catalog-details-button"
                type="button"
                data-product-id="${escapeHtml(product.id)}">
                Product Details
              </button>
            </div>
          </div>
        </article>
      </div>`).join("");
  }

  function readMaterialNotes() {
    try {
      const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function writeMaterialNotes(notes) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }

  function normalizedNumber(value, fallback = 0) {
    const number = Number(value);
    return Number.isFinite(number) ? number : fallback;
  }

  function addMaterial(product, quantityValue, areaValue, statusElement) {
    const quantity = Math.max(1, Math.round(normalizedNumber(quantityValue, 1)));
    const areaSqFt = Math.max(0, normalizedNumber(areaValue, 0));
    const notes = readMaterialNotes();
    const existingIndex = notes.findIndex((item) => item.id === product.id);

    const entry = {
      id: product.id,
      name: product.name,
      category: productCategory(product),
      price: product.price,
      quantityNeeded: quantity,
      areaSqFt,
      specs: product.specs || {},
      updatedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) notes[existingIndex] = entry;
    else notes.push(entry);

    writeMaterialNotes(notes);

    if (statusElement) {
      statusElement.textContent = "Added to Material Notes";
      window.clearTimeout(statusElement._clearTimer);
      statusElement._clearTimer = window.setTimeout(() => {
        statusElement.textContent = "";
      }, 2600);
    }
  }

  function addFromCard(button) {
    const product = products.find((item) => item.id === button.dataset.addMaterial);
    const controls = button.closest("[data-material-controls]");
    if (!product || !controls) return;

    const quantityInput = controls.querySelector(".material-quantity");
    const areaInput = controls.querySelector(".material-area");
    const status = controls.querySelector(".catalog-add-status");
    addMaterial(product, quantityInput?.value, areaInput?.value, status);
  }

  function buildModalSpecs(product) {
    const rows = Object.entries(product.specs || {}).map(([label, value]) => `
      <div class="catalog-spec-row">
        <dt>${escapeHtml(label)}</dt>
        <dd>${escapeHtml(value)}</dd>
      </div>`);

    rows.push(`
      <div class="catalog-spec-row">
        <dt>Price</dt>
        <dd>${escapeHtml(formatPrice(product.price))}</dd>
      </div>`);

    return rows.join("");
  }

  function openProduct(product) {
    activeProductId = product.id;
    productModalCategory.textContent = productCategory(product);
    productModalDescription.textContent = product.name;
    productModalImage.src = product.image;
    productModalImage.alt = product.name;
    productModalImage.classList.remove("is-zoomed");
    productModalSpecs.innerHTML = buildModalSpecs(product);

    if (product.included?.length) {
      productModalIncluded.classList.remove("d-none");
      productModalIncluded.innerHTML = `
        <strong>Included / package details</strong>
        <ul>${product.included.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`;
    } else {
      productModalIncluded.classList.add("d-none");
      productModalIncluded.innerHTML = "";
    }

    const cardControls = catalogGrid.querySelector(`[data-material-controls="${CSS.escape(product.id)}"]`);
    modalQuantity.value = cardControls?.querySelector(".material-quantity")?.value || "1";
    modalArea.value = cardControls?.querySelector(".material-area")?.value || "";
    modalMaterialStatus.textContent = "";
    productModal.show();
  }

  function removeZoom() {
    productModalImage.classList.remove("is-zoomed");
  }

  categoryFilter.addEventListener("change", () => {
    selectedCategory = categoryFilter.value;
    renderCatalog();
  });

  catalogSearch.addEventListener("input", renderCatalog);

  catalogGrid.addEventListener("click", (event) => {
    const detailsButton = event.target.closest("[data-product-id]");
    if (detailsButton) {
      const product = products.find((item) => item.id === detailsButton.dataset.productId);
      if (product) openProduct(product);
      return;
    }

    const addButton = event.target.closest("[data-add-material]");
    if (addButton) addFromCard(addButton);
  });

  modalAddMaterial.addEventListener("click", () => {
    const product = products.find((item) => item.id === activeProductId);
    if (!product) return;
    addMaterial(product, modalQuantity.value, modalArea.value, modalMaterialStatus);

    const cardControls = catalogGrid.querySelector(`[data-material-controls="${CSS.escape(product.id)}"]`);
    if (cardControls) {
      const quantityInput = cardControls.querySelector(".material-quantity");
      const areaInput = cardControls.querySelector(".material-area");
      if (quantityInput) quantityInput.value = modalQuantity.value;
      if (areaInput) areaInput.value = modalArea.value;
    }
  });

  productModalImage.addEventListener("pointermove", (event) => {
    const rect = productModalImage.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    productModalImage.style.setProperty("--zoom-x", `${Math.max(0, Math.min(100, x))}%`);
    productModalImage.style.setProperty("--zoom-y", `${Math.max(0, Math.min(100, y))}%`);
  });

  productModalImage.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    productModalImage.setPointerCapture?.(event.pointerId);
    productModalImage.classList.add("is-zoomed");
  });

  ["pointerup", "pointercancel", "pointerleave", "lostpointercapture"].forEach((eventName) => {
    productModalImage.addEventListener(eventName, removeZoom);
  });

  modalElement.addEventListener("hidden.bs.modal", () => {
    activeProductId = null;
    removeZoom();
  });

  if (products.length) {
    populateCategoryFilter();
    renderCatalog();
  } else {
    catalogGrid.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger" role="alert">The catalog data could not be loaded.</div>
      </div>`;
    catalogCount.textContent = "Catalog unavailable";
  }
})();
