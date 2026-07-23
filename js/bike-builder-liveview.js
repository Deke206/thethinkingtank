(() => {
  "use strict";

  const data = window.ShynetymeBikeBuilderData;
  const renderer = window.ShynetymeBikeBuilderRenderer;
  if (!data || !renderer) return;

  const { bikeStyleLabels, sizeConfig, bikeBodies, equipmentLabels } = data;
  const { idFor, renderSideBike, renderRearViewPanel, fitTransform, setSvgHidden } = renderer;
  const form = document.getElementById("bikeBuilderForm");
  const mainBike = document.getElementById("mainBikeGroup");
  const kidBike = document.getElementById("kidBikeGroup");
  const preview = document.getElementById("bikePreview");
  const sizeLabel = document.getElementById("sizeLabel");
  const summary = document.getElementById("buildSummary");
  const rearPanel = document.getElementById("rearViewPanel");
  const appIcons = document.getElementById("appControlIcons");
  if (!form || !mainBike || !kidBike || !preview || !sizeLabel || !summary || !rearPanel) return;

  let currentView = "side";
  let currentMainBody = "comfort";
  let currentKidBody = "balance";
  let mainTransform = { x: 0, y: 0, scale: 1 };

  const bodyOptions = (selected) => Object.entries(bikeStyleLabels)
    .map(([value, label]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${label}</option>`)
    .join("");

  const addStyles = () => {
    if (document.querySelector("link[data-bike-builder-upgrade]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/bike-builder-upgrade.css?v=20260723-liveview-v2";
    link.dataset.bikeBuilderUpgrade = "true";
    document.head.appendChild(link);
  };

  const insertControls = () => {
    document.getElementById("frontViewPanel")?.remove();
    document.getElementById("previewViewButtons")?.remove();

    const frameSelect = document.getElementById("frameSize");
    const frameRow = frameSelect?.closest(".question-row");
    if (frameRow && !document.getElementById("bikeBodyStyle")) {
      const row = document.createElement("div");
      row.className = "question-row";
      row.innerHTML = `
        <label class="question-label" for="bikeBodyStyle">Primary bicycle body style</label>
        <select id="bikeBodyStyle" name="bikeBodyStyle" class="form-select">${bodyOptions("comfort")}</select>
        <div class="question-note mt-2">The SVG bicycle body changes while the street background remains in place.</div>`;
      frameRow.after(row);
    }

    const kidOptions = document.getElementById("kidBikeOptions");
    if (kidOptions) {
      kidOptions.innerHTML = `
        <label class="form-label fw-bold" for="kidBikeBodyStyle">Additional kid's bicycle body style</label>
        <select id="kidBikeBodyStyle" name="kidBikeBodyStyle" class="form-select mb-3">${bodyOptions("balance")}</select>
        <label class="form-label fw-bold" for="kidFrameSize">Additional kid's bicycle size</label>
        <select id="kidFrameSize" name="kidFrameSize" class="form-select">
          <option value="toddler">Toddler / balance bike</option>
          <option value="preschool" selected>Small child / preschool</option>
          <option value="youth">Youth bicycle</option>
        </select>
        <div class="question-note mt-2">The additional bicycle mirrors the selected lighting and rear-safety zones.</div>`;
    }

    const accordion = document.getElementById("builderAccordion");
    if (accordion && !document.getElementById("equipmentAddOns")) {
      const section = document.createElement("section");
      section.className = "accordion-item";
      section.innerHTML = `
        <h2 class="accordion-header">
          <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#equipmentAddOns" aria-expanded="false" aria-controls="equipmentAddOns">8. Equipment and add-ons</button>
        </h2>
        <div id="equipmentAddOns" class="accordion-collapse collapse" data-bs-parent="#builderAccordion">
          <div class="accordion-body">
            <div class="equipment-options-grid">
              ${Object.entries(equipmentLabels).map(([id, label]) => `<label class="equipment-option"><input class="equipment-checkbox" type="checkbox" id="${id}" value="${label}"><span>${label}</span></label>`).join("")}
            </div>
            <div class="question-note mt-3">Selected equipment appears as an additional live-view layer.</div>
          </div>
        </div>`;
      accordion.appendChild(section);
    }

    const previewNote = document.querySelector(".preview-rules__note");
    if (previewNote) {
      previewNote.textContent = "The rear vantage point opens only after selecting the rear brake light or turn signals. Any other builder selection returns every selected bicycle to the centered side view.";
    }
  };

  const selectedValue = (name) => form.querySelector(`input[name="${name}"]:checked`)?.value || "no";
  const isYes = (name) => selectedValue(name) === "yes";
  const zoneIds = (mainId) => [mainId, idFor("kid", mainId)];
  const zoneTargets = {
    frameLights: zoneIds("frameLightsSvg"),
    frontForks: zoneIds("frontForksSvg"),
    frontWheel: zoneIds("frontWheelSvg"),
    rearWheel: zoneIds("rearWheelSvg"),
    handlebars: zoneIds("handlebarsSvg"),
    frontBasket: zoneIds("frontBasketSvg"),
    rearBasket: zoneIds("rearBasketSvg"),
    pouch: zoneIds("handlebarPouchSvg"),
    seatPouch: zoneIds("seatPouchSvg"),
    flagPole: zoneIds("flagPoleSvg"),
    rearBrake: ["rearBrakeSvg", "kidRearBrakeSvg", "rearBrakeRearSvg", "kidRearBrakeRearSvg"],
    turnSignals: ["turnSignalsSvg", "kidTurnSignalsSvg", "turnSignalsRearSvg", "kidTurnSignalsRearSvg"],
    helmetLights: zoneIds("helmetLightsSvg")
  };

  const setZone = (ids, enabled) => ids.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.toggle("zone-on", enabled);
    element.classList.toggle("zone-off", !enabled);
  });

  const applySideLayout = () => {
    const hasKid = selectedValue("addKidBike") === "yes";
    const mainBody = bikeBodies[currentMainBody];
    const kidBody = bikeBodies[currentKidBody];
    const mainSize = sizeConfig[document.getElementById("frameSize")?.value || "adult"];

    if (!hasKid) {
      mainTransform = fitTransform(mainBody, mainSize.scale, 450, 825, 632);
      mainBike.setAttribute("transform", `translate(${mainTransform.x} ${mainTransform.y}) scale(${mainTransform.scale})`);
      setSvgHidden(kidBike, true);
    } else {
      const kidSize = sizeConfig[document.getElementById("kidFrameSize")?.value || "preschool"];
      mainTransform = fitTransform(mainBody, mainSize.scale, 300, 530, 632);
      const kidTransform = fitTransform(kidBody, kidSize.scale * .82, 700, 300, 632);
      mainBike.setAttribute("transform", `translate(${mainTransform.x} ${mainTransform.y}) scale(${mainTransform.scale})`);
      kidBike.setAttribute("transform", `translate(${kidTransform.x} ${kidTransform.y}) scale(${kidTransform.scale})`);
      setSvgHidden(kidBike, false);
    }

    const gapCenter = (mainBody.rearWheel.x + mainBody.frontWheel.x) / 2;
    const wheelBottom = Math.max(mainBody.rearWheel.y + mainBody.rearWheel.r, mainBody.frontWheel.y + mainBody.frontWheel.r);
    const iconScale = Math.max(.58, Math.min(.92, mainTransform.scale * .85));
    appIcons?.setAttribute("transform", `translate(${Math.round(mainTransform.x+gapCenter*mainTransform.scale-72*iconScale)} ${Math.round(mainTransform.y+wheelBottom*mainTransform.scale-43*iconScale)}) scale(${iconScale})`);

    const mainLabel = `${mainSize.label} · ${bikeStyleLabels[currentMainBody]}`;
    sizeLabel.textContent = hasKid ? `${mainLabel} + additional ${bikeStyleLabels[currentKidBody]}` : mainLabel;
  };

  const setEquipment = () => Object.entries(equipmentLabels).forEach(([inputId]) => {
    const element = document.getElementById(`${inputId}Svg`);
    const enabled = Boolean(document.getElementById(inputId)?.checked);
    element?.classList.toggle("equipment-on", enabled);
    element?.classList.toggle("equipment-off", !enabled);
  });

  const updateFlagStyle = () => {
    const enabled = isYes("flagPole");
    const style = document.getElementById("flagPoleStyle")?.value || "solid color red";
    ["flagPoleSvg", "kidFlagPoleSvg"].forEach((id) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.classList.remove("flag-flash-red", "flag-flash-orange", "flag-solid-red");
      if (enabled) {
        if (style.includes("orange")) group.classList.add("flag-flash-orange");
        else if (style.includes("flashing")) group.classList.add("flag-flash-red");
        else group.classList.add("flag-solid-red");
      }
    });
  };

  const updateTailStyle = () => {
    const enabled = isYes("rearBrake");
    const animated = document.getElementById("rearBrakeStyle")?.value === "animated center-out";
    ["rearBrakeSvg", "kidRearBrakeSvg", "rearBrakeRearSvg", "kidRearBrakeRearSvg"].forEach((id) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.classList.toggle("tail-solid", enabled && !animated);
      group.classList.toggle("tail-animated", enabled && animated);
    });
  };

  const updateSignalStyle = () => {
    const enabled = isYes("turnSignals");
    const animated = document.getElementById("turnSignalStyle")?.value === "animated directional gradient";
    ["turnSignalsSvg", "kidTurnSignalsSvg", "turnSignalsRearSvg", "kidTurnSignalsRearSvg"].forEach((id) => {
      const group = document.getElementById(id);
      if (!group) return;
      group.classList.toggle("signal-solid-orange", enabled && !animated);
      group.classList.toggle("signal-animated", enabled && animated);
    });
  };

  const updateHelmetStyle = () => {
    const enabled = isYes("helmetLights");
    const red = Boolean(document.getElementById("helmetRed")?.checked);
    const white = Boolean(document.getElementById("helmetWhite")?.checked);
    ["helmetRearLight", "kidHelmetRearLight"].forEach((id) => document.getElementById(id)?.setAttribute("fill", enabled && red ? "#ff1f3d" : "#b5bac3"));
    ["helmetFrontLight", "kidHelmetFrontLight"].forEach((id) => document.getElementById(id)?.setAttribute("fill", enabled && white ? "#fff" : "#b5bac3"));
  };

  const setView = () => {
    const rear = currentView === "rear";
    setSvgHidden(mainBike, rear);
    setSvgHidden(kidBike, rear || selectedValue("addKidBike") !== "yes");
    setSvgHidden(rearPanel, !rear);
    setSvgHidden(appIcons, rear);
  };

  const appendSummary = () => {
    summary.querySelectorAll("[data-upgrade-summary]").forEach((item) => item.remove());
    const lines = [`Primary body: ${bikeStyleLabels[currentMainBody]}`];
    if (selectedValue("addKidBike") === "yes") lines.push(`Additional kid's body: ${bikeStyleLabels[currentKidBody]}`);
    const equipment = Object.keys(equipmentLabels).filter((id) => document.getElementById(id)?.checked).map((id) => equipmentLabels[id]);
    if (equipment.length) lines.push(`Equipment: ${equipment.join(", ")}`);
    lines.forEach((line) => {
      const item = document.createElement("li");
      item.dataset.upgradeSummary = "true";
      item.textContent = line;
      summary.appendChild(item);
    });
  };

  const renderAll = () => {
    currentMainBody = document.getElementById("bikeBodyStyle")?.value || "comfort";
    currentKidBody = document.getElementById("kidBikeBodyStyle")?.value || "balance";
    renderSideBike(mainBike, currentMainBody, "", true);
    renderSideBike(kidBike, currentKidBody, "kid", false);
    renderRearViewPanel(rearPanel, currentMainBody, currentKidBody, selectedValue("addKidBike") === "yes");
  };

  const sync = () => {
    const kidOptions = document.getElementById("kidBikeOptions");
    if (kidOptions) kidOptions.hidden = selectedValue("addKidBike") !== "yes";
    renderAll();
    Object.entries(zoneTargets).forEach(([name, ids]) => setZone(ids, isYes(name)));
    applySideLayout();
    setEquipment();
    updateFlagStyle();
    updateTailStyle();
    updateSignalStyle();
    updateHelmetStyle();
    setView();
    appendSummary();
  };

  const isRearSafetyControl = (target) => {
    const name = target.name || "";
    const id = target.id || "";
    if ((name === "rearBrake" || name === "turnSignals") && target.value === "yes") return true;
    if (id === "rearBrakeStyle" && isYes("rearBrake")) return true;
    if (id === "turnSignalStyle" && isYes("turnSignals")) return true;
    return false;
  };

  addStyles();
  insertControls();

  form.addEventListener("change", (event) => {
    currentView = isRearSafetyControl(event.target) ? "rear" : "side";
    sync();
  });

  form.addEventListener("reset", () => window.setTimeout(() => {
    const mainSelect = document.getElementById("bikeBodyStyle");
    const kidSelect = document.getElementById("kidBikeBodyStyle");
    if (mainSelect) mainSelect.value = "comfort";
    if (kidSelect) kidSelect.value = "balance";
    document.querySelectorAll(".equipment-checkbox").forEach((input) => { input.checked = false; });
    currentView = "side";
    sync();
  }, 30));

  document.getElementById("copyBuild")?.addEventListener("click", async (event) => {
    event.stopImmediatePropagation();
    const text = `SHYNETYME WORKS — BUILD MY BIKE\n\n${[...summary.querySelectorAll("li")].map((item) => `• ${item.textContent}`).join("\n")}`;
    try {
      await navigator.clipboard.writeText(text);
      document.getElementById("copyStatus").textContent = "Build summary copied.";
    } catch (error) {
      const area = document.createElement("textarea");
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand("copy");
      area.remove();
      document.getElementById("copyStatus").textContent = "Build summary copied.";
    }
  }, { capture: true });

  sync();
})();
