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
  const speedFactor = reduceMotion ? 0.72 : 1;
  const displays = [];
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
    const visibleHidden = hero.querySelector(".visually-hidden");
    const hiddenParts = visibleHidden
      ? [...visibleHidden.querySelectorAll("p, h1, h2")].map((node) => normalizeText(node.textContent)).filter(Boolean)
      : [];

    const top = firstMessage(banners[0]) || hiddenParts[0] || "SHYNETYME WORKS";
    const headline = firstMessage(banners[1]) || hiddenParts[1] || document.title.split("|")[0];
    const details = firstMessage(banners[2]) || hiddenParts[2] || "CUSTOM LED BUILDS";

    return {
      top,
      bottom: headline || details,
      details
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

    let fontSize = Math.max(10, Math.floor(rows * 0.74));
    const isScrolling = mode === "chase" || mode === "flag" || mode === "comet";

    context.font = `900 ${fontSize}px Oxanium, Trebuchet MS, sans-serif`;
    let measured = context.measureText(text).width + 8;

    if (!isScrolling && measured > columns - 4) {
      fontSize = Math.max(8, Math.floor(fontSize * ((columns - 4) / measured)));
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
        if (alpha > 68) points.push({ x, y, alpha: alpha / 255 });
      }
    }
    return { width: scratch.width, height: scratch.height, points };
  }

  class MatrixDisplay {
    constructor(canvas, options) {
      this.canvas = canvas;
      this.context = canvas.getContext("2d", { alpha: true });
      this.text = normalizeText(options.text);
      this.mode = options.mode;
      this.palette = options.palette;
      this.role = options.role;
      this.startedAt = performance.now() - Math.random() * 1600;
      this.width = 1;
      this.height = 1;
      this.rows = this.role === "breadcrumb" ? 14 : 18;
      this.columns = 80;
      this.cellWidth = 8;
      this.cellHeight = 8;
      this.mask = { width: 1, height: this.rows, points: [] };
      this.resizeObserver = "ResizeObserver" in window ? new ResizeObserver(() => this.resize()) : null;
      this.resizeObserver?.observe(canvas);
      if (!this.resizeObserver) window.addEventListener("resize", () => this.resize(), { passive: true });
      this.resize();
    }

    resize() {
      if (!this.context) return;
      const bounds = this.canvas.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      this.width = bounds.width;
      this.height = bounds.height;
      this.rows = this.role === "breadcrumb"
        ? (this.width < 560 ? 11 : 14)
        : (this.width < 560 ? 14 : 18);
      this.cellHeight = this.height / this.rows;
      this.columns = Math.max(42, Math.floor(this.width / this.cellHeight));
      this.cellWidth = this.width / this.columns;
      this.canvas.width = Math.round(this.width * pixelRatio);
      this.canvas.height = Math.round(this.height * pixelRatio);
      this.context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      this.mask = buildMask(this.text, this.rows, this.columns, this.mode);
    }

    colorAt(value) {
      const index = ((Math.floor(value) % this.palette.length) + this.palette.length) % this.palette.length;
      return this.palette[index];
    }

    drawLed(gridX, gridY, color, alpha = 1, glow = 1) {
      if (!this.context || gridX < -2 || gridX > this.columns + 2 || gridY < -2 || gridY > this.rows + 2) return;
      const x = (gridX + 0.5) * this.cellWidth;
      const y = (gridY + 0.5) * this.cellHeight;
      const size = Math.min(this.cellWidth, this.cellHeight);
      const radius = Math.max(1.15, size * 0.29);
      this.context.globalAlpha = clamp(alpha);
      this.context.fillStyle = color;
      this.context.shadowColor = color;
      this.context.shadowBlur = Math.max(3, size * 0.9 * glow);
      this.context.beginPath();
      this.context.arc(x, y, radius, 0, Math.PI * 2);
      this.context.fill();
    }

    drawBackground(now) {
      const ctx = this.context;
      if (!ctx) return;
      ctx.save();
      ctx.shadowBlur = 0;
      for (let y = 0; y < this.rows; y += 1) {
        for (let x = 0; x < this.columns; x += 1) {
          const seed = x * 19 + y * 37;
          const pulse = seed % 31 === 0 ? 0.09 + (Math.sin(now * 0.0025 + seed) + 1) * 0.035 : 0.055;
          ctx.globalAlpha = pulse;
          ctx.fillStyle = seed % 3 ? "#31e6ff" : "#ff5ab9";
          ctx.beginPath();
          ctx.arc((x + 0.5) * this.cellWidth, (y + 0.5) * this.cellHeight, Math.max(0.65, Math.min(this.cellWidth, this.cellHeight) * 0.11), 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.restore();
    }

    drawChase(elapsed, flagMode = false) {
      const travel = ((elapsed * 0.0085 * speedFactor) % (this.mask.width + this.columns + 18));
      const originX = this.columns + 8 - travel;
      this.mask.points.forEach((point) => {
        const color = flagMode
          ? this.palette[Math.floor((point.x + elapsed * 0.012) / 7) % this.palette.length]
          : this.colorAt(point.x * 0.18 + point.y * 0.08 + elapsed * 0.006);
        const shimmer = 0.84 + (Math.sin(elapsed * 0.015 + point.x * 0.55) + 1) * 0.08;
        this.drawLed(originX + point.x, point.y, color, point.alpha * shimmer, 1.25);
      });
    }

    drawCenter(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 5600;
      const reveal = clamp(cycle / 1450);
      const holdFade = cycle < 4400 ? 1 : clamp((5600 - cycle) / 1200);
      const center = this.mask.width / 2;
      const allowed = center * reveal;
      this.mask.points.forEach((point) => {
        const distance = Math.abs(point.x - center);
        if (distance > allowed) return;
        const edge = clamp(1 - Math.abs(distance - allowed) / 4);
        this.drawLed(originX + point.x, point.y, this.colorAt(distance * 0.17 + elapsed * 0.003), point.alpha * holdFade * (0.88 + edge * 0.2), 1.05 + edge);
      });
    }

    drawScan(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const scan = (((elapsed * speedFactor) % 3000) / 3000) * (this.mask.width + 16) - 8;
      this.mask.points.forEach((point) => {
        const distance = Math.abs(point.x - scan);
        const power = clamp(1 - distance / 7);
        const color = power > 0.68 ? "#ffffff" : this.colorAt(point.x * 0.14 + elapsed * 0.003);
        this.drawLed(originX + point.x, point.y, color, point.alpha * (0.38 + power * 0.78), 0.85 + power * 0.85);
      });
      for (let y = 0; y < this.rows; y += 2) this.drawLed(originX + scan, y, y % 4 ? "#ffc562" : "#31e6ff", 0.52, 1.6);
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
        this.drawLed(originX + point.x, point.y, cursor > 0.7 ? "#ffffff" : this.colorAt(point.x * 0.19 + point.y * 0.08), point.alpha * fade * (0.86 + cursor * 0.18), 1 + cursor);
      });
      if (reveal < 1) for (let y = 1; y < this.rows - 1; y += 2) this.drawLed(originX + column, y, y % 3 ? "#ff5ab9" : "#31e6ff", 0.64, 1.5);
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
        const drop = arrival * Math.sin((elapsed * 0.02) + point.x) * 0.75;
        this.drawLed(originX + point.x, point.y + drop, this.colorAt((this.mask.width - point.x) * 0.2), point.alpha * fade * (0.88 + arrival * 0.2), 1 + arrival);
      });
    }

    drawWipe(elapsed) {
      const originX = (this.columns - this.mask.width) / 2;
      const cycle = (elapsed * speedFactor) % 5200;
      const wave = (cycle / 5200) * (this.mask.width + 22) - 11;
      this.mask.points.forEach((point) => {
        const distance = Math.abs(point.x - wave);
        const active = clamp(1 - distance / 13);
        const base = point.x < wave ? 0.92 : 0.18;
        this.drawLed(originX + point.x, point.y, active > 0.65 ? "#ffffff" : this.colorAt(point.x * 0.12 + elapsed * 0.002), point.alpha * (base + active * 0.32), 0.8 + active);
      });
    }

    drawComet(elapsed) {
      const travel = ((elapsed * 0.009 * speedFactor) % (this.mask.width + this.columns + 30));
      const originX = this.columns + 12 - travel;
      const comet = ((elapsed * 0.018) % (this.mask.width + 18)) - 9;
      this.mask.points.forEach((point) => {
        const distance = Math.abs(point.x - comet);
        const power = clamp(1 - distance / 10);
        const color = power > 0.66 ? "#ffffff" : this.colorAt(point.x * 0.17 + elapsed * 0.004);
        this.drawLed(originX + point.x, point.y, color, point.alpha * (0.64 + power * 0.42), 0.9 + power * 0.8);
      });
    }

    render(now) {
      if (!this.context || !this.width || !this.height) return;
      const elapsed = now - this.startedAt;
      this.context.clearRect(0, 0, this.width, this.height);
      this.drawBackground(now);
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
  }

  function mountDisplay(canvas, text, mode, palette, role) {
    if (!canvas || !text) return;
    displays.push(new MatrixDisplay(canvas, { text, mode, palette, role }));
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
    const topPalette = pickPalette(topMode, usedPalettes);
    const bottomPalette = pickPalette(bottomMode, usedPalettes);
    mountDisplay(top.canvas, text.top, topMode, topPalette, "hero");
    mountDisplay(bottom.canvas, text.bottom, bottomMode, bottomPalette, "hero");
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
    frameRequest = window.requestAnimationFrame(render);
    if (now - lastFrame < 32) return;
    lastFrame = now;
    displays.forEach((display) => display.render(now));
  }

  function init() {
    const usedEffects = new Set();
    const usedPalettes = new Set();
    transformHero(usedEffects, usedPalettes);
    transformBreadcrumb(usedEffects, usedPalettes);
    if (displays.length && !frameRequest) frameRequest = window.requestAnimationFrame(render);
  }

  window.ShynetymeLedMatrix = { initialized: true, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();

  window.addEventListener("pagehide", () => {
    window.cancelAnimationFrame(frameRequest);
    displays.forEach((display) => display.resizeObserver?.disconnect());
  });
})();