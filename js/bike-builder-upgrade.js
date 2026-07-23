(() => {
  "use strict";

  const form = document.getElementById("bikeBuilderForm");
  const mainBike = document.getElementById("mainBikeGroup");
  const kidBike = document.getElementById("kidBikeGroup");
  const preview = document.getElementById("bikePreview");
  const sizeLabel = document.getElementById("sizeLabel");
  const summary = document.getElementById("buildSummary");
  const rearPanel = document.getElementById("rearViewPanel");
  if (!form || !mainBike || !kidBike || !preview || !sizeLabel || !summary || !rearPanel) return;

  const styleLabels = {
    comfort: "Comfort / cruiser",
    mountain: "Mountain bike",
    fatTire: "Fat-tire e-bike",
    cargo: "Cargo / delivery bike"
  };

  const sizeLabels = {
    toddler: "Toddler / balance bike",
    preschool: "Small child / preschool bicycle",
    youth: "Youth bicycle",
    teen: "Teen / small-adult bicycle",
    adult: "Adult bicycle"
  };

  const equipmentLabels = {
    batteryBox: "Battery box",
    controllerBox: "Controller box",
    headlight: "Headlight",
    underglow: "Underglow",
    rearRack: "Rear rack",
    saddlebags: "Saddlebags",
    childSeat: "Child seat",
    cargoTrailer: "Cargo trailer",
    mirrors: "Mirrors",
    speakers: "Speakers",
    ledSign: "LED sign"
  };

  const bodyStyles = {
    comfort: {
      transform: "translate(-13 54) scale(1.05)",
      rear: { cx: 245, cy: 438, tire: 122, rim: 99 },
      front: { cx: 665, cy: 438, tire: 122, rim: 99 },
      base: [
        "M132 421A122 122 0 0 1 352 382", "M552 421A122 122 0 0 1 772 382",
        "M214 309H360L385 333", "M450 438L492 458", "M450 438L413 418",
        "M492 458H525", "M382 418H414", "M245 438L450 438L382 286L245 438",
        "M382 286C407 355 425 401 450 438",
        "M382 286C418 352 449 350 482 326C520 298 536 252 568 238",
        "M450 438C495 360 527 292 568 238", "M568 220L584 278",
        "M578 264L665 438", "M595 262L680 435", "M382 286L355 205",
        "M322 195H390", "M558 220L550 154L584 128",
        "M548 151C571 139 590 139 614 149"
      ],
      frame: [
        "M245 438L450 438L382 286L245 438",
        "M382 286C418 352 449 350 482 326C520 298 536 252 568 238",
        "M450 438C495 360 527 292 568 238"
      ],
      forks: ["M578 264L665 438", "M595 262L680 435"],
      handlebars: "M550 154L584 128M548 151C571 139 590 139 614 149"
    },
    mountain: {
      transform: "translate(-22 39) scale(1.02)",
      rear: { cx: 250, cy: 445, tire: 122, rim: 98 },
      front: { cx: 665, cy: 445, tire: 122, rim: 98 },
      base: [
        "M142 431A122 122 0 0 1 358 392", "M555 431A122 122 0 0 1 772 392",
        "M250 445L445 445L357 252L250 445", "M357 252L561 235L445 445",
        "M357 252L305 182", "M284 179H356", "M561 235L592 278",
        "M592 278L665 445", "M605 275L680 442", "M552 230L560 166L605 140",
        "M546 167C578 154 601 156 631 168", "M445 445L486 464",
        "M445 445L411 420", "M486 464H520", "M395 415H414",
        "M602 285L620 250M588 288L606 252"
      ],
      frame: ["M250 445L445 445L357 252L250 445", "M357 252L561 235L445 445"],
      forks: ["M592 278L665 445", "M605 275L680 442"],
      handlebars: "M560 166L605 140M546 167C578 154 601 156 631 168"
    },
    fatTire: {
      transform: "translate(-3 54) scale(.98)",
      rear: { cx: 250, cy: 448, tire: 136, rim: 96 },
      front: { cx: 675, cy: 448, tire: 136, rim: 96 },
      base: [
        "M118 425A136 136 0 0 1 382 390", "M543 425A136 136 0 0 1 807 390",
        "M250 448L450 448L355 258L250 448", "M355 258L562 238L450 448",
        "M355 258L326 174", "M294 166H360", "M562 238L598 292",
        "M598 292L675 448", "M614 289L692 444", "M552 238L560 166L612 136",
        "M546 166C579 151 607 153 640 170", "M450 448L491 468",
        "M450 448L414 422", "M491 468H527", "M397 419H417", "M405 280H490V350H405Z"
      ],
      frame: ["M250 448L450 448L355 258L250 448", "M355 258L562 238L450 448"],
      forks: ["M598 292L675 448", "M614 289L692 444"],
      handlebars: "M560 166L612 136M546 166C579 151 607 153 640 170"
    },
    cargo: {
      transform: "translate(28 65) scale(.94)",
      rear: { cx: 215, cy: 448, tire: 110, rim: 88 },
      front: { cx: 700, cy: 448, tire: 110, rim: 88 },
      base: [
        "M115 436A110 110 0 0 1 315 402", "M600 436A110 110 0 0 1 800 402",
        "M215 448L430 448L350 274L215 448", "M350 274L575 274L430 448",
        "M350 274L320 198", "M292 190H360", "M575 274L700 448",
        "M590 274L715 444", "M566 272L566 190L610 160",
        "M560 190C590 176 617 178 646 194", "M112 276H352",
        "M112 276V320H352V276", "M430 448L470 466", "M430 448L396 422",
        "M470 466H505", "M378 420H399"
      ],
      frame: ["M215 448L430 448L350 274L215 448", "M350 274L575 274L430 448"],
      forks: ["M575 274L700 448", "M590 274L715 444"],
      handlebars: "M566 190L610 160M560 190C590 176 617 178 646 194"
    }
  };

  let currentView = "side";

  const addStyles = () => {
    if (document.querySelector("link[data-bike-builder-upgrade]")) return;
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "css/bike-builder-upgrade.css?v=20260723-liveview-upgrade";
    link.dataset.bikeBuilderUpgrade = "true";
    document.head.appendChild(link);
  };

  const insertControls = () => {
    const frameSelect = document.getElementById("frameSize");
    const frameRow = frameSelect?.closest(".question-row");
    if (frameRow && !document.getElementById("bikeBodyStyle")) {
      const row = document.createElement("div");
      row.className = "question-row";
      row.innerHTML = `
        <label class="question-label" for="bikeBodyStyle">Primary bicycle body</label>
        <select id="bikeBodyStyle" name="bikeBodyStyle" class="form-select">
          <option value="comfort">Comfort / cruiser</option>
          <option value="mountain">Mountain bike</option>
          <option value="fatTire">Fat-tire e-bike</option>
          <option value="cargo">Cargo / delivery bike</option>
        </select>
        <div class="question-note mt-2">The body changes as an SVG layer while the current street background remains in place.</div>`;
      frameRow.after(row);
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
            <div class="question-note mt-3">Each selected item appears as a separate layer in the live view.</div>
          </div>
        </div>`;
      accordion.appendChild(section);
    }

    const toolbar = document.querySelector(".preview-toolbar");
    if (toolbar && !document.getElementById("previewViewButtons")) {
      const buttons = document.createElement("div");
      buttons.id = "previewViewButtons";
      buttons.className = "preview-view-buttons";
      buttons.setAttribute("role", "group");
      buttons.setAttribute("aria-label", "Bicycle preview view");
      buttons.innerHTML = `
        <button type="button" class="preview-view-button" data-preview-view="front" aria-pressed="false">Front</button>
        <button type="button" class="preview-view-button active" data-preview-view="side" aria-pressed="true">Side</button>
        <button type="button" class="preview-view-button" data-preview-view="rear" aria-pressed="false">Rear</button>`;
      toolbar.appendChild(buttons);
    }
  };

  const ensureViewPanels = () => {
    if (!document.getElementById("frontViewPanel")) {
      const panel = document.createElementNS("http://www.w3.org/2000/svg", "g");
      panel.id = "frontViewPanel";
      panel.hidden = true;
      panel.setAttribute("transform", "translate(285 58)");
      panel.innerHTML = `
        <rect x="0" y="0" width="330" height="500" rx="24" fill="rgba(255,255,255,.94)" stroke="#171a20" stroke-width="6"/>
        <text x="165" y="38" text-anchor="middle" font-size="22" font-weight="900" fill="#171a20">FRONT VIEW</text>
        <circle cx="165" cy="355" r="92" fill="#fff" stroke="#25282d" stroke-width="14"/>
        <path d="M165 105V372M103 145H227M118 145L88 112M212 145L242 112" fill="none" stroke="#2d333b" stroke-width="14" stroke-linecap="round"/>
        <g id="frontHeadlightView" class="equipment-layer equipment-off"><circle cx="165" cy="178" r="30"/><path d="M150 178H180"/></g>
        <g id="frontMirrorView" class="equipment-layer equipment-off"><circle cx="80" cy="96" r="22"/><circle cx="250" cy="96" r="22"/><path d="M98 112L118 142M232 112L212 142"/></g>
        <g id="frontSpeakerView" class="equipment-layer equipment-off"><circle cx="112" cy="212" r="24"/><circle cx="218" cy="212" r="24"/><circle cx="112" cy="212" r="8"/><circle cx="218" cy="212" r="8"/></g>`;
      preview.querySelector("defs")?.after(panel);
    }

    rearPanel.setAttribute("transform", "translate(225 72) scale(1.65)");
    if (!document.getElementById("rearSaddlebagsView")) {
      rearPanel.insertAdjacentHTML("beforeend", `
        <g id="rearSaddlebagsView" class="equipment-layer equipment-off"><path d="M38 145H86V215H32Z"/><path d="M184 145H232L238 215H178Z"/></g>
        <g id="rearLedSignView" class="equipment-layer equipment-off equipment-light"><rect x="62" y="45" width="146" height="48" rx="7"/><text x="135" y="76" text-anchor="middle" font-size="16" font-weight="900">SHYNETYME</text></g>`);
    }
  };

  const ensureEquipmentLayers = () => {
    if (document.getElementById("batteryBoxSvg")) return;
    mainBike.insertAdjacentHTML("beforeend", `
      <g id="batteryBoxSvg" class="equipment-layer equipment-off"><rect x="395" y="318" width="92" height="72" rx="10"/><path d="M418 340H464M418 360H464"/></g>
      <g id="controllerBoxSvg" class="equipment-layer equipment-off"><rect x="490" y="300" width="72" height="48" rx="9"/><circle cx="510" cy="324" r="5"/><circle cx="542" cy="324" r="5"/></g>
      <g id="headlightSvg" class="equipment-layer equipment-off"><circle cx="625" cy="212" r="24"/><path d="M604 212H646"/></g>
      <g id="underglowSvg" class="equipment-layer equipment-off equipment-light"><path d="M285 500C390 535 515 535 625 500" fill="none" stroke-width="18" stroke-linecap="round"/></g>
      <g id="rearRackSvg" class="equipment-layer equipment-off"><path d="M122 296H286M140 296L172 404M268 296L236 404" fill="none" stroke-width="12" stroke-linecap="round"/></g>
      <g id="saddlebagsSvg" class="equipment-layer equipment-off"><path d="M138 304H210L202 378H126Z"/><path d="M218 304H290L302 378H226Z"/></g>
      <g id="childSeatSvg" class="equipment-layer equipment-off"><path d="M230 194H314V294H230Z"/><path d="M240 194V156H304V194M244 230H300" fill="none" stroke-width="10"/></g>
      <g id="cargoTrailerSvg" class="equipment-layer equipment-off"><path d="M42 420H164V502H42Z"/><circle cx="64" cy="522" r="28"/><circle cx="144" cy="522" r="28"/><path d="M164 460L224 438" fill="none" stroke-width="10"/></g>
      <g id="mirrorsSvg" class="equipment-layer equipment-off"><circle cx="548" cy="112" r="22"/><circle cx="652" cy="112" r="22"/><path d="M560 130L576 158M640 130L620 158" fill="none" stroke-width="8"/></g>
      <g id="speakersSvg" class="equipment-layer equipment-off"><circle cx="550" cy="222" r="22"/><circle cx="606" cy="222" r="22"/><circle cx="550" cy="222" r="7"/><circle cx="606" cy="222" r="7"/></g>
      <g id="ledSignSvg" class="equipment-layer equipment-off equipment-light"><rect x="100" y="188" width="170" height="62" rx="8"/><text x="185" y="228" text-anchor="middle" font-size="24" font-weight="900">SHYNETYME</text></g>`);
  };

  const paths = (items, attrs = "") => items.map((d) => `<path d="${d}" ${attrs}/>`).join("");
  const spokes = (wheel) => {
    const x = wheel.cx;
    const y = wheel.cy;
    const r = wheel.rim;
    const d = Math.round(r * .7);
    return `M${x} ${y-r}V${y+r}M${x-r} ${y}H${x+r}M${x-d} ${y-d}L${x+d} ${y+d}M${x-d} ${y+d}L${x+d} ${y-d}`;
  };

  const applyBody = () => {
    const key = document.getElementById("bikeBodyStyle")?.value || "comfort";
    const config = bodyStyles[key] || bodyStyles.comfort;
    const tires = mainBike.querySelectorAll(".bike-tire");
    const rims = mainBike.querySelectorAll(".bike-rim");
    const wheelZones = [document.getElementById("rearWheelSvg"), document.getElementById("frontWheelSvg")];
    [[config.rear, tires[0], rims[0], wheelZones[0]], [config.front, tires[1], rims[1], wheelZones[1]]].forEach(([wheel, tire, rim, zone]) => {
      [tire, rim, zone].forEach((element) => {
        if (!element) return;
        element.setAttribute("cx", wheel.cx);
        element.setAttribute("cy", wheel.cy);
      });
      tire?.setAttribute("r", wheel.tire);
      rim?.setAttribute("r", wheel.rim);
      zone?.setAttribute("r", Math.max(42, wheel.tire - 12));
    });

    const spokeGroup = mainBike.querySelector(".bike-spoke");
    if (spokeGroup) spokeGroup.innerHTML = `<path d="${spokes(config.rear)}"/><path d="${spokes(config.front)}"/>`;
    const baseGroup = mainBike.querySelector('g[aria-hidden="true"]');
    if (baseGroup) baseGroup.innerHTML = paths(config.base, 'style="stroke:#2d333b;fill:none;stroke-width:8;stroke-linecap:round;stroke-linejoin:round"');
    const metal = mainBike.querySelector(".bike-metal");
    if (metal) metal.innerHTML = paths(config.base);
    const frameLights = document.getElementById("frameLightsSvg");
    if (frameLights) frameLights.innerHTML = paths(config.frame);
    const forks = document.getElementById("frontForksSvg");
    if (forks) forks.innerHTML = paths(config.forks);
    document.getElementById("handlebarsSvg")?.setAttribute("d", config.handlebars);
    mainBike.setAttribute("transform", config.transform);
  };

  const correctChildPlacement = () => {
    const frameValue = document.getElementById("frameSize")?.value || "adult";
    const styleValue = document.getElementById("bikeBodyStyle")?.value || "comfort";
    sizeLabel.textContent = `${sizeLabels[frameValue] || sizeLabels.adult} · ${styleLabels[styleValue] || styleLabels.comfort}`;

    const addKid = form.querySelector('input[name="addKidBike"]:checked')?.value === "yes";
    if (!addKid) return;
    const kidValue = document.getElementById("kidFrameSize")?.value || "preschool";
    const scale = ({ toddler: .38, preschool: .46, youth: .54 })[kidValue] || .46;
    const translateY = Math.round(575 - (308 * scale));
    kidBike.setAttribute("transform", `translate(500 ${translateY}) scale(${scale})`);
  };

  const setEquipment = () => {
    const targets = {
      batteryBox: ["batteryBoxSvg"], controllerBox: ["controllerBoxSvg"],
      headlight: ["headlightSvg", "frontHeadlightView"], underglow: ["underglowSvg"],
      rearRack: ["rearRackSvg"], saddlebags: ["saddlebagsSvg", "rearSaddlebagsView"],
      childSeat: ["childSeatSvg"], cargoTrailer: ["cargoTrailerSvg"],
      mirrors: ["mirrorsSvg", "frontMirrorView"], speakers: ["speakersSvg", "frontSpeakerView"],
      ledSign: ["ledSignSvg", "rearLedSignView"]
    };
    Object.entries(targets).forEach(([inputId, ids]) => {
      const enabled = Boolean(document.getElementById(inputId)?.checked);
      ids.forEach((id) => {
        const element = document.getElementById(id);
        element?.classList.toggle("equipment-on", enabled);
        element?.classList.toggle("equipment-off", !enabled);
      });
    });
  };

  const setView = () => {
    const addKid = form.querySelector('input[name="addKidBike"]:checked')?.value === "yes";
    const frontPanel = document.getElementById("frontViewPanel");
    mainBike.hidden = currentView !== "side";
    kidBike.hidden = currentView !== "side" || !addKid;
    frontPanel.hidden = currentView !== "front";
    rearPanel.hidden = currentView !== "rear";
    document.querySelectorAll("[data-preview-view]").forEach((button) => {
      const active = button.dataset.previewView === currentView;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  };

  const appendSummary = () => {
    summary.querySelectorAll("[data-upgrade-summary]").forEach((item) => item.remove());
    const bodyValue = document.getElementById("bikeBodyStyle")?.value || "comfort";
    const equipment = Object.keys(equipmentLabels).filter((id) => document.getElementById(id)?.checked).map((id) => equipmentLabels[id]);
    const lines = [`Bike body: ${styleLabels[bodyValue]}`, `Preview view: ${currentView[0].toUpperCase()}${currentView.slice(1)}`];
    if (equipment.length) lines.splice(1, 0, `Equipment: ${equipment.join(", ")}`);
    lines.forEach((line) => {
      const item = document.createElement("li");
      item.dataset.upgradeSummary = "true";
      item.textContent = line;
      summary.appendChild(item);
    });
  };

  const sync = () => {
    ensureEquipmentLayers();
    applyBody();
    correctChildPlacement();
    setEquipment();
    setView();
    appendSummary();
  };

  addStyles();
  insertControls();
  ensureViewPanels();
  ensureEquipmentLayers();

  form.addEventListener("change", sync);
  document.getElementById("previewViewButtons")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preview-view]");
    if (!button) return;
    currentView = button.dataset.previewView;
    sync();
  });

  form.addEventListener("reset", () => {
    window.setTimeout(() => {
      const bodySelect = document.getElementById("bikeBodyStyle");
      if (bodySelect) bodySelect.value = "comfort";
      document.querySelectorAll(".equipment-checkbox").forEach((input) => { input.checked = false; });
      currentView = "side";
      sync();
    }, 20);
  });

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
