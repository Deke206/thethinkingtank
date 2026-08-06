(() => {
  "use strict";

  if (window.ShynetymeAreaEffects?.initialized) return;

  const pagePath = window.location.pathname.toLowerCase();
  const simulator = pagePath.includes("bike")
    ? "bike"
    : pagePath.includes("home")
      ? "home"
      : pagePath.includes("auto") || pagePath.includes("ledsimauto")
        ? "auto"
        : "";

  if (!simulator) return;

  const SHARED_PRESET_KEY = "shynetymeSavedAreaEffectsV1";
  const ASSIGNMENT_KEY = `shynetymeAreaAssignmentsV1:${simulator}`;
  const MAX_SAVED_PRESETS = 20;
  const MAX_SEQUENCE_PRESETS = 10;
  const DEFAULT_STEP_SECONDS = 4;

  const EFFECTS = Object.freeze([
    { id: "solid", label: "Solid", base: "solid", directional: false, speed: false, palette: "single" },
    { id: "breathe", label: "Breathe", base: "breathe", directional: false, speed: true, palette: "two" },
    { id: "flash", label: "Flash", base: "breathe", directional: false, speed: true, palette: "two" },
    { id: "race", label: "Race", base: "chase", directional: true, speed: true, palette: "gradient" },
    { id: "wipe", label: "Color wipe", base: "wipe", directional: true, speed: true, palette: "two" },
    { id: "twinkle", label: "Twinkle", base: "twinkle", directional: false, speed: true, palette: "gradient" },
    { id: "stars", label: "Falling stars", base: "starlight", directional: true, speed: true, palette: "gradient" },
    { id: "comet", label: "Comet", base: "chase", directional: true, speed: true, palette: "gradient" },
    { id: "waterfall", label: "Waterfall", base: "wipe", directional: true, speed: true, palette: "gradient" },
    { id: "rainbow", label: "Rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },
    { id: "scanner", label: "Scanner", base: "scanner", directional: false, speed: true, palette: "two" },
    { id: "theater", label: "Theater chase", base: "theater", directional: true, speed: true, palette: "two" },
    { id: "sparkle", label: "Sparkle field", base: "starlight", directional: false, speed: true, palette: "gradient" },
    { id: "sections", label: "Section scramble", base: "sections", directional: false, speed: true, palette: "gradient" }
  ]);

  const SECTIONS = Object.freeze([
    ["whole", "All LEDs"],
    ["first-half", "First half"],
    ["second-half", "Second half"],
    ["first-third", "First third"],
    ["middle-third", "Middle third"],
    ["last-third", "Last third"]
  ]);

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const safeText = (value) => String(value ?? "").replace(/[<>&"']/g, (character) => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
  const makeId = () => `effect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
  const effectById = (id) => EFFECTS.find((effect) => effect.id === id) || EFFECTS[0];

  function defaultRecipe() {
    return {
      effect: "solid",
      section: "whole",
      paletteMode: "single",
      colors: ["#35e7ff", "#9b7cff", "#ff5ab9"],
      brightness: 100,
      speed: 55,
      direction: 1,
      duration: DEFAULT_STEP_SECONDS
    };
  }

  function makeAreas() {
    if (simulator === "bike") {
      return [
        { id: "bike-front-wheel", label: "Front wheel", targets: ["#frontWheelSvg"] },
        { id: "bike-rear-wheel", label: "Rear wheel", targets: ["#rearWheelSvg"] },
        { id: "bike-front-forks", label: "Front fork / shock", targets: ["#frontForksSvg"] },
        { id: "bike-front-cockpit", label: "Handlebars + front basket", targets: ["#handlebarsSvg", "#frontBasketSvg", "#handlebarPouchSvg"] },
        { id: "bike-frame-front", label: "Frame front / upper", targets: ["#frameLightsSvg path:nth-child(1)", "#frameLightsSvg path:nth-child(2)"] },
        { id: "bike-frame-rear", label: "Frame rear / lower", targets: ["#frameLightsSvg path:nth-child(3)", "#underglowSvg path"] },
        { id: "bike-rear-storage", label: "Rear basket + flag pole", targets: ["#rearBasketSvg", "#seatPouchSvg", "#flagPoleSvg .flag-pole-light"] },
        { id: "bike-tail-brake", label: "Rear brake / tail light", targets: ["#rearBrakeSvg", "#rearBrakeRearSvg"], safety: "brake" },
        { id: "bike-left-signal", label: "Left turn signal", targets: ["#turnSignalsSvg .signal-left", "#turnSignalsRearSvg .signal-left"], safety: "left" },
        { id: "bike-right-signal", label: "Right turn signal", targets: ["#turnSignalsSvg .signal-right", "#turnSignalsRearSvg .signal-right"], safety: "right" }
      ];
    }

    if (simulator === "home") {
      return [
        { id: "home-front-roof", label: "Front roofline", homeZones: ["front-roofline"] },
        { id: "home-front-windows", label: "Front windows + entry", homeZones: ["front-window-trim", "front-entry"] },
        { id: "home-front-porch", label: "Front porch + steps", homeZones: ["front-porch", "front-steps"] },
        { id: "home-front-garage", label: "Garage doors", homeZones: ["front-garage"] },
        { id: "home-front-ground", label: "Walkway + front accents", homeZones: ["front-walkway", "front-fixtures", "front-landscape"] },
        { id: "home-rear-roof", label: "Back roofline", homeZones: ["rear-roofline"] },
        { id: "home-rear-deck", label: "Back deck + balcony", homeZones: ["rear-balcony"] },
        { id: "home-rear-stairs", label: "Back stairs", homeZones: ["rear-stair-rails", "rear-stair-treads"] },
        { id: "home-rear-patio", label: "Patio doors + perimeter", homeZones: ["rear-doors", "rear-patio"] },
        { id: "home-rear-gazebo", label: "Gazebo + back accents", homeZones: ["rear-gazebo", "rear-fixtures", "rear-landscape"] }
      ];
    }

    return [
      { id: "auto-left-headlight", label: "Left headlight", autoGroup: "headlights", autoIndex: 0 },
      { id: "auto-right-headlight", label: "Right headlight", autoGroup: "headlights", autoIndex: 1 },
      { id: "auto-front-wheel", label: "Front wheel rim", autoGroup: "rings", autoIndex: 0 },
      { id: "auto-rear-wheel", label: "Rear wheel rim", autoGroup: "rings", autoIndex: 1 },
      { id: "auto-front-well", label: "Front wheel well", autoGroup: "wells", autoIndex: 0 },
      { id: "auto-rear-well", label: "Rear wheel well", autoGroup: "wells", autoIndex: 1 },
      { id: "auto-front-underglow", label: "Front underglow", autoGroup: "underglow", autoIndex: 0 },
      { id: "auto-side-underglow", label: "Side underglow", autoGroup: "underglow", autoIndex: 2 },
      { id: "auto-rear-underglow", label: "Rear underglow", autoGroup: "underglow", autoIndex: 1 },
      { id: "auto-rocker", label: "Rocker panels", autoGroup: "rocker", autoIndex: 0 }
    ];
  }

  const areas = makeAreas().map((area) => ({
    ...area,
    selected: false,
    active: false,
    mode: "single",
    program: [defaultRecipe()],
    startedAt: performance.now(),
    currentStep: -1
  }));

  let root = null;
  let editorRecipe = defaultRecipe();
  let savedPresets = [];
  let sequencePresetIds = [];
  let playAsSequence = false;
  let editingPresetId = "";
  let statusMessage = "Select one or more installation areas, create an effect, then press Apply.";
  let homeRefreshPending = false;

  function normalizeRecipe(recipe) {
    const fallback = defaultRecipe();
    const effect = effectById(recipe?.effect);
    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;
    while (colors.length < 3) colors.push(fallback.colors[colors.length]);
    return {
      effect: effect.id,
      section: SECTIONS.some(([id]) => id === recipe?.section) ? recipe.section : "whole",
      paletteMode: ["single", "two", "gradient"].includes(recipe?.paletteMode) ? recipe.paletteMode : effect.palette,
      colors,
      brightness: Math.min(100, Math.max(5, Number(recipe?.brightness) || fallback.brightness)),
      speed: Math.min(100, Math.max(1, Number(recipe?.speed) || fallback.speed)),
      direction: Number(recipe?.direction) < 0 ? -1 : 1,
      duration: DEFAULT_STEP_SECONDS
    };
  }

  function normalizedColors(recipe) {
    const colors = [...recipe.colors];
    if (recipe.paletteMode === "single") return [colors[0], colors[0], colors[0]];
    if (recipe.paletteMode === "two") return [colors[0], colors[1], colors[0]];
    return colors;
  }

  function normalizeForSafety(area, sourceRecipe) {
    const recipe = normalizeRecipe(sourceRecipe);
    if (area.safety === "brake") {
      recipe.effect = ["solid", "breathe", "flash"].includes(recipe.effect) ? recipe.effect : "flash";
      recipe.paletteMode = "single";
      recipe.colors = ["#ff1f3d", "#ff1f3d", "#ff1f3d"];
    }
    if (area.safety === "left" || area.safety === "right") {
      recipe.effect = ["solid", "race", "wipe", "comet"].includes(recipe.effect) ? recipe.effect : "race";
      recipe.paletteMode = "gradient";
      recipe.colors = ["#ff9a1f", "#ff2b1c", "#1b0700"];
      recipe.direction = area.safety === "left" ? -1 : 1;
    }
    return recipe;
  }

  function loadState() {
    try {
      const storedPresets = JSON.parse(localStorage.getItem(SHARED_PRESET_KEY));
      if (Array.isArray(storedPresets)) {
        savedPresets = storedPresets.slice(0, MAX_SAVED_PRESETS).map((preset) => ({
          id: String(preset.id || makeId()),
          name: String(preset.name || effectById(preset.recipe?.effect).label).slice(0, 42),
          recipe: normalizeRecipe(preset.recipe),
          createdAt: preset.createdAt || new Date().toISOString()
        }));
      }
    } catch (error) {
      console.warn("Saved effect presets could not be restored.", error);
    }

    try {
      const stored = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY));
      if (stored?.version !== 1 || stored.simulator !== simulator) return;
      sequencePresetIds = Array.isArray(stored.sequencePresetIds)
        ? stored.sequencePresetIds.filter((id) => savedPresets.some((preset) => preset.id === id)).slice(0, MAX_SEQUENCE_PRESETS)
        : [];
      playAsSequence = Boolean(stored.playAsSequence);
      (stored.areas || []).forEach((savedArea) => {
        const area = areas.find((item) => item.id === savedArea.id);
        if (!area) return;
        area.active = Boolean(savedArea.active);
        area.mode = savedArea.mode === "sequence" ? "sequence" : "single";
        area.program = Array.isArray(savedArea.program) && savedArea.program.length
          ? savedArea.program.slice(0, MAX_SEQUENCE_PRESETS).map(normalizeRecipe)
          : [defaultRecipe()];
        area.startedAt = performance.now();
      });
    } catch (error) {
      console.warn("Area assignments could not be restored.", error);
    }
  }

  function saveState() {
    try {
      localStorage.setItem(SHARED_PRESET_KEY, JSON.stringify(savedPresets));
      localStorage.setItem(ASSIGNMENT_KEY, JSON.stringify({
        version: 1,
        simulator,
        sequencePresetIds,
        playAsSequence,
        areas: areas.map((area) => ({
          id: area.id,
          active: area.active,
          mode: area.mode,
          program: area.program
        }))
      }));
    } catch (error) {
      console.warn("Area effect state could not be saved.", error);
    }
  }

  function selectedAreas() {
    return areas.filter((area) => area.selected);
  }

  function activeProgram(area) {
    return area.program.length ? area.program : [defaultRecipe()];
  }

  function currentRecipeFor(area, now) {
    const program = activeProgram(area);
    if (area.mode !== "sequence" || program.length === 1) return { recipe: program[0], index: 0 };
    const stepSeconds = DEFAULT_STEP_SECONDS;
    const index = Math.floor(((now - area.startedAt) / 1000) / stepSeconds) % program.length;
    return { recipe: program[index], index };
  }

  function elementTargets(area) {
    if (simulator === "auto") {
      const lines = document.querySelectorAll(`.auto-zone[data-zone="${area.autoGroup}"] .led-line`);
      return lines[area.autoIndex] ? [lines[area.autoIndex]] : [];
    }
    return (area.targets || []).flatMap((selector) => [...document.querySelectorAll(selector)]);
  }

  function clearDomArea(area) {
    elementTargets(area).forEach((element) => {
      delete element.dataset.simAreaActive;
      delete element.dataset.simEffect;
      delete element.dataset.simSection;
      element.classList.remove("zone-on");
      element.classList.add("zone-off");
      ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction"].forEach((property) => element.style.removeProperty(property));
    });
  }

  function applyDomArea(area, sourceRecipe) {
    const recipe = normalizeForSafety(area, sourceRecipe);
    const colors = normalizedColors(recipe);
    elementTargets(area).forEach((element) => {
      element.dataset.simAreaActive = "true";
      element.dataset.simEffect = recipe.effect;
      element.dataset.simSection = recipe.section;
      element.classList.add("zone-on");
      element.classList.remove("zone-off");
      element.style.setProperty("--sim-a", colors[0]);
      element.style.setProperty("--sim-b", colors[1]);
      element.style.setProperty("--sim-c", colors[2]);
      element.style.setProperty("--sim-brightness", String(recipe.brightness / 100));
      element.style.setProperty("--sim-speed", `${Math.max(0.3, 3.7 - ((recipe.speed / 100) * 3.3)).toFixed(2)}s`);
      element.style.setProperty("--sim-direction", recipe.direction < 0 ? "reverse" : "normal");
    });
  }

  function scheduleHomeRefresh() {
    if (homeRefreshPending) return;
    homeRefreshPending = true;
    window.setTimeout(() => {
      homeRefreshPending = false;
      const api = window.ShynetymeHomeSim;
      if (!api?.setScene) return;
      const activeView = document.querySelector("[data-scene].is-active, [data-scene][aria-pressed='true']");
      void api.setScene(activeView?.dataset.scene === "rear" ? "rear" : "front");
    }, 50);
  }

  function applyHomeArea(area, sourceRecipe) {
    const api = window.ShynetymeHomeSim;
    const presetApi = window.ShynetymeSimPresets;
    if (!api?.zoneSettings || !api?.selectedZones || !presetApi) return false;
    const recipe = normalizeForSafety(area, sourceRecipe);
    const effect = effectById(recipe.effect);
    const knownPreset = presetApi.getPreset(effect.base);
    (area.homeZones || []).forEach((zoneId) => {
      api.selectedZones.add(zoneId);
      api.zoneSettings.set(zoneId, {
        effect: effect.base,
        direction: recipe.direction,
        brightness: recipe.brightness,
        speed: recipe.speed,
        intensity: knownPreset.intensity,
        paletteMode: recipe.paletteMode,
        colors: normalizedColors(recipe),
        section: recipe.section,
        syncTarget: "",
        mirror: false,
        mirrorDirection: "same"
      });
    });
    scheduleHomeRefresh();
    return true;
  }

  function clearHomeArea(area) {
    const api = window.ShynetymeHomeSim;
    if (!api?.selectedZones) return false;
    (area.homeZones || []).forEach((zoneId) => api.selectedZones.delete(zoneId));
    scheduleHomeRefresh();
    return true;
  }

  function applyAreaRecipe(area, recipe) {
    if (!area.active) {
      if (simulator === "home") clearHomeArea(area);
      else clearDomArea(area);
      area.currentStep = -1;
      return;
    }
    if (simulator === "home") applyHomeArea(area, recipe);
    else applyDomArea(area, recipe);
  }

  function tick() {
    const now = performance.now();
    areas.forEach((area) => {
      if (!area.active) return;
      const current = currentRecipeFor(area, now);
      if (area.currentStep !== current.index) {
        area.currentStep = current.index;
        applyAreaRecipe(area, current.recipe);
        updateAreaButton(area);
      }
    });
  }

  function effectOptions(selectedId) {
    return EFFECTS.map((effect) => `<option value="${effect.id}"${effect.id === selectedId ? " selected" : ""}>${safeText(effect.label)}</option>`).join("");
  }

  function sectionOptions(selectedId) {
    return SECTIONS.map(([id, label]) => `<option value="${id}"${id === selectedId ? " selected" : ""}>${safeText(label)}</option>`).join("");
  }

  function areaButtonMarkup(area) {
    const current = area.active ? currentRecipeFor(area, performance.now()).recipe : null;
    const state = area.selected
      ? "Selected for next Apply"
      : area.active
        ? `${effectById(current.effect).label}${area.mode === "sequence" ? ` · ${area.program.length}-preset sequence` : ""}`
        : "Off";
    return `
      <button class="sim-area-button${area.selected ? " is-selected" : ""}${area.active ? " is-active" : ""}" type="button" data-area-id="${area.id}" aria-pressed="${area.selected}">
        <span class="sim-area-button__indicator" aria-hidden="true"></span>
        <strong>${safeText(area.label)}</strong>
        <small>LED area / controller run</small>
        <em>${safeText(state)}</em>
      </button>`;
  }

  function savedPresetMarkup(preset) {
    const recipe = preset.recipe;
    const colors = normalizedColors(recipe);
    const queued = sequencePresetIds.includes(preset.id);
    const order = sequencePresetIds.indexOf(preset.id);
    return `
      <article class="sim-saved-preset${queued ? " is-queued" : ""}${editingPresetId === preset.id ? " is-editing" : ""}" data-saved-preset="${preset.id}">
        <label class="sim-saved-preset__queue" title="Add to sequence">
          <input type="checkbox" data-preset-action="queue" data-preset-id="${preset.id}"${queued ? " checked" : ""}>
          <span>${queued ? order + 1 : "+"}</span>
        </label>
        <button class="sim-saved-preset__load" type="button" data-preset-action="load" data-preset-id="${preset.id}">
          <span class="sim-preset-swatches" style="--swatch-a:${colors[0]};--swatch-b:${colors[1]};--swatch-c:${colors[2]}"></span>
          <strong>${safeText(preset.name)}</strong>
          <small>${safeText(effectById(recipe.effect).label)} · ${safeText(SECTIONS.find(([id]) => id === recipe.section)?.[1] || "All LEDs")}</small>
        </button>
        <button class="sim-saved-preset__delete" type="button" data-preset-action="delete" data-preset-id="${preset.id}" aria-label="Delete ${safeText(preset.name)}">×</button>
      </article>`;
  }

  function sequenceMarkup() {
    if (!sequencePresetIds.length) return '<p class="sim-sequence-empty">No saved presets selected. Check up to 10 saved presets below.</p>';
    return sequencePresetIds.map((id, index) => {
      const preset = savedPresets.find((item) => item.id === id);
      if (!preset) return "";
      return `
        <div class="sim-sequence-chip" data-sequence-id="${id}">
          <b>${index + 1}</b>
          <span>${safeText(preset.name)}</span>
          <button type="button" data-sequence-action="up" data-sequence-id="${id}" aria-label="Move ${safeText(preset.name)} earlier">↑</button>
          <button type="button" data-sequence-action="down" data-sequence-id="${id}" aria-label="Move ${safeText(preset.name)} later">↓</button>
          <button type="button" data-sequence-action="remove" data-sequence-id="${id}" aria-label="Remove ${safeText(preset.name)} from sequence">×</button>
        </div>`;
    }).join("");
  }

  function renderWorkbench() {
    if (!root) return;
    const effect = effectById(editorRecipe.effect);
    const selectedCount = selectedAreas().length;
    root.innerHTML = `
      <section class="sim-area-panel sim-attention-frame" aria-labelledby="simAreaTitle">
        <div class="sim-panel-heading">
          <div><p>Step 1</p><h2 id="simAreaTitle">Select the LED installation areas</h2></div>
          <span id="simAreaSelectedCount">${selectedCount} selected</span>
        </div>
        <p class="sim-panel-note">These square buttons represent the physical LED areas. They are not controller setup menus.</p>
        <div class="sim-area-toolbar">
          <button type="button" data-workbench-action="select-all">Select all areas</button>
          <button type="button" data-workbench-action="clear-selection">Clear selection</button>
          <button type="button" data-workbench-action="turn-off">Turn selected areas off</button>
        </div>
        <div class="sim-area-grid">${areas.map(areaButtonMarkup).join("")}</div>
      </section>

      <section class="sim-effect-panel sim-attention-frame" aria-labelledby="simEffectTitle">
        <div class="sim-panel-heading">
          <div><p>Step 2</p><h2 id="simEffectTitle">Create the effect for the selected areas</h2></div>
          <span>One shared context editor</span>
        </div>
        <div class="sim-effect-grid">
          <label class="sim-field sim-field--wide">Effect
            <select id="simEffectType">${effectOptions(editorRecipe.effect)}</select>
          </label>
          <label class="sim-field">LED section
            <select id="simEffectSection">${sectionOptions(editorRecipe.section)}</select>
          </label>
          <label class="sim-field">Color use
            <select id="simPaletteMode">
              <option value="single"${editorRecipe.paletteMode === "single" ? " selected" : ""}>One color</option>
              <option value="two"${editorRecipe.paletteMode === "two" ? " selected" : ""}>Foreground + background</option>
              <option value="gradient"${editorRecipe.paletteMode === "gradient" ? " selected" : ""}>Three colors / gradient</option>
            </select>
          </label>
          <label class="sim-field sim-color-field">Primary
            <input id="simColor1" type="color" value="${editorRecipe.colors[0]}">
          </label>
          <label class="sim-field sim-color-field" data-color-wrap="2"${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second
            <input id="simColor2" type="color" value="${editorRecipe.colors[1]}">
          </label>
          <label class="sim-field sim-color-field" data-color-wrap="3"${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third
            <input id="simColor3" type="color" value="${editorRecipe.colors[2]}">
          </label>
          <label class="sim-field">Brightness <output id="simBrightnessOut">${editorRecipe.brightness}%</output>
            <input id="simBrightness" type="range" min="5" max="100" value="${editorRecipe.brightness}">
          </label>
          <label class="sim-field" id="simSpeedWrap"${effect.speed ? "" : " hidden"}>Speed <output id="simSpeedOut">${editorRecipe.speed}</output>
            <input id="simSpeed" type="range" min="1" max="100" value="${editorRecipe.speed}">
          </label>
          <label class="sim-field" id="simDirectionWrap"${effect.directional ? "" : " hidden"}>Direction
            <select id="simDirection"><option value="1"${editorRecipe.direction >= 0 ? " selected" : ""}>Forward</option><option value="-1"${editorRecipe.direction < 0 ? " selected" : ""}>Reverse</option></select>
          </label>
          <div class="sim-effect-preview" id="simEffectPreview" style="--preview-a:${editorRecipe.colors[0]};--preview-b:${editorRecipe.colors[1]};--preview-c:${editorRecipe.colors[2]}">
            <span>${safeText(effect.label)}</span>
          </div>
        </div>
        <div class="sim-effect-actions">
          <label class="sim-preset-name">Preset name
            <input id="simPresetName" type="text" maxlength="42" value="${safeText(editingPresetId ? savedPresets.find((item) => item.id === editingPresetId)?.name || "" : `${effect.label} ${savedPresets.length + 1}`)}">
          </label>
          ${editingPresetId ? '<button type="button" data-workbench-action="new-preset">New preset</button>' : ""}
          <button class="sim-save-button" type="button" data-workbench-action="save-preset">${editingPresetId ? "Update saved preset" : "Save preset"}</button>
          <button class="sim-apply-button" type="button" data-workbench-action="apply">Apply to selected areas</button>
        </div>
        <p class="sim-apply-status" id="simApplyStatus" role="status" aria-live="polite">${safeText(statusMessage)}</p>
      </section>

      <section class="sim-saved-panel sim-attention-frame" aria-labelledby="simSavedTitle">
        <div class="sim-panel-heading">
          <div><p>Step 3 · Optional</p><h2 id="simSavedTitle">Saved presets and sequence</h2></div>
          <span>${savedPresets.length} / ${MAX_SAVED_PRESETS} saved</span>
        </div>
        <div class="sim-sequence-controls">
          <label class="sim-sequence-toggle">
            <input id="simPlaySequence" type="checkbox"${playAsSequence ? " checked" : ""}>
            <span><strong>Play selected presets as a sequence</strong><small>Only the currently selected installation areas receive this sequence when Apply is pressed.</small></span>
          </label>
          <span>${sequencePresetIds.length} / ${MAX_SEQUENCE_PRESETS} in sequence</span>
        </div>
        <div class="sim-sequence-tray">${sequenceMarkup()}</div>
        <div class="sim-saved-grid">${savedPresets.length ? savedPresets.map(savedPresetMarkup).join("") : '<p class="sim-saved-empty">No presets saved yet. Build an effect above and press Save preset.</p>'}</div>
      </section>

      <section class="sim-build-actions sim-attention-frame">
        <div><strong>Finished assigning effects?</strong><span>The quote carries each active installation area and its applied effect or sequence.</span></div>
        <button type="button" data-workbench-action="request">Request this installation</button>
      </section>`;
  }

  function readEditor() {
    const effect = effectById(root.querySelector("#simEffectType")?.value || editorRecipe.effect);
    return normalizeRecipe({
      effect: effect.id,
      section: root.querySelector("#simEffectSection")?.value,
      paletteMode: root.querySelector("#simPaletteMode")?.value,
      colors: [
        root.querySelector("#simColor1")?.value || editorRecipe.colors[0],
        root.querySelector("#simColor2")?.value || editorRecipe.colors[1],
        root.querySelector("#simColor3")?.value || editorRecipe.colors[2]
      ],
      brightness: root.querySelector("#simBrightness")?.value,
      speed: root.querySelector("#simSpeed")?.value,
      direction: root.querySelector("#simDirection")?.value
    });
  }

  function updateEditorVisibility() {
    editorRecipe = readEditor();
    const effect = effectById(editorRecipe.effect);
    const speedWrap = root.querySelector("#simSpeedWrap");
    const directionWrap = root.querySelector("#simDirectionWrap");
    const color2Wrap = root.querySelector('[data-color-wrap="2"]');
    const color3Wrap = root.querySelector('[data-color-wrap="3"]');
    if (speedWrap) speedWrap.hidden = !effect.speed;
    if (directionWrap) directionWrap.hidden = !effect.directional;
    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";
    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";
    const preview = root.querySelector("#simEffectPreview");
    if (preview) {
      preview.style.setProperty("--preview-a", editorRecipe.colors[0]);
      preview.style.setProperty("--preview-b", editorRecipe.colors[1]);
      preview.style.setProperty("--preview-c", editorRecipe.colors[2]);
      preview.querySelector("span").textContent = effect.label;
    }
    const brightnessOut = root.querySelector("#simBrightnessOut");
    const speedOut = root.querySelector("#simSpeedOut");
    if (brightnessOut) brightnessOut.textContent = `${editorRecipe.brightness}%`;
    if (speedOut) speedOut.textContent = String(editorRecipe.speed);
  }

  function updateStatus(message) {
    statusMessage = message;
    const status = root?.querySelector("#simApplyStatus");
    if (status) status.textContent = message;
  }

  function updateAreaButton(area) {
    const existing = root?.querySelector(`[data-area-id="${area.id}"]`);
    if (!existing) return;
    const wrapper = document.createElement("div");
    wrapper.innerHTML = areaButtonMarkup(area).trim();
    existing.replaceWith(wrapper.firstElementChild);
    const count = root.querySelector("#simAreaSelectedCount");
    if (count) count.textContent = `${selectedAreas().length} selected`;
  }

  function clearAreaSelections() {
    areas.forEach((area) => { area.selected = false; });
  }

  function applyToSelectedAreas() {
    const targets = selectedAreas();
    if (!targets.length) {
      updateStatus("Select at least one installation area before pressing Apply.");
      return;
    }

    editorRecipe = readEditor();
    let program = [editorRecipe];
    let mode = "single";

    if (playAsSequence) {
      program = sequencePresetIds
        .map((id) => savedPresets.find((preset) => preset.id === id)?.recipe)
        .filter(Boolean)
        .map(normalizeRecipe);
      if (!program.length) {
        updateStatus("Select at least one saved preset for the sequence, or turn off Play as sequence.");
        return;
      }
      mode = "sequence";
    }

    const startedAt = performance.now();
    targets.forEach((area) => {
      area.active = true;
      area.mode = mode;
      area.program = program.map((recipe) => normalizeForSafety(area, recipe));
      area.startedAt = startedAt;
      area.currentStep = -1;
      applyAreaRecipe(area, area.program[0]);
    });

    const targetCount = targets.length;
    clearAreaSelections();
    saveState();
    renderWorkbench();
    updateStatus(mode === "sequence"
      ? `Applied the ${program.length}-preset sequence to ${targetCount} area${targetCount === 1 ? "" : "s"}. The area selections were cleared.`
      : `Applied ${effectById(editorRecipe.effect).label} to ${targetCount} area${targetCount === 1 ? "" : "s"}. The area selections were cleared.`);
  }

  function turnSelectedOff() {
    const targets = selectedAreas();
    if (!targets.length) {
      updateStatus("Select the installation areas you want to turn off.");
      return;
    }
    targets.forEach((area) => {
      area.active = false;
      area.currentStep = -1;
      applyAreaRecipe(area, area.program[0]);
    });
    const count = targets.length;
    clearAreaSelections();
    saveState();
    renderWorkbench();
    updateStatus(`Turned off ${count} area${count === 1 ? "" : "s"}. The area selections were cleared.`);
  }

  function savePreset() {
    editorRecipe = readEditor();
    const nameInput = root.querySelector("#simPresetName");
    const name = String(nameInput?.value || effectById(editorRecipe.effect).label).trim().slice(0, 42);

    if (editingPresetId) {
      const preset = savedPresets.find((item) => item.id === editingPresetId);
      if (!preset) {
        editingPresetId = "";
        updateStatus("That saved preset no longer exists.");
        return;
      }
      preset.name = name || effectById(editorRecipe.effect).label;
      preset.recipe = clone(editorRecipe);
      saveState();
      renderWorkbench();
      updateStatus(`Updated the saved preset “${preset.name}”.`);
      return;
    }

    if (savedPresets.length >= MAX_SAVED_PRESETS) {
      updateStatus(`The 20 saved-preset slots are full. Delete one before saving another.`);
      return;
    }

    const preset = {
      id: makeId(),
      name: name || `${effectById(editorRecipe.effect).label} ${savedPresets.length + 1}`,
      recipe: clone(editorRecipe),
      createdAt: new Date().toISOString()
    };
    savedPresets.push(preset);
    editingPresetId = preset.id;
    saveState();
    renderWorkbench();
    updateStatus(`Saved “${preset.name}” as preset ${savedPresets.length} of ${MAX_SAVED_PRESETS}.`);
  }

  function loadPreset(presetId) {
    const preset = savedPresets.find((item) => item.id === presetId);
    if (!preset) return;
    editorRecipe = clone(preset.recipe);
    editingPresetId = preset.id;
    renderWorkbench();
    updateStatus(`Loaded “${preset.name}” into the effect editor. Change it and press Update saved preset only when needed.`);
  }

  function deletePreset(presetId) {
    const preset = savedPresets.find((item) => item.id === presetId);
    if (!preset) return;
    savedPresets = savedPresets.filter((item) => item.id !== presetId);
    sequencePresetIds = sequencePresetIds.filter((id) => id !== presetId);
    if (editingPresetId === presetId) editingPresetId = "";
    saveState();
    renderWorkbench();
    updateStatus(`Deleted the saved preset “${preset.name}”.`);
  }

  function togglePresetInSequence(presetId, shouldQueue) {
    if (shouldQueue) {
      if (sequencePresetIds.includes(presetId)) return;
      if (sequencePresetIds.length >= MAX_SEQUENCE_PRESETS) {
        updateStatus("A sequence can contain no more than 10 saved presets.");
        renderWorkbench();
        return;
      }
      sequencePresetIds.push(presetId);
    } else {
      sequencePresetIds = sequencePresetIds.filter((id) => id !== presetId);
    }
    saveState();
    renderWorkbench();
  }

  function moveSequencePreset(presetId, offset) {
    const index = sequencePresetIds.indexOf(presetId);
    const target = index + offset;
    if (index < 0 || target < 0 || target >= sequencePresetIds.length) return;
    [sequencePresetIds[index], sequencePresetIds[target]] = [sequencePresetIds[target], sequencePresetIds[index]];
    saveState();
    renderWorkbench();
  }

  function requestInstallation() {
    const configured = areas.filter((area) => area.active).map((area) => ({
      id: area.id,
      label: area.label,
      controllerRun: true,
      mode: area.mode,
      program: area.program.map((recipe, index) => ({
        order: index + 1,
        ...recipe,
        effectLabel: effectById(recipe.effect).label
      }))
    }));
    const payload = {
      version: 3,
      simulator,
      architecture: "installation-areas-with-shared-effect-editor",
      configuredAreas: configured,
      savedPresetCount: savedPresets.length,
      updatedAt: new Date().toISOString()
    };
    sessionStorage.setItem(`shynetymeSim${simulator[0].toUpperCase()}${simulator.slice(1)}Selections`, JSON.stringify(payload));
    localStorage.setItem("shynetymeContactDraft", JSON.stringify({
      source: `${simulator}-sim-area-effects`,
      projectType: `${simulator[0].toUpperCase()}${simulator.slice(1)} LED installation`,
      message: configured.map((area) => `${area.label}: ${area.mode === "sequence" ? `${area.program.length}-preset sequence` : effectById(area.program[0].effect).label}`).join("\n"),
      simulatorPayload: payload
    }));
    window.location.href = "contact.html?source=sim-area-effects#contact-request";
  }

  function bindWorkbench() {
    root.addEventListener("click", (event) => {
      const areaButton = event.target.closest("[data-area-id]");
      if (areaButton) {
        const area = areas.find((item) => item.id === areaButton.dataset.areaId);
        if (!area) return;
        area.selected = !area.selected;
        updateAreaButton(area);
        return;
      }

      const button = event.target.closest("button");
      if (!button) return;
      const workbenchAction = button.dataset.workbenchAction;
      const presetAction = button.dataset.presetAction;
      const sequenceAction = button.dataset.sequenceAction;

      if (presetAction === "load") loadPreset(button.dataset.presetId);
      if (presetAction === "delete") deletePreset(button.dataset.presetId);
      if (sequenceAction === "up") moveSequencePreset(button.dataset.sequenceId, -1);
      if (sequenceAction === "down") moveSequencePreset(button.dataset.sequenceId, 1);
      if (sequenceAction === "remove") togglePresetInSequence(button.dataset.sequenceId, false);

      if (workbenchAction === "select-all") {
        areas.forEach((area) => { area.selected = true; });
        renderWorkbench();
      }
      if (workbenchAction === "clear-selection") {
        clearAreaSelections();
        renderWorkbench();
      }
      if (workbenchAction === "turn-off") turnSelectedOff();
      if (workbenchAction === "apply") applyToSelectedAreas();
      if (workbenchAction === "save-preset") savePreset();
      if (workbenchAction === "new-preset") {
        editingPresetId = "";
        editorRecipe = defaultRecipe();
        renderWorkbench();
        updateStatus("Started a new unsaved effect preset.");
      }
      if (workbenchAction === "request") requestInstallation();
    });

    root.addEventListener("change", (event) => {
      const target = event.target;
      if (target.dataset.presetAction === "queue") {
        togglePresetInSequence(target.dataset.presetId, target.checked);
        return;
      }
      if (target.id === "simPlaySequence") {
        playAsSequence = target.checked;
        saveState();
        updateStatus(playAsSequence
          ? "Sequence mode is on. Apply will use the ordered saved presets below."
          : "Sequence mode is off. Apply will use the single effect in the editor.");
        return;
      }
      if (target.id === "simEffectType") {
        const effect = effectById(target.value);
        editorRecipe.effect = effect.id;
        editorRecipe.paletteMode = effect.palette;
        const palette = root.querySelector("#simPaletteMode");
        if (palette) palette.value = effect.palette;
      }
      if (["simEffectType", "simEffectSection", "simPaletteMode", "simDirection"].includes(target.id)) updateEditorVisibility();
    });

    root.addEventListener("input", (event) => {
      if (["simColor1", "simColor2", "simColor3", "simBrightness", "simSpeed"].includes(event.target.id)) updateEditorVisibility();
    });
  }

  function preparePage() {
    document.body.classList.add("sim-area-mode", `sim-area-${simulator}`);
    root = document.createElement("div");
    root.id = "simAreaEffectsWorkbench";
    root.className = "sim-area-workbench";

    if (simulator === "bike") {
      const form = document.querySelector(".builder-form");
      if (form) form.hidden = true;
      const shell = document.querySelector(".builder-shell") || document.querySelector("main .container") || document.querySelector("main");
      const preview = document.querySelector(".preview-card");
      if (shell && preview) {
        shell.prepend(preview);
        preview.after(root);
      } else {
        shell?.appendChild(root);
      }
    } else if (simulator === "home") {
      const consolePanel = document.querySelector(".home-sim-console");
      if (consolePanel) consolePanel.hidden = true;
      const oldDialog = document.getElementById("homeZoneDialog");
      if (oldDialog) oldDialog.hidden = true;
      const layout = document.querySelector(".home-sim-layout") || document.querySelector("main");
      const viewer = document.querySelector(".home-sim-viewer");
      if (layout && viewer) viewer.after(root);
      else layout?.appendChild(root);
    } else {
      document.getElementById("controls")?.closest("section,aside,div")?.setAttribute("hidden", "");
      document.getElementById("summary")?.closest("aside")?.setAttribute("hidden", "");
      const main = document.querySelector("main") || document.body;
      main.appendChild(root);
    }

    renderWorkbench();
    bindWorkbench();
  }

  function initialize() {
    loadState();
    preparePage();
    areas.forEach((area) => {
      if (!area.active) return;
      area.startedAt = performance.now();
      applyAreaRecipe(area, area.program[0]);
    });
    window.setInterval(tick, 120);
    window.ShynetymeAreaEffects = {
      initialized: true,
      simulator,
      areas,
      effects: EFFECTS,
      get savedPresets() { return savedPresets; },
      get sequencePresetIds() { return sequencePresetIds; },
      apply: applyToSelectedAreas,
      reset() {
        localStorage.removeItem(ASSIGNMENT_KEY);
        window.location.reload();
      }
    };
    window.ShynetymeNodeSequence = window.ShynetymeAreaEffects;
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
