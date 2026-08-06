(() => {
  "use strict";

  if (window.ShynetymeNodeSequence?.initialized) return;

  const PAGE_PATH = window.location.pathname.toLowerCase();
  const simulator = PAGE_PATH.includes("bike")
    ? "bike"
    : PAGE_PATH.includes("home")
      ? "home"
      : PAGE_PATH.includes("auto") || PAGE_PATH.includes("ledsimauto")
        ? "auto"
        : "";

  if (!simulator) return;

  const STORAGE_KEY = `shynetymeNodeSequenceV2:${simulator}`;
  const CONTROLLERS = Object.freeze([
    { id: "sp803e", label: "WLED ESP32 · SP803E", transport: "Wi-Fi / WLED" },
    { id: "sp630e", label: "Bluetooth SPI · SP630E", transport: "Bluetooth" },
    { id: "sp530e", label: "Smart Wi-Fi/Voice · SP530E", transport: "Wi-Fi + Bluetooth" }
  ]);

  const PRESETS = Object.freeze([
    { id: "solid", label: "Solid", base: "solid", editable: true, colors: ["#35e7ff", "#35e7ff", "#030918"] },
    { id: "breathe", label: "Breathe", base: "breathe", editable: true, colors: ["#35e7ff", "#9b7cff", "#030918"] },
    { id: "triple-twinkle", label: "Three-color twinkle", base: "twinkle", editable: true, colors: ["#35e7ff", "#ff5ab9", "#ffe76a"] },
    { id: "gradient-chase", label: "Gradient chase", base: "chase", editable: true, colors: ["#35e7ff", "#9b7cff", "#030918"] },
    { id: "rain-cascade", label: "Rain cascade", base: "wipe", editable: true, colors: ["#31e6ff", "#7aa7ff", "#06152f"] },
    { id: "foreground-cascade", label: "Foreground cascade", base: "theater", editable: true, colors: ["#ff5ab9", "#35e7ff", "#06152f"] },
    { id: "center-out", label: "Center-out sweep", base: "scanner", editable: true, colors: ["#ff3b47", "#ff8a3d", "#030918"] },
    { id: "center-in", label: "Center-in sweep", base: "scanner", editable: true, colors: ["#35e7ff", "#9b7cff", "#030918"] },
    { id: "section-scramble", label: "Section scramble", base: "sections", editable: true, colors: ["#35e7ff", "#ff5ab9", "#ffe76a"] },
    { id: "rainbow", label: "Custom rainbow", base: "rainbow", editable: true, colors: ["#ff3b47", "#ffe76a", "#35e7ff"] },
    { id: "meteor-cyan", label: "Cyan meteor", base: "chase", editable: false, colors: ["#eaffff", "#31e6ff", "#02111d"] },
    { id: "fireworks", label: "Fireworks", base: "starlight", editable: false, colors: ["#ffffff", "#ff5ab9", "#35e7ff"] },
    { id: "confetti", label: "Confetti field", base: "twinkle", editable: false, colors: ["#ff4a4a", "#ffe76a", "#35e7ff"] },
    { id: "aurora", label: "Aurora flow", base: "sections", editable: false, colors: ["#55e6b5", "#35e7ff", "#9b7cff"] },
    { id: "ocean-chase", label: "Ocean chase", base: "chase", editable: false, colors: ["#31e6ff", "#246bff", "#03142d"] },
    { id: "sunset-chase", label: "Sunset chase", base: "chase", editable: false, colors: ["#ff3b47", "#ff8a3d", "#6b1b7c"] },
    { id: "neon-pulse", label: "Neon pulse", base: "breathe", editable: false, colors: ["#ff2bd6", "#31e6ff", "#030918"] },
    { id: "candy-stripe", label: "Candy stripe", base: "theater", editable: false, colors: ["#ff2f5b", "#ffffff", "#030918"] },
    { id: "lava-flow", label: "Lava flow", base: "wipe", editable: false, colors: ["#ff2b1c", "#ff9a1f", "#210300"] },
    { id: "star-field", label: "Star field", base: "starlight", editable: false, colors: ["#ffffff", "#b8d8ff", "#04091a"] },
    { id: "dual-comet", label: "Dual comet", base: "scanner", editable: false, colors: ["#35e7ff", "#ff5ab9", "#030918"] },
    { id: "sparkle-trail", label: "Sparkle trail", base: "twinkle", editable: false, colors: ["#ffffff", "#9b7cff", "#14082c"] },
    { id: "heartbeat", label: "Heartbeat", base: "breathe", editable: false, colors: ["#ff1f3d", "#7a0015", "#030000"] },
    { id: "gold-runner", label: "Gold runner", base: "theater", editable: false, colors: ["#ffe76a", "#ff9d24", "#150b00"] },
    { id: "blackout-return", label: "Blackout + return", base: "wipe", editable: false, colors: ["#000000", "#35e7ff", "#000000"] }
  ]);

  const SECTIONS = Object.freeze([
    ["whole", "Whole strip"],
    ["first-half", "First half"],
    ["second-half", "Second half"],
    ["first-third", "First third"],
    ["middle-third", "Middle third"],
    ["last-third", "Last third"]
  ]);

  const presetById = (id) => PRESETS.find((preset) => preset.id === id) || PRESETS[0];
  const controllerById = (id) => CONTROLLERS.find((controller) => controller.id === id) || CONTROLLERS[0];
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const safeText = (value) => String(value ?? "").replace(/[<>]/g, "");

  function baseSequence() {
    return PRESETS.slice(0, 10).map((preset, index) => ({
      enabled: true,
      preset: preset.id,
      duration: index === 0 ? 4 : 3,
      speed: 52 + ((index * 7) % 38),
      brightness: 92,
      direction: preset.id === "center-in" ? -1 : 1,
      section: "whole",
      colors: [...preset.colors]
    }));
  }

  function safetySequence(kind) {
    const rows = Array.from({ length: 10 }, (_, index) => ({
      enabled: index < 2,
      preset: "solid",
      duration: index === 0 ? 5 : 2,
      speed: 60,
      brightness: 100,
      direction: 1,
      section: "whole",
      colors: ["#ff1f3d", "#ff1f3d", "#120000"]
    }));

    if (kind === "brake") {
      rows[0].preset = "center-out";
      rows[0].duration = 2;
      rows[1].preset = "solid";
      rows[1].duration = 5;
    }

    if (kind === "left" || kind === "right") {
      rows[0].preset = "gradient-chase";
      rows[0].duration = 1;
      rows[0].direction = kind === "left" ? -1 : 1;
      rows[0].colors = ["#ff9a1f", "#ff2b1c", "#1b0700"];
      rows[1].preset = "solid";
      rows[1].duration = 1;
      rows[1].direction = rows[0].direction;
      rows[1].colors = ["#ff9a1f", "#ff9a1f", "#1b0700"];
    }

    return rows;
  }

  function makeNodes() {
    if (simulator === "bike") {
      return [
        { id: "bike-front-wheel", name: "Front wheel", deviceId: "HB-6702-01", controller: "sp630e", targets: ["#frontWheelSvg"] },
        { id: "bike-rear-wheel", name: "Rear wheel", deviceId: "HB-6702-02", controller: "sp630e", targets: ["#rearWheelSvg"] },
        { id: "bike-front-forks", name: "Front fork / shock", deviceId: "HB-6702-03", controller: "sp630e", targets: ["#frontForksSvg"] },
        { id: "bike-front-cockpit", name: "Handlebars + front basket", deviceId: "HB-6702-04", controller: "sp630e", targets: ["#handlebarsSvg", "#frontBasketSvg", "#handlebarPouchSvg"] },
        { id: "bike-frame-front", name: "Frame front / upper", deviceId: "HB-6702-05", controller: "sp803e", targets: ["#frameLightsSvg path:nth-child(1)", "#frameLightsSvg path:nth-child(2)"] },
        { id: "bike-frame-rear", name: "Frame rear / lower", deviceId: "HB-6702-06", controller: "sp803e", targets: ["#frameLightsSvg path:nth-child(3)", "#underglowSvg path"] },
        { id: "bike-rear-storage", name: "Rear basket + flag pole", deviceId: "HB-6702-07", controller: "sp630e", targets: ["#rearBasketSvg", "#seatPouchSvg", "#flagPoleSvg .flag-pole-light"] },
        { id: "bike-tail-brake", name: "Rear brake / tail light", deviceId: "HB-6702-08", controller: "sp630e", targets: ["#rearBrakeSvg", "#rearBrakeRearSvg"], safety: "brake" },
        { id: "bike-left-signal", name: "Left turn signal", deviceId: "HB-6702-09", controller: "sp630e", targets: ["#turnSignalsSvg .signal-left", "#turnSignalsRearSvg .signal-left"], safety: "left" },
        { id: "bike-right-signal", name: "Right turn signal", deviceId: "HB-6702-10", controller: "sp630e", targets: ["#turnSignalsSvg .signal-right", "#turnSignalsRearSvg .signal-right"], safety: "right" }
      ];
    }

    if (simulator === "home") {
      return [
        { id: "home-front-roof", name: "Front roofline", deviceId: "HB-6702-01", controller: "sp803e", homeZones: ["front-roofline"] },
        { id: "home-front-windows", name: "Front windows + entry", deviceId: "HB-6702-02", controller: "sp803e", homeZones: ["front-window-trim", "front-entry"] },
        { id: "home-front-porch", name: "Front porch + steps", deviceId: "HB-6702-03", controller: "sp530e", homeZones: ["front-porch", "front-steps"] },
        { id: "home-front-garage", name: "Garage doors", deviceId: "HB-6702-04", controller: "sp530e", homeZones: ["front-garage"] },
        { id: "home-front-ground", name: "Walkway + front accents", deviceId: "HB-6702-05", controller: "sp530e", homeZones: ["front-walkway", "front-fixtures", "front-landscape"] },
        { id: "home-rear-roof", name: "Rear roofline", deviceId: "HB-6702-06", controller: "sp803e", homeZones: ["rear-roofline"] },
        { id: "home-rear-deck", name: "Deck + balcony", deviceId: "HB-6702-07", controller: "sp803e", homeZones: ["rear-balcony"] },
        { id: "home-rear-stairs", name: "Rear stairs", deviceId: "HB-6702-08", controller: "sp803e", homeZones: ["rear-stair-rails", "rear-stair-treads"] },
        { id: "home-rear-patio", name: "Patio doors + perimeter", deviceId: "HB-6702-09", controller: "sp530e", homeZones: ["rear-doors", "rear-patio"] },
        { id: "home-rear-gazebo", name: "Gazebo + rear accents", deviceId: "HB-6702-10", controller: "sp530e", homeZones: ["rear-gazebo", "rear-fixtures", "rear-landscape"] }
      ];
    }

    return [
      { id: "auto-left-headlight", name: "Left headlight", deviceId: "HB-6702-01", controller: "sp630e", autoGroup: "headlights", autoIndex: 0 },
      { id: "auto-right-headlight", name: "Right headlight", deviceId: "HB-6702-02", controller: "sp630e", autoGroup: "headlights", autoIndex: 1 },
      { id: "auto-front-wheel", name: "Front wheel rim", deviceId: "HB-6702-03", controller: "sp630e", autoGroup: "rings", autoIndex: 0 },
      { id: "auto-rear-wheel", name: "Rear wheel rim", deviceId: "HB-6702-04", controller: "sp630e", autoGroup: "rings", autoIndex: 1 },
      { id: "auto-front-well", name: "Front wheel well", deviceId: "HB-6702-05", controller: "sp803e", autoGroup: "wells", autoIndex: 0 },
      { id: "auto-rear-well", name: "Rear wheel well", deviceId: "HB-6702-06", controller: "sp803e", autoGroup: "wells", autoIndex: 1 },
      { id: "auto-front-underglow", name: "Front underglow", deviceId: "HB-6702-07", controller: "sp803e", autoGroup: "underglow", autoIndex: 0 },
      { id: "auto-side-underglow", name: "Side underglow", deviceId: "HB-6702-08", controller: "sp803e", autoGroup: "underglow", autoIndex: 2 },
      { id: "auto-rear-underglow", name: "Rear underglow", deviceId: "HB-6702-09", controller: "sp803e", autoGroup: "underglow", autoIndex: 1 },
      { id: "auto-rocker", name: "Rocker panels", deviceId: "HB-6702-10", controller: "sp803e", autoGroup: "rocker", autoIndex: 0 }
    ];
  }

  const nodes = makeNodes().map((node) => ({
    ...node,
    selected: false,
    enabled: false,
    sequence: node.safety ? safetySequence(node.safety) : baseSequence(),
    startedAt: performance.now(),
    currentStep: -1
  }));

  let editorSequence = baseSequence();
  let statusMessage = "Check one or more controller nodes, edit the ten sequence rows, then apply.";
  let root = null;
  let homeRefreshPending = false;

  function saveState() {
    const payload = {
      version: 2,
      simulator,
      editorSequence,
      nodes: nodes.map((node) => ({
        id: node.id,
        name: node.name,
        controller: node.controller,
        selected: node.selected,
        enabled: node.enabled,
        sequence: node.sequence
      }))
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      console.warn("Node simulator state could not be saved.", error);
    }
  }

  function restoreState() {
    try {
      const payload = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (payload?.version !== 2 || payload.simulator !== simulator) return;
      if (Array.isArray(payload.editorSequence) && payload.editorSequence.length === 10) {
        editorSequence = payload.editorSequence;
      }
      (payload.nodes || []).forEach((saved) => {
        const node = nodes.find((item) => item.id === saved.id);
        if (!node) return;
        node.name = saved.name || node.name;
        node.controller = CONTROLLERS.some((item) => item.id === saved.controller) ? saved.controller : node.controller;
        node.selected = Boolean(saved.selected);
        node.enabled = Boolean(saved.enabled);
        node.sequence = Array.isArray(saved.sequence) && saved.sequence.length === 10
          ? saved.sequence
          : node.sequence;
        node.startedAt = performance.now();
      });
    } catch (error) {
      console.warn("Node simulator state could not be restored.", error);
    }
  }

  function selectedNodes() {
    return nodes.filter((node) => node.selected);
  }

  function normalizedStepForNode(node, sourceStep) {
    const step = clone(sourceStep);
    if (node.safety === "brake") {
      step.colors = ["#ff1f3d", "#ff1f3d", "#120000"];
      if (!["solid", "breathe", "center-out"].includes(step.preset)) step.preset = "center-out";
    }
    if (node.safety === "left" || node.safety === "right") {
      step.colors = ["#ff9a1f", "#ff2b1c", "#1b0700"];
      step.direction = node.safety === "left" ? -1 : 1;
      if (!["solid", "gradient-chase", "foreground-cascade"].includes(step.preset)) step.preset = "gradient-chase";
    }
    return step;
  }

  function activeSequence(node) {
    const active = node.sequence.filter((step) => step.enabled && Number(step.duration) > 0);
    return active.length ? active : [node.sequence[0]];
  }

  function currentStepFor(node, now) {
    const sequence = activeSequence(node);
    const total = sequence.reduce((sum, step) => sum + Math.max(0.25, Number(step.duration) || 1), 0);
    let elapsed = ((now - node.startedAt) / 1000) % total;
    for (let index = 0; index < sequence.length; index += 1) {
      const duration = Math.max(0.25, Number(sequence[index].duration) || 1);
      if (elapsed < duration) return { step: sequence[index], index };
      elapsed -= duration;
    }
    return { step: sequence[0], index: 0 };
  }

  function elementTargets(node) {
    if (simulator === "auto") {
      const lines = document.querySelectorAll(`.auto-zone[data-zone="${node.autoGroup}"] .led-line`);
      return lines[node.autoIndex] ? [lines[node.autoIndex]] : [];
    }
    return (node.targets || []).flatMap((selector) => [...document.querySelectorAll(selector)]);
  }

  function clearDomNode(node) {
    elementTargets(node).forEach((element) => {
      delete element.dataset.simNodeActive;
      delete element.dataset.simEffect;
      element.style.removeProperty("--sim-a");
      element.style.removeProperty("--sim-b");
      element.style.removeProperty("--sim-c");
      element.style.removeProperty("--sim-brightness");
      element.style.removeProperty("--sim-speed");
      element.style.removeProperty("--sim-direction");
      element.style.removeProperty("--sim-section");
    });
  }

  function applyDomNode(node, step) {
    const preset = presetById(step.preset);
    elementTargets(node).forEach((element) => {
      element.dataset.simNodeActive = "true";
      element.dataset.simEffect = preset.id;
      element.classList.add("zone-on");
      element.classList.remove("zone-off");
      element.style.setProperty("--sim-a", step.colors[0]);
      element.style.setProperty("--sim-b", step.colors[1]);
      element.style.setProperty("--sim-c", step.colors[2]);
      element.style.setProperty("--sim-brightness", String(Math.max(0.05, step.brightness / 100)));
      element.style.setProperty("--sim-speed", `${Math.max(0.35, 3.6 - ((step.speed / 100) * 3.15)).toFixed(2)}s`);
      element.style.setProperty("--sim-direction", step.direction < 0 ? "reverse" : "normal");
      element.style.setProperty("--sim-section", step.section);
    });
  }

  function scheduleHomeRefresh() {
    if (homeRefreshPending) return;
    homeRefreshPending = true;
    window.setTimeout(() => {
      homeRefreshPending = false;
      const api = window.ShynetymeHomeSim;
      if (!api?.setScene) return;
      const active = document.querySelector("[data-scene].is-active, [data-scene][aria-pressed='true']");
      void api.setScene(active?.dataset.scene === "rear" ? "rear" : "front");
    }, 60);
  }

  function applyHomeNode(node, step) {
    const api = window.ShynetymeHomeSim;
    const presetApi = window.ShynetymeSimPresets;
    if (!api?.zoneSettings || !api?.selectedZones || !presetApi) return;
    const preset = presetById(step.preset);
    const basePreset = presetApi.getPreset(preset.base);
    (node.homeZones || []).forEach((zoneId) => {
      api.selectedZones.add(zoneId);
      api.zoneSettings.set(zoneId, {
        effect: preset.base,
        direction: Number(step.direction) || 1,
        brightness: Number(step.brightness) || 100,
        speed: Number(step.speed) || 55,
        intensity: basePreset.intensity,
        paletteMode: "gradient",
        colors: [...step.colors],
        syncTarget: "",
        mirror: false,
        mirrorDirection: "same"
      });
    });
  }

  function clearHomeNode(node) {
    const api = window.ShynetymeHomeSim;
    if (!api?.selectedZones) return;
    (node.homeZones || []).forEach((zoneId) => api.selectedZones.delete(zoneId));
    scheduleHomeRefresh();
  }

  function applyNodeStep(node, step, force = false) {
    if (!node.enabled) {
      if (simulator === "home") clearHomeNode(node);
      else clearDomNode(node);
      node.currentStep = -1;
      return;
    }

    if (simulator === "home") applyHomeNode(node, step);
    else applyDomNode(node, step);

    if (force && simulator === "home") scheduleHomeRefresh();
  }

  function tick() {
    const now = performance.now();
    nodes.forEach((node) => {
      if (!node.enabled) return;
      const current = currentStepFor(node, now);
      if (node.currentStep !== current.index || simulator !== "home") {
        node.currentStep = current.index;
        applyNodeStep(node, current.step);
        updateNodeStatus(node);
      }
    });
  }

  function presetOptions(selectedId) {
    return PRESETS.map((preset, index) => {
      const divider = index === 10 ? '<option disabled>──────── Curated locked palettes ────────</option>' : "";
      return `${divider}<option value="${preset.id}"${preset.id === selectedId ? " selected" : ""}>${safeText(preset.label)}</option>`;
    }).join("");
  }

  function controllerOptions(selectedId) {
    return CONTROLLERS.map((controller) => (
      `<option value="${controller.id}"${controller.id === selectedId ? " selected" : ""}>${safeText(controller.label)}</option>`
    )).join("");
  }

  function sectionOptions(selectedId) {
    return SECTIONS.map(([id, label]) => (
      `<option value="${id}"${id === selectedId ? " selected" : ""}>${label}</option>`
    )).join("");
  }

  function nodeMarkup(node, index) {
    const controller = controllerById(node.controller);
    return `
      <article class="sim-node-card${node.selected ? " is-targeted" : ""}${node.enabled ? " is-running" : ""}" data-node-card="${node.id}">
        <label class="sim-node-target">
          <input type="checkbox" data-node-action="target" data-node-id="${node.id}"${node.selected ? " checked" : ""}>
          <span>${String(index + 1).padStart(2, "0")}</span>
        </label>
        <div class="sim-node-card__main">
          <input class="sim-node-name" type="text" maxlength="42" data-node-action="rename" data-node-id="${node.id}" value="${safeText(node.name)}" aria-label="Rename ${safeText(node.name)}">
          <small>${safeText(node.deviceId)} · ${safeText(controller.transport)}${node.safety ? " · safety output" : ""}</small>
          <select data-node-action="controller" data-node-id="${node.id}" aria-label="Controller type for ${safeText(node.name)}">${controllerOptions(node.controller)}</select>
        </div>
        <button class="sim-node-power" type="button" data-node-action="power" data-node-id="${node.id}" aria-pressed="${node.enabled}">${node.enabled ? "On" : "Off"}</button>
        <div class="sim-node-card__status" data-node-status="${node.id}">${node.enabled ? "Sequence running" : "Ready"}</div>
      </article>`;
  }

  function sequenceRowMarkup(step, index) {
    const preset = presetById(step.preset);
    return `
      <article class="sim-sequence-row${step.enabled ? " is-enabled" : ""}" data-sequence-row="${index}">
        <div class="sim-sequence-row__line">
          <strong>${index + 1}</strong>
          <label class="sim-sequence-enable"><input type="checkbox" data-step-action="enabled" data-step-index="${index}"${step.enabled ? " checked" : ""}><span>Use</span></label>
          <select data-step-action="preset" data-step-index="${index}" aria-label="Preset for sequence row ${index + 1}">${presetOptions(step.preset)}</select>
          <select data-step-action="section" data-step-index="${index}" aria-label="LED section for row ${index + 1}">${sectionOptions(step.section)}</select>
          <label class="sim-step-duration"><input type="number" min="0.25" max="120" step="0.25" value="${step.duration}" data-step-action="duration" data-step-index="${index}"><span>sec</span></label>
          <button type="button" data-step-action="details" data-step-index="${index}" aria-expanded="false">Tune</button>
          <span class="sim-step-move"><button type="button" data-step-action="up" data-step-index="${index}" aria-label="Move row ${index + 1} up">↑</button><button type="button" data-step-action="down" data-step-index="${index}" aria-label="Move row ${index + 1} down">↓</button></span>
        </div>
        <div class="sim-sequence-row__details" data-step-details="${index}" hidden>
          <label>Speed <output>${step.speed}</output><input type="range" min="1" max="100" value="${step.speed}" data-step-action="speed" data-step-index="${index}"></label>
          <label>Brightness <output>${step.brightness}%</output><input type="range" min="5" max="100" value="${step.brightness}" data-step-action="brightness" data-step-index="${index}"></label>
          <label>Direction <select data-step-action="direction" data-step-index="${index}"><option value="1"${step.direction >= 0 ? " selected" : ""}>Forward</option><option value="-1"${step.direction < 0 ? " selected" : ""}>Reverse</option></select></label>
          <label>Primary <input type="color" value="${step.colors[0]}" data-step-action="color0" data-step-index="${index}"${preset.editable ? "" : " disabled"}></label>
          <label>Foreground <input type="color" value="${step.colors[1]}" data-step-action="color1" data-step-index="${index}"${preset.editable ? "" : " disabled"}></label>
          <label>Background <input type="color" value="${step.colors[2]}" data-step-action="color2" data-step-index="${index}"${preset.editable ? "" : " disabled"}></label>
          <small>${preset.editable ? "Custom palette: colors can be changed." : "Curated preset: palette is locked; speed and brightness remain adjustable."}</small>
        </div>
      </article>`;
  }

  function renderWorkbench() {
    if (!root) return;
    root.innerHTML = `
      <header class="sim-workbench-header">
        <div><p>Shared controller workflow</p><h2>Controller nodes + ten-step sequence</h2><span>Each button is one physical controller. Check the nodes that should receive the same sequence, then press Apply.</span></div>
        <div class="sim-workbench-count"><b>${nodes.length}</b><span>controller nodes</span></div>
      </header>
      <section class="sim-node-panel" aria-labelledby="simNodePanelTitle">
        <div class="sim-panel-heading"><div><p>Step 1</p><h3 id="simNodePanelTitle">Choose controller nodes</h3></div><span id="simTargetCount">${selectedNodes().length} checked</span></div>
        <div class="sim-node-toolbar"><button type="button" data-workbench-action="select-all">Check all</button><button type="button" data-workbench-action="clear-targets">Clear checks</button><button type="button" data-workbench-action="load-node">Load first checked sequence</button><button type="button" data-workbench-action="stop-targets">Turn checked off</button></div>
        <div class="sim-node-grid">${nodes.map(nodeMarkup).join("")}</div>
      </section>
      <section class="sim-sequence-panel" aria-labelledby="simSequenceTitle">
        <div class="sim-panel-heading"><div><p>Step 2</p><h3 id="simSequenceTitle">Build the shared ten-row sequence</h3></div><span>25 curated + editable presets</span></div>
        <div class="sim-sequence-columns" aria-hidden="true"><span>#</span><span>Use</span><span>Preset</span><span>LED section</span><span>Time</span><span>Controls</span><span>Order</span></div>
        <div class="sim-sequence-list">${editorSequence.map(sequenceRowMarkup).join("")}</div>
        <div class="sim-apply-bar">
          <div><strong id="simApplyStatus">${safeText(statusMessage)}</strong><small>Checked nodes begin together and stay synchronized until one is changed or restarted separately.</small></div>
          <button type="button" data-workbench-action="apply">Apply sequence to checked nodes</button>
        </div>
      </section>
      <section class="sim-controller-note">
        <strong>Controller choices</strong>
        <span>SP803E = WLED/ESP32 · SP630E = Bluetooth · SP530E = Wi-Fi, Bluetooth and smart-home control.</span>
        <button type="button" data-workbench-action="request">Request this installation</button>
      </section>`;
  }

  function updateTargetCount() {
    const count = root?.querySelector("#simTargetCount");
    if (count) count.textContent = `${selectedNodes().length} checked`;
  }

  function updateNodeStatus(node) {
    const status = root?.querySelector(`[data-node-status="${node.id}"]`);
    const card = root?.querySelector(`[data-node-card="${node.id}"]`);
    const power = root?.querySelector(`[data-node-action="power"][data-node-id="${node.id}"]`);
    if (card) {
      card.classList.toggle("is-targeted", node.selected);
      card.classList.toggle("is-running", node.enabled);
    }
    if (power) {
      power.textContent = node.enabled ? "On" : "Off";
      power.setAttribute("aria-pressed", String(node.enabled));
    }
    if (!status) return;
    if (!node.enabled) {
      status.textContent = "Ready";
      return;
    }
    const current = currentStepFor(node, performance.now());
    status.textContent = `Row ${current.index + 1} · ${presetById(current.step.preset).label}`;
  }

  function updateApplyStatus(message) {
    statusMessage = message;
    const status = root?.querySelector("#simApplyStatus");
    if (status) status.textContent = message;
  }

  function applyEditorToTargets() {
    const targets = selectedNodes();
    if (!targets.length) {
      updateApplyStatus("No controller nodes are checked.");
      return;
    }
    const start = performance.now();
    targets.forEach((node) => {
      node.sequence = editorSequence.map((step) => normalizedStepForNode(node, step));
      node.enabled = true;
      node.startedAt = start;
      node.currentStep = -1;
      const first = activeSequence(node)[0];
      applyNodeStep(node, first, true);
      updateNodeStatus(node);
    });
    if (simulator === "home") scheduleHomeRefresh();
    saveState();
    updateApplyStatus(`Applied the ten-row sequence to ${targets.length} checked node${targets.length === 1 ? "" : "s"}.`);
  }

  function stopTargets() {
    const targets = selectedNodes();
    targets.forEach((node) => {
      node.enabled = false;
      applyNodeStep(node, node.sequence[0], true);
      updateNodeStatus(node);
    });
    if (simulator === "home") scheduleHomeRefresh();
    saveState();
    updateApplyStatus(targets.length ? `Turned off ${targets.length} checked node${targets.length === 1 ? "" : "s"}.` : "No controller nodes are checked.");
  }

  function requestInstallation() {
    const configured = nodes.filter((node) => node.enabled || node.selected).map((node) => ({
      id: node.id,
      deviceId: node.deviceId,
      name: node.name,
      controller: controllerById(node.controller),
      enabled: node.enabled,
      sequence: node.sequence.filter((step) => step.enabled).map((step, index) => ({
        order: index + 1,
        ...step,
        presetLabel: presetById(step.preset).label
      }))
    }));
    const payload = { version: 2, simulator, architecture: "controller-nodes", nodes: configured, updatedAt: new Date().toISOString() };
    sessionStorage.setItem(`shynetymeSim${simulator[0].toUpperCase()}${simulator.slice(1)}Selections`, JSON.stringify(payload));
    localStorage.setItem("shynetymeContactDraft", JSON.stringify({
      source: `${simulator}-sim-node-sequence`,
      projectType: `${simulator[0].toUpperCase()}${simulator.slice(1)} LED installation`,
      message: configured.map((node) => `${node.name} (${node.controller.label}): ${node.sequence.length} active sequence rows`).join("\n"),
      simulatorPayload: payload
    }));
    window.location.href = simulator === "auto" ? "../contact.html?source=sim-auto#contact-request" : "contact.html?source=sim-node-sequence#contact-request";
  }

  function bindWorkbench() {
    root.addEventListener("change", (event) => {
      const target = event.target;
      const nodeAction = target.dataset.nodeAction;
      const stepAction = target.dataset.stepAction;

      if (nodeAction) {
        const node = nodes.find((item) => item.id === target.dataset.nodeId);
        if (!node) return;
        if (nodeAction === "target") node.selected = target.checked;
        if (nodeAction === "controller") node.controller = target.value;
        updateTargetCount();
        updateNodeStatus(node);
        saveState();
        return;
      }

      if (!stepAction) return;
      const index = Number(target.dataset.stepIndex);
      const step = editorSequence[index];
      if (!step) return;
      if (stepAction === "enabled") step.enabled = target.checked;
      if (stepAction === "preset") {
        const preset = presetById(target.value);
        step.preset = preset.id;
        step.colors = [...preset.colors];
      }
      if (stepAction === "section") step.section = target.value;
      if (stepAction === "duration") step.duration = Math.max(0.25, Number(target.value) || 1);
      if (stepAction === "direction") step.direction = Number(target.value) < 0 ? -1 : 1;
      renderWorkbench();
      saveState();
    });

    root.addEventListener("input", (event) => {
      const target = event.target;
      if (target.dataset.nodeAction === "rename") {
        const node = nodes.find((item) => item.id === target.dataset.nodeId);
        if (node) {
          node.name = target.value.trim() || node.deviceId;
          saveState();
        }
        return;
      }
      const action = target.dataset.stepAction;
      if (!action) return;
      const step = editorSequence[Number(target.dataset.stepIndex)];
      if (!step) return;
      if (action === "speed") step.speed = Number(target.value);
      if (action === "brightness") step.brightness = Number(target.value);
      if (action.startsWith("color")) {
        const colorIndex = Number(action.slice(-1));
        step.colors[colorIndex] = target.value;
      }
      const output = target.closest("label")?.querySelector("output");
      if (output) output.textContent = action === "brightness" ? `${target.value}%` : target.value;
      saveState();
    });

    root.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      const action = button.dataset.workbenchAction;
      const nodeAction = button.dataset.nodeAction;
      const stepAction = button.dataset.stepAction;

      if (nodeAction === "power") {
        const node = nodes.find((item) => item.id === button.dataset.nodeId);
        if (!node) return;
        node.enabled = !node.enabled;
        node.startedAt = performance.now();
        node.currentStep = -1;
        applyNodeStep(node, activeSequence(node)[0], true);
        updateNodeStatus(node);
        saveState();
        return;
      }

      if (stepAction === "details") {
        const index = Number(button.dataset.stepIndex);
        const details = root.querySelector(`[data-step-details="${index}"]`);
        if (details) {
          details.hidden = !details.hidden;
          button.setAttribute("aria-expanded", String(!details.hidden));
        }
        return;
      }

      if (stepAction === "up" || stepAction === "down") {
        const index = Number(button.dataset.stepIndex);
        const targetIndex = stepAction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= editorSequence.length) return;
        [editorSequence[index], editorSequence[targetIndex]] = [editorSequence[targetIndex], editorSequence[index]];
        renderWorkbench();
        saveState();
        return;
      }

      if (action === "select-all") {
        nodes.forEach((node) => { node.selected = true; });
        renderWorkbench();
        saveState();
      }
      if (action === "clear-targets") {
        nodes.forEach((node) => { node.selected = false; });
        renderWorkbench();
        saveState();
      }
      if (action === "load-node") {
        const first = selectedNodes()[0];
        if (!first) updateApplyStatus("Check a controller node before loading its sequence.");
        else {
          editorSequence = clone(first.sequence);
          updateApplyStatus(`Loaded ${first.name}'s sequence into the editor.`);
          renderWorkbench();
          saveState();
        }
      }
      if (action === "stop-targets") stopTargets();
      if (action === "apply") applyEditorToTargets();
      if (action === "request") requestInstallation();
    });
  }

  function preparePage() {
    document.body.classList.add("sim-node-mode", `sim-node-${simulator}`);
    root = document.createElement("section");
    root.id = "simNodeSequenceWorkbench";
    root.className = "sim-node-workbench";

    if (simulator === "bike") {
      document.querySelectorAll("#builderAccordion .accordion-item").forEach((item, index) => {
        if (index > 0) item.hidden = true;
      });
      const shell = document.querySelector(".builder-shell") || document.querySelector("main .container");
      shell?.appendChild(root);
    } else if (simulator === "home") {
      const consolePanel = document.querySelector(".home-sim-console");
      if (consolePanel) consolePanel.hidden = true;
      const layout = document.querySelector(".home-sim-layout") || document.querySelector("main");
      layout?.appendChild(root);
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
    restoreState();
    preparePage();
    nodes.forEach((node) => {
      if (node.enabled) {
        node.startedAt = performance.now();
        applyNodeStep(node, activeSequence(node)[0], true);
      }
    });
    if (simulator === "home" && nodes.some((node) => node.enabled)) scheduleHomeRefresh();
    window.setInterval(tick, 120);
    window.ShynetymeNodeSequence = {
      initialized: true,
      simulator,
      nodes,
      presets: PRESETS,
      controllers: CONTROLLERS,
      get editorSequence() { return editorSequence; },
      apply: applyEditorToTargets,
      stop: stopTargets,
      reset() {
        localStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initialize, { once: true });
  } else {
    initialize();
  }
})();
