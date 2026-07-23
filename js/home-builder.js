(() => {
  "use strict";

  const form = document.getElementById("homeBuilderForm");
  const preview = document.getElementById("homePreview");
  const summary = document.getElementById("homeBuildSummary");
  const budget = document.getElementById("budget");
  const budgetBadge = document.getElementById("homeBudgetBadge");
  const copyStatus = document.getElementById("homeCopyStatus");
  const viewLabel = document.getElementById("homeViewLabel");
  if (!form || !preview || !summary || !budget || !budgetBadge || !viewLabel) return;

  const views = {
    plan: { label: "Site plan", element: document.getElementById("viewPlan") },
    front: { label: "Front + garage", element: document.getElementById("viewFront") },
    rear: { label: "Rear face", element: document.getElementById("viewRear") },
    garden: { label: "Garden + gazebo", element: document.getElementById("viewGarden") }
  };

  const zoneLabels = {
    roofline: "Front roofline",
    garage: "Garage outline",
    porch: "Porch / columns",
    frontDoor: "Front-door frame",
    windows: "Window outlines",
    driveway: "Driveway edges",
    frontPath: "Front walkway",
    rearRoofline: "Rear roofline",
    patioDoor: "Patio-door frame",
    wallLamps: "Rear wall lamps",
    stairs: "Exterior staircase / rail",
    balcony: "Second-story landing",
    patio: "Patio perimeter",
    gazebo: "Gazebo / pergola",
    gardenPath: "Garden pathway",
    gardenBeds: "Garden-bed edges",
    fence: "Fence / gate",
    tree: "Tree accents"
  };

  let currentView = "plan";

  for (let amount = 500; amount <= 15000; amount += amount < 3000 ? 250 : 500) {
    const option = document.createElement("option");
    option.value = String(amount);
    option.textContent = `$${amount.toLocaleString()}`;
    option.selected = amount === 1500;
    budget.appendChild(option);
  }

  const setView = (viewName) => {
    currentView = views[viewName] ? viewName : "plan";
    Object.entries(views).forEach(([name, config]) => {
      const hidden = name !== currentView;
      config.element.hidden = hidden;
      config.element.toggleAttribute("hidden", hidden);
    });
    document.querySelectorAll("[data-home-view]").forEach((button) => {
      const active = button.dataset.homeView === currentView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    updateViewLabel();
  };

  const updateViewLabel = () => {
    const stories = document.getElementById("homeStories").value === "two" ? "Two story" : "Single story";
    const garageMap = { none: "No garage", one: "One-car garage", two: "Two-car garage" };
    const garage = garageMap[document.getElementById("garageBays").value];
    viewLabel.textContent = `${views[currentView].label} · ${stories} · ${garage}`;
  };

  const updateStructure = () => {
    const twoStory = document.getElementById("homeStories").value === "two";
    preview.querySelectorAll(".second-story").forEach((element) => {
      element.hidden = !twoStory;
      element.toggleAttribute("hidden", !twoStory);
    });

    const garageBays = document.getElementById("garageBays").value;
    const garageFront = document.getElementById("garageFront");
    if (garageFront) {
      const hidden = garageBays === "none";
      garageFront.hidden = hidden;
      garageFront.toggleAttribute("hidden", hidden);
    }
    const doorLines = document.getElementById("garageDoorLines");
    if (doorLines) {
      doorLines.setAttribute("d", garageBays === "one" ? "M680 330H885V500H680Z" : "M680 330H885V500H680ZM782 330V500");
    }

    const lotWidth = document.getElementById("lotWidth").value;
    const plan = document.getElementById("viewPlan");
    plan?.classList.toggle("lot-compact", lotWidth === "compact");
    plan?.classList.toggle("lot-wide", lotWidth === "wide");
  };

  const updateZones = () => {
    Object.keys(zoneLabels).forEach((zoneName) => {
      const enabled = Boolean(document.getElementById(zoneName)?.checked);
      preview.querySelectorAll(`[data-zone="${zoneName}"]`).forEach((element) => {
        element.classList.toggle("zone-on", enabled);
        element.classList.toggle("zone-off", !enabled);
      });
    });
  };

  const selectedControls = () => [...document.querySelectorAll(".control-input:checked")].map((input) => input.value);
  const selectedZones = () => Object.entries(zoneLabels).filter(([id]) => document.getElementById(id)?.checked).map(([, label]) => label);

  const summaryLines = () => {
    const stories = document.getElementById("homeStories").selectedOptions[0].textContent;
    const garage = document.getElementById("garageBays").selectedOptions[0].textContent;
    const lot = document.getElementById("lotWidth").selectedOptions[0].textContent;
    const zones = selectedZones();
    const controls = selectedControls();
    const lines = [
      `Property: ${stories}; ${garage}; ${lot}`,
      `Lighting zones: ${zones.length ? zones.join(", ") : "none selected"}`,
      `Effect style: ${document.getElementById("effectStyle").selectedOptions[0].textContent}`,
      `Controls: ${controls.length ? controls.join(", ") : "none selected"}`,
      `Weather exposure: ${document.getElementById("weatherproofing").selectedOptions[0].textContent}`,
      `Suggested budget: $${Number(budget.value).toLocaleString()}`
    ];
    const dimensions = document.getElementById("propertyDimensions").value.trim();
    const notes = document.getElementById("projectNotes").value.trim();
    if (dimensions) lines.push(`Known dimensions: ${dimensions}`);
    if (notes) lines.push(`Notes: ${notes}`);
    return lines;
  };

  const updateSummary = () => {
    const lines = summaryLines();
    summary.innerHTML = lines.map((line) => `<li>${line}</li>`).join("");
    budgetBadge.textContent = `Budget: $${Number(budget.value).toLocaleString()}`;
  };

  const sync = () => {
    updateStructure();
    updateZones();
    updateViewLabel();
    updateSummary();
  };

  document.querySelector(".home-view-buttons")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-home-view]");
    if (!button) return;
    setView(button.dataset.homeView);
  });

  form.addEventListener("change", (event) => {
    const targetView = event.target.dataset.viewTarget;
    if (targetView && event.target.checked) setView(targetView);
    sync();
  });

  form.addEventListener("input", (event) => {
    if (event.target.matches("textarea")) updateSummary();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      budget.value = "1500";
      copyStatus.textContent = "";
      setView("plan");
      sync();
    }, 20);
  });

  document.getElementById("copyHomeBuild")?.addEventListener("click", async () => {
    const text = `SHYNETYME WORKS — BUILD MY HOME\n\n${summaryLines().map((line) => `• ${line}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Home build summary copied.";
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      copyStatus.textContent = "Home build summary copied.";
    }
  });

  setView("plan");
  sync();
})();
