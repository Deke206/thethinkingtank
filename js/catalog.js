(async () => {
  "use strict";

  const STORAGE_KEY = "shynetymeBtfProject";
  const catalog = await window.SHYNETYME_BTF_READY;
  const products = Array.isArray(catalog?.products) ? catalog.products : [];
  const categories = Array.isArray(catalog?.categories) ? catalog.categories : [];

  const elements = {
    search: document.getElementById("catalogSearch"),
    clearSearch: document.getElementById("clearSearch"),
    categoryNav: document.getElementById("categoryNav"),
    categorySelect: document.getElementById("categorySelect"),
    searchScope: document.getElementById("searchScope"),
    activeCategory: document.getElementById("activeCategory"),
    catalogCount: document.getElementById("catalogCount"),
    grid: document.getElementById("catalogGrid"),
    projectCount: document.getElementById("projectCount"),
    projectItems: document.getElementById("projectItems"),
    requestQuote: document.getElementById("requestQuote"),
    clearProject: document.getElementById("clearProject"),
    modal: document.getElementById("productModal"),
    modalCategory: document.getElementById("productModalCategory"),
    modalTitle: document.getElementById("productModalTitle"),
    modalDescription: document.getElementById("productModalDescription"),
    modalSummary: document.getElementById("productModalSummary"),
    variantRows: document.getElementById("productVariantRows"),
    modalStatus: document.getElementById("modalStatus"),
    addFamilyFromModal: document.getElementById("addFamilyFromModal")
  };

  const productModal = elements.modal ? new bootstrap.Modal(elements.modal) : null;
  let activeCategory = "all";
  let activeProductId = null;

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function readProject() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  }

  function writeProject(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    renderProject();
  }

  function categoryLabel(categoryId) {
    return categories.find((category) => category.id === categoryId)?.label || categoryId;
  }

  function productSearchText(product) {
    return [
      product.name,
      product.description,
      product.category,
      product.control,
      product.colors,
      product.voltages,
      product.waterproof,
      product.densities,
      product.widths,
      product.sourceItems,
      ...(product.applications || []),
      ...(product.variants || []).flatMap((variant) => Object.values(variant))
    ].join(" ").toLowerCase();
  }

  function visibleProducts() {
    const query = elements.search.value.trim().toLowerCase();
    return products.filter((product) => {
      const categoryMatch = activeCategory === "all" || product.category === activeCategory;
      return categoryMatch && (!query || productSearchText(product).includes(query));
    });
  }

  function categoryCount(categoryId) {
    if (categoryId === "all") return products.length;
    return products.filter((product) => product.category === categoryId).length;
  }

  function populateCategories() {
    elements.categoryNav.innerHTML = categories.map((category) => `
      <button class="catalog-category-button${category.id === activeCategory ? " is-active" : ""}" type="button" data-category="${escapeHtml(category.id)}">
        <span>${escapeHtml(category.label)}</span>
        <span class="catalog-category-count">${categoryCount(category.id)}</span>
      </button>`).join("");

    elements.categorySelect.innerHTML = categories.map((category) => `
      <option value="${escapeHtml(category.id)}">${escapeHtml(category.label)} (${categoryCount(category.id)})</option>`).join("");
    elements.categorySelect.value = activeCategory;
  }

  function cardCode(product) {
    if (/WS\d+|SK\d+|TM\d+|XGB\d+/i.test(product.control)) {
      return product.control.split(/\s+/).slice(0, 2).join(" ");
    }
    return product.category.replace("FCOB ", "").replace("Pixel ", "");
  }

  function renderCards() {
    const items = visibleProducts();
    const variantTotal = items.reduce((sum, product) => sum + product.variants.length, 0);
    elements.activeCategory.textContent = categoryLabel(activeCategory);
    elements.searchScope.textContent = activeCategory === "all"
      ? "Searching all categories"
      : `Searching ${categoryLabel(activeCategory)}`;
    elements.catalogCount.textContent = `${items.length} product families · ${variantTotal} configurations`;

    if (!items.length) {
      elements.grid.innerHTML = `
        <div class="catalog-empty">
          <strong>No catalog systems match that search.</strong><br>
          Clear the search or choose another category.
        </div>`;
      return;
    }

    elements.grid.innerHTML = items.map((product) => `
      <article class="catalog-product-card">
        <div class="catalog-card-visual" aria-hidden="true">
          <span class="catalog-card-code">${escapeHtml(cardCode(product))}</span>
        </div>
        <div class="catalog-product-body">
          <p class="catalog-product-category">${escapeHtml(product.category)}</p>
          <h2 class="catalog-product-title">${escapeHtml(product.name)}</h2>
          <p class="catalog-product-description">${escapeHtml(product.description)}</p>
          <div class="catalog-chip-list">
            <span class="catalog-chip">${escapeHtml(product.voltages)}</span>
            <span class="catalog-chip">${escapeHtml(product.waterproof)}</span>
            <span class="catalog-chip">${product.variants.length} variants</span>
            <span class="catalog-chip catalog-chip--quote">Complete project quote</span>
          </div>
          <dl class="catalog-card-meta">
            <div><dt>Control</dt><dd>${escapeHtml(product.control)}</dd></div>
            <div><dt>Colors</dt><dd>${escapeHtml(product.colors)}</dd></div>
            <div><dt>Density</dt><dd>${escapeHtml(product.densities)}</dd></div>
            <div><dt>Width</dt><dd>${escapeHtml(product.widths)}</dd></div>
          </dl>
          <div class="catalog-card-actions">
            <button class="btn btn-outline-light" type="button" data-details="${escapeHtml(product.id)}">View Variants</button>
            <button class="btn btn-neon-cyan" type="button" data-add-family="${escapeHtml(product.id)}">Add to Project</button>
          </div>
        </div>
      </article>`).join("");
  }

  function addSelection(product, variant = null) {
    const project = readProject();
    const key = variant ? `${product.id}:item-${variant.item}` : product.id;
    if (project.some((item) => item.key === key)) {
      setModalStatus("Already in project list.");
      return;
    }

    project.push({
      key,
      productId: product.id,
      productName: product.name,
      category: product.category,
      sourceItems: product.sourceItems,
      variant: variant ? {
        item: variant.item,
        length: variant.length,
        voltage: variant.voltage,
        density: variant.density,
        waterproof: variant.waterproof,
        width: variant.width,
        detail: variant.detail
      } : null,
      addedAt: new Date().toISOString()
    });
    writeProject(project);
    setModalStatus(variant ? `Item ${variant.item} added to project.` : "Product family added to project.");
  }

  function removeSelection(key) {
    writeProject(readProject().filter((item) => item.key !== key));
  }

  function renderProject() {
    const project = readProject();
    elements.projectCount.textContent = String(project.length);
    elements.requestQuote.disabled = !project.length;
    elements.clearProject.disabled = !project.length;

    if (!project.length) {
      elements.projectItems.innerHTML = '<p class="catalog-project-empty">Add product families to build a materials-and-installation request.</p>';
      return;
    }

    elements.projectItems.innerHTML = project.map((item) => {
      const variantText = item.variant
        ? `Item ${item.variant.item} · ${item.variant.length} · ${item.variant.voltage} · ${item.variant.density} · ${item.variant.waterproof}`
        : "Family selection · exact configuration to be finalized";
      return `
        <div class="catalog-project-item">
          <div>
            <strong>${escapeHtml(item.productName)}</strong>
            <span>${escapeHtml(variantText)}</span>
          </div>
          <button class="catalog-project-remove" type="button" data-remove-project="${escapeHtml(item.key)}">Remove</button>
        </div>`;
    }).join("");
  }

  function modalSummaryCell(label, value) {
    return `<div class="catalog-summary-cell"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`;
  }

  function setModalStatus(message) {
    if (!elements.modalStatus) return;
    elements.modalStatus.textContent = message;
    window.clearTimeout(elements.modalStatus._timer);
    elements.modalStatus._timer = window.setTimeout(() => {
      elements.modalStatus.textContent = "";
    }, 2600);
  }

  function openProduct(product) {
    activeProductId = product.id;
    elements.modalCategory.textContent = product.category;
    elements.modalTitle.textContent = product.name;
    elements.modalDescription.textContent = product.description;
    elements.modalSummary.innerHTML = [
      modalSummaryCell("Control", product.control),
      modalSummaryCell("Colors", product.colors),
      modalSummaryCell("Voltage", product.voltages),
      modalSummaryCell("Protection", product.waterproof),
      modalSummaryCell("Density", product.densities),
      modalSummaryCell("Widths", product.widths),
      modalSummaryCell("Best fits", (product.applications || []).join(", ")),
      modalSummaryCell("Source", product.sourceItems)
    ].join("");

    elements.variantRows.innerHTML = product.variants.map((variant, index) => `
      <tr>
        <td>${escapeHtml(variant.item)}</td>
        <td>${escapeHtml(variant.length)}</td>
        <td>${escapeHtml(variant.voltage)}</td>
        <td>${escapeHtml(variant.density)}</td>
        <td>${escapeHtml(variant.waterproof)}</td>
        <td>${escapeHtml(variant.width)}</td>
        <td>${escapeHtml(variant.detail || "—")}</td>
        <td><button class="btn btn-sm btn-neon-cyan catalog-variant-add" type="button" data-add-variant="${index}">Add Option</button></td>
      </tr>`).join("");

    elements.modalStatus.textContent = "";
    productModal.show();
  }

  function buildRequestEmail() {
    const project = readProject();
    if (!project.length) return;

    const lines = project.map((item, index) => {
      const variant = item.variant
        ? `Manufacturer item ${item.variant.item}; ${item.variant.length}; ${item.variant.voltage}; ${item.variant.density}; ${item.variant.waterproof}; ${item.variant.width}; ${item.variant.detail || ""}`
        : "Exact manufacturer configuration to be selected during project planning.";
      return `${index + 1}. ${item.productName}\n   Category: ${item.category}\n   Selection: ${variant}`;
    }).join("\n\n");

    const subject = "ShyneTyme Complete LED Project Quote Request";
    const body = [
      "I selected the following BTF-LIGHTING systems for a complete ShyneTyme materials-and-installation quote:",
      "",
      lines,
      "",
      "Project type:",
      "Installation address or ZIP code:",
      "Approximate measurements:",
      "Indoor/outdoor:",
      "Desired colors, effects and controls:",
      "Preferred timeline:",
      "",
      "Please provide the next steps for measurements, design review, material deposit and installation scheduling."
    ].join("\n");

    window.location.href = `mailto:westsidelistingservices@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  function setCategory(categoryId) {
    activeCategory = categories.some((category) => category.id === categoryId) ? categoryId : "all";
    populateCategories();
    renderCards();
    document.getElementById("catalog-shell")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  elements.categoryNav.addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (button) setCategory(button.dataset.category);
  });

  elements.categorySelect.addEventListener("change", () => setCategory(elements.categorySelect.value));
  elements.search.addEventListener("input", renderCards);
  elements.clearSearch.addEventListener("click", () => {
    elements.search.value = "";
    elements.search.focus();
    renderCards();
  });

  elements.grid.addEventListener("click", (event) => {
    const details = event.target.closest("[data-details]");
    if (details) {
      const product = products.find((item) => item.id === details.dataset.details);
      if (product) openProduct(product);
      return;
    }

    const add = event.target.closest("[data-add-family]");
    if (add) {
      const product = products.find((item) => item.id === add.dataset.addFamily);
      if (product) addSelection(product);
    }
  });

  elements.variantRows.addEventListener("click", (event) => {
    const button = event.target.closest("[data-add-variant]");
    if (!button) return;
    const product = products.find((item) => item.id === activeProductId);
    const variant = product?.variants?.[Number(button.dataset.addVariant)];
    if (product && variant) addSelection(product, variant);
  });

  elements.addFamilyFromModal.addEventListener("click", () => {
    const product = products.find((item) => item.id === activeProductId);
    if (product) addSelection(product);
  });

  elements.projectItems.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-project]");
    if (button) removeSelection(button.dataset.removeProject);
  });

  elements.requestQuote.addEventListener("click", buildRequestEmail);
  elements.clearProject.addEventListener("click", () => writeProject([]));

  elements.modal.addEventListener("hidden.bs.modal", () => {
    activeProductId = null;
    elements.modalStatus.textContent = "";
  });

  if (!catalog || !products.length) {
    elements.grid.innerHTML = '<div class="alert alert-danger" role="alert">The BTF-LIGHTING project catalog could not be loaded.</div>';
    elements.catalogCount.textContent = "Catalog unavailable";
    return;
  }

  populateCategories();
  renderCards();
  renderProject();
})();
