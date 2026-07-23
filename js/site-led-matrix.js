(() => {
  "use strict";

  if (window.ShynetymeLedMatrix?.initialized) return;

  const EFFECTS = ["chase", "center", "scan", "type", "flag", "stack-right", "wipe", "comet"];
  const LONG_TEXT_EFFECTS = ["chase", "flag", "comet"];
  const PALETTES = [
    ["#31e6ff", "#48a9ff", "#9b83ff", "#ff5ab9", "#ffc562", "#55e6b5"],
    ["#ff304f", "#ffffff", "#48a9ff", "#ffffff"],
    ["#ffe45e", "#9b83ff", "#fff3a8", "#ff5ab9"],
    ["#bfefff", "#31e6ff", "#ff9bd2", "#ffffff"],
    ["#ff334f", "#ff8a00", "#ffe45e", "#ffffff"],
    ["#31e6ff", "#ffffff", "#8ddfff", "#48a9ff"],
    ["#9b83ff", "#ff5ab9", "#ffc562", "#ffffff"]
  ];

  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const speedFactor = reduceMotion ? 0.68 : 1;
  const frameInterval = reduceMotion ? 84 : 50;
  const displays = [];
  const displayByCanvas = new WeakMap();
  let frameRequest = 0;
  let lastFrame = 0;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
  const pick = (items) => items[Math.floor(Math.random() * items.length)];

  function uniquePick(items, used) {
    const available = items.filter((item) => !used.has(item));
    const chosen = pick(available.length ? available : items);
    used.add(chosen);
    return chosen;
  }

  function pickEffect(text, used) {
    const choices = text.length > 46 ? LONG_TEXT_EFFECTS : EFFECTS;
    return uniquePick(choices, used);
  }

  function pickPalette(mode, used) {
    const preferred = mode === "flag"
      ? PALETTES[1]
      : mode === "wipe"
        ? PALETTES[2]
        : mode === "stack-right" && Math.random() > 0.5
          ? PALETTES[3]
          : null;

    if (preferred && !used.has(preferred)) {
      used.add(preferred);
      return preferred;
    }

    return uniquePick(PALETTES, used);
  }

  function normalizeText(value) {
    return String(value || "")
      .replace(/\s+/g, " ")
      .replace(/\s*[•·|]\s*/g, "  ✦  ")
      .trim()
      .toUpperCase();
  }

  function firstMessage(banner) {
    return normalizeText(banner?.querySelector(".hero-led-banner__message")?.textContent);
  }

  function collectPageText(hero) {
    const banners = [...hero.querySelectorAll(".hero-led-banner")];
    const hiddenCopy = hero.querySelector(".visually-hidden");
    const hiddenParts = hiddenCopy
      ? [...hiddenCopy.querySelectorAll("p, h1, h2")]
        .map((node) => normalizeText(node.textContent))
        .filter(Boolean)
      : [];

    return {
      top: firstMessage(banners[0]) || hiddenParts[0] || "SHYNETYME WORKS",
      bottom: firstMessage(banners[1]) || hiddenParts[1] || firstMessage(banners[2]) || "CUSTOM LED BUILDS"
    };
  }

  function collectBreadcrumbText(ticker) {
    const items = [...ticker.querySelectorAll(".breadcrumb-ticker__item")]
      .map((item) => normalizeText(item.textContent))
      .filter(Boolean);
    const pageTitle = normalizeText(document.title.split("|")[0]);

    if (items.length === 1 && pageTitle && !items.includes(pageTitle)) items.push(pageTitle);
    return items.length ? items.join("  ✦  ") : pageTitle;
  }

  function createRibbon(position, text) {
    const ribbon = document.createElement("div");
    ribbon.className = `site-matrix-ribbon site-matrix-ribbon--${position}`;
    ribbon.setAttribute("aria-hidden", "true");

    const canvas = document.createElement("canvas");
    canvas.className = "site-matrix-canvas";
    canvas.dataset.matrixText = text;
    ribbon.appendChild(canvas);

    return { ribbon, canvas };
  }

  function buildMask(text, rows, columns, mode) {
    const scratch = document.createElement("canvas");
    const context = scratch.getContext("2d", { willReadFrequently: true });
    if (!context) return { width: 1, height: rows, points: [] };

    let fontSize = Math.max(9, Math.floor(rows * 0.74));
    const scrolling = mode === "chase" || mode === "flag" || mode === "comet";

    context.font = `900 ${fontSize}px Oxanium, Trebuchet MS, sans-serif`;
    let measured = context.measureText(text).width + 8;

    if (!scrolling && measured > columns - 4) {
      fontSize = Math.max(7, Math.floor(fontSize * ((columns - 4) / measured)));
      context.font = `900 ${fontSize}px Oxanium, Trebuchet MS, sans-serif`;
      measured = context.measureText(text).width + 8;
    }

    scratch.width = Math.max(1, Math.ceil(measured));
    scratch.height = rows;
    context.clearRect(0, 0, scratch.width, scratch.height);
    context.font = `900 ${fontSize}px Oxanium, Trebuchet MS, sans-serif`;
    context.fillStyle = "#fff";
    context.textAlign = "left";
    context.textBaseline = "middle";
    context.fillText(text, 4, rows / 2 + 0.5);

    const pixels = context.getImageData(0, 0, scratch.width, scratch.height).data;
    const points = [];

    for (let y = 0; y < scratch.height; y += 1) {
      for (let x = 0; x < scratch.width; x += 1) {
        const alpha = pixels[((y * scratch.width + x) * 4) + 3];
        if (alpha > 102) points.push({ x, y, alpha: alpha / 255 });
      }
    }

    return { width: scratch.width, height: scratch.height, points };
  }

  function hasVisibleDisplay() {
    return !document.hidden && displays.some((display) => display.visible);
  }

  function updateLoop() {
    const shouldRun = hasVisibleDisplay();

    if (shouldRun && !frameRequest) {
      frameRequest = window.requestAnimationFrame(render);
      return;
    }

    if (!shouldRun && frameRequest) {
      window.cancelAnimationFrame(frameRequest);
      frameRequest = 0;
    }
  }

  const visibilityObserver = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const display = displayByCanvas.get(entry.target);
        if (display) display.visible = entry.isIntersecting;
      });
      updateLoop();
    }, { rootMargin: "100px 0px" })
    : null;

  class MatrixDisplay {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      this.text = normalizeText(options.text);
      this.mode = options.mode;
      this.palette = options.palette;
      this.role = options.role;
      this.startedAt = performance.now() - Math.random() * 1400;
      this.width = 1;
      this.height = 1;
      this.pixelRatio = 1;
      this.rows = this.role === "breadcrumb" ? 11 : 14;
      this.columns = 72;
      this.cellWidth = 8;
      this.cellHeight = 8;
      this.visible = true;
      this.mask = { width: 1, height: this.rows, points: [] };
      this.resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => this.resize()) : null;

      displayByCanvas.set(canvas, this);
      visibilityObserver?.observe(canvas);
      this.resizeObserver?.observe(canvas);
      if (!this.resizeObserver) window.addEventListener("resize", () => this.resize(), { passive: true });
      this.resize();
    }

    resize() {
      if (!this.context) return;
      const bounds = this.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;

      this.pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
      this.width = bounds.width;
      this.height = bounds.height;
      this.rows = this.role === "breadcrumb"
        ? (this.width < 560 ? 9 : 11)
        : (this.width < 560 ? 11 : 14);
      this.cellHeight = this.height / this.rows;
      this.columns = Math.max(38, Math.floor(this.width / this.cellHeight));
      this.cellWidth = this.width / this.columns;
      this.canvas.width = Math.round(this.width * this.pixelRatio);
      this.canvas.height = Math.round(this.height * this.pixelRatio);
      this.context.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
      this.mask = buildMask(this.text, this.rows, this.columns, this.mode);
    }

    colorAt(value) {
      const index = ((Math.floor(value) % this.palette.length) + this.palette.length) % this.palette.length;
      return this.palette[index];
    }

    drawLed(gridX, gridY, color, alpha = 1, sizeBoost = 1) {
      if (!this.context || gridX < -2 || gridX > this.columns + 2 || gridY < -2 || gridY > this.rows + 2) return;

      const size = Math.min(this.cellWidth, this.cellHeight);
      const dot = Math.max(1.4, size * 0.5 * sizeBoost);
      const x = (gridX + 0.5) * this.cellWidth - dot / 2;
      const y = (gridY + 0.5) * this.cellHeight - dot / 2;

      this.context.globalAlpha = clamp(alpha);
      this.context.fillStyle = color;
      this.context.fillRect(x, y, dot, dot);
    }

    drawChase(elapsed, flagMode = false) {
      const travel = (elapsed * 0.008 * speedFactor) % (this.mask.width + this.columns + 18);
      const originX = this.columns + 8 - travel;

      this.mask.points.forEach((point) => {
        const color = flagMode
          ? this.palette[Math.abs(Math.floor((point.x + elapsed * 0.011) / 7)) % this.palette.length]
          : this.colorAt(point.x * 0.18 + point.y * 0.08 + elapsed * 0.0055);
        this.drawLed(originX + point.x, point.y, color, point.alpha, 1.05);
      });
    }

    drawCenter(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 5600;
      const reveal = clamp(cycle / 1450);
      const fade = cycle < 4400 ? 1 : clamp((5600 - cycle) / 1200);
      const center = this.mask.width / 2;
      const allowed = center * reveal;

      this.mask.points.forEach((point) => {
        const distance = Math.abs(point.x - center);
        if (distance > allowed) return;
        const edge = clamp(1 - Math.abs(distance - allowed) / 4);
        this.drawLed(
          originX + point.x,
          point.y,
          this.colorAt(distance * 0.17 + elapsed * 0.003),
          point.alpha * fade,
          1 + edge * 0.15
        );
      });
    }

    drawScan(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const scan = (((elapsed * speedFactor) % 3000) / 3000) * (this.mask.width + 16) - 8;

      this.mask.points.forEach((point) => {
        const power = clamp(1 - Math.abs(point.x - scan) / 7);
        const color = power > 0.68 ? "#ffffff" : this.colorAt(point.x * 0.14 + elapsed * 0.003);
        this.drawLed(originX + point.x, point.y, color, point.alpha * (0.4 + power * 0.6), 1 + power * 0.18);
      });
    }

    drawType(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 6200;
      const reveal = clamp(cycle / 2200);
      const fade = cycle < 5000 ? 1 : clamp((6200 - cycle) / 1200);
      const column = this.mask.width * reveal;

      this.mask.points.forEach((point) => {
        if (point.x > column) return;
        const cursor = clamp(1 - Math.abs(point.x - column) / 5);
        this.drawLed(
          originX + point.x,
          point.y,
          cursor > 0.7 ? "#ffffff" : this.colorAt(point.x * 0.19 + point.y * 0.08),
          point.alpha * fade,
          1 + cursor * 0.14
        );
      });
    }

    drawStackRight(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 6000;
      const reveal = clamp(cycle / 1850);
      const threshold = this.mask.width * (1 - reveal);
      const fade = cycle < 4900 ? 1 : clamp((6000 - cycle) / 1100);

      this.mask.points.forEach((point) => {
        if (point.x < threshold) return;
        const arrival = clamp(1 - Math.abs(point.x - threshold) / 5);
        const nudge = arrival * (((point.x + point.y) % 2) ? 0.45 : -0.45);
        this.drawLed(
          originX + point.x,
          point.y + nudge,
          this.colorAt((this.mask.width - point.x) * 0.2),
          point.alpha * fade,
          1 + arrival * 0.12
        );
      });
    }

    drawWipe(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 5200;
      const wave = (cycle / 5200) * (this.mask.width + 22) - 11;

      this.mask.points.forEach((point) => {
        const active = clamp(1 - Math.abs(point.x - wave) / 13);
        const base = point.x < wave ? 0.92 : 0.18;
        this.drawLed(
          originX + point.x,
          point.y,
          active > 0.65 ? "#ffffff" : this.colorAt(point.x * 0.12 + elapsed * 0.002),
          point.alpha * (base + active * 0.25),
          1 + active * 0.12
        );
      });
    }

    drawComet(elapsed) {
      const travel = (elapsed * 0.0085 * speedFactor) % (this.mask.width + this.columns + 30);
      const originX = this.columns + 12 - travel;
      const comet = (elapsed * 0.017) % (this.mask.width + 18) - 9;

      this.mask.points.forEach((point) => {
        const power = clamp(1 - Math.abs(point.x - comet) / 10);
        const color = power > 0.66 ? "#ffffff" : this.colorAt(point.x * 0.17 + elapsed * 0.004);
        this.drawLed(originX + point.x, point.y, color, point.alpha * (0.66 + power * 0.34), 1 + power * 0.16);
      });
    }

    render(now) {
      if (!this.context || !this.width || !this.height || !this.visible) return;

      const elapsed = now - this.startedAt;
      this.context.clearRect(0, 0, this.width, this.height);
      this.context.save();
      this.context.globalCompositeOperation = "lighter";

      if (this.mode === "chase") this.drawChase(elapsed, false);
      if (this.mode === "flag") this.drawChase(elapsed, true);
      if (this.mode === "center") this.drawCenter(elapsed);
      if (this.mode === "scan") this.drawScan(elapsed);
      if (this.mode === "type") this.drawType(elapsed);
      if (this.mode === "stack-right") this.drawStackRight(elapsed);
      if (this.mode === "wipe") this.drawWipe(elapsed);
      if (this.mode === "comet") this.drawComet(elapsed);

      this.context.restore();
    }

    destroy() {
      this.resizeObserver?.disconnect();
      visibilityObserver?.unobserve(this.canvas);
    }
  }

  function mountDisplay(canvas, text, mode, palette, role) {
    if (!canvas || !text) return;
    const display = new MatrixDisplay(canvas, { text, mode, palette, role });
    displays.push(display);
  }

  function transformHero(usedEffects, usedPalettes) {
    const hero = document.querySelector("header.hero");
    if (!hero || hero.dataset.matrixReady === "true") return;

    const text = collectPageText(hero);
    const top = createRibbon("top", text.top);
    const bottom = createRibbon("bottom", text.bottom);
    hero.prepend(top.ribbon);
    hero.append(bottom.ribbon);
    hero.classList.add("hero--matrix-framed");
    hero.dataset.matrixReady = "true";

    const topMode = pickEffect(text.top, usedEffects);
    const bottomMode = pickEffect(text.bottom, usedEffects);
    mountDisplay(top.canvas, text.top, topMode, pickPalette(topMode, usedPalettes), "hero");
    mountDisplay(bottom.canvas, text.bottom, bottomMode, pickPalette(bottomMode, usedPalettes), "hero");
  }

  function transformBreadcrumb(usedEffects, usedPalettes) {
    const ticker = document.querySelector(".breadcrumb-ticker");
    if (!ticker || ticker.dataset.matrixReady === "true") return;

    const rail = ticker.querySelector(".breadcrumb-ticker__rail");
    if (!rail) return;

    const text = collectBreadcrumbText(ticker);
    const canvas = document.createElement("canvas");
    canvas.className = "site-matrix-canvas site-matrix-canvas--breadcrumb";
    canvas.dataset.matrixText = text;
    canvas.setAttribute("aria-hidden", "true");
    rail.appendChild(canvas);
    ticker.classList.add("breadcrumb-ticker--matrix");
    ticker.dataset.matrixReady = "true";

    const mode = pickEffect(text, usedEffects);
    mountDisplay(canvas, text, mode, pickPalette(mode, usedPalettes), "breadcrumb");
  }

  function render(now) {
    frameRequest = 0;
    if (!hasVisibleDisplay()) return;

    if (now - lastFrame >= frameInterval) {
      lastFrame = now;
      displays.forEach((display) => display.render(now));
    }

    updateLoop();
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", init, { once: true });
      return;
    }

    const usedEffects = new Set();
    const usedPalettes = new Set();

    if (!document.body.classList.contains("led-magic-page")) transformHero(usedEffects, usedPalettes);
    transformBreadcrumb(usedEffects, usedPalettes);
    updateLoop();
  }

  document.addEventListener("visibilitychange", updateLoop);
  window.addEventListener("pagehide", () => {
    if (frameRequest) window.cancelAnimationFrame(frameRequest);
    frameRequest = 0;
    displays.forEach((display) => display.destroy());
    visibilityObserver?.disconnect();
  });

  window.ShynetymeLedMatrix = { initialized: true, init };
  Promise.resolve(document.fonts?.ready).finally(init);
})();
