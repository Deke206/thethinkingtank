(() => {
  "use strict";

  const FRAME_COUNT = 6;
  const FRAME_INTERVAL_MS = 82;
  const FRAME_STEP_PERCENT = 100 / (FRAME_COUNT - 1);
  const instances = new WeakMap();

  const preload = (url, onReady) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = onReady;
    image.src = url;
    return image;
  };

  const mount = ({ button, image, scanUrl, laptopUrl }) => {
    if (!button || !image || !scanUrl || !laptopUrl) return null;
    if (instances.has(button)) return instances.get(button);

    image.style.setProperty("animation", "none", "important");
    image.style.setProperty("transform", "none", "important");

    const sprite = document.createElement("span");
    sprite.className = "chuck-frame-sprite";
    sprite.setAttribute("aria-hidden", "true");
    Object.assign(sprite.style, {
      display: "block",
      width: "92%",
      height: "100%",
      margin: "0 auto",
      opacity: "0",
      backgroundRepeat: "no-repeat",
      backgroundSize: "600% 100%",
      backgroundPosition: "0% center",
      filter: "drop-shadow(0 0 9px rgba(49, 230, 255, .82))",
      pointerEvents: "none",
      transition: "opacity 120ms ease"
    });
    image.insertAdjacentElement("afterend", sprite);

    const urls = { scan: scanUrl, laptop: laptopUrl };
    const ready = { scan: false, laptop: false };
    let mode = "scan";
    let frame = 0;
    let running = false;
    let rafId = 0;
    let lastFrameAt = 0;

    const revealSprite = () => {
      if (!ready.scan && !ready.laptop) return;
      sprite.style.opacity = "1";
      image.style.setProperty("display", "none", "important");
    };

    preload(scanUrl, () => {
      ready.scan = true;
      if (!sprite.style.backgroundImage) sprite.style.backgroundImage = `url("${scanUrl}")`;
      revealSprite();
    });

    preload(laptopUrl, () => {
      ready.laptop = true;
      revealSprite();
    });

    const setFrame = (index) => {
      frame = index % FRAME_COUNT;
      sprite.style.backgroundPosition = `${frame * FRAME_STEP_PERCENT}% center`;
    };

    const setMode = (nextMode) => {
      const requested = nextMode === "laptop" ? "laptop" : "scan";
      const usable = ready[requested]
        ? requested
        : ready.scan
          ? "scan"
          : ready.laptop
            ? "laptop"
            : requested;

      if (usable === mode && sprite.style.backgroundImage) return;
      mode = usable;
      sprite.style.backgroundImage = `url("${urls[mode]}")`;
      setFrame(0);
    };

    const tick = (now) => {
      if (!running) return;
      if (!lastFrameAt || now - lastFrameAt >= FRAME_INTERVAL_MS) {
        setFrame(frame + 1);
        lastFrameAt = now;
      }
      rafId = window.requestAnimationFrame(tick);
    };

    const api = {
      start(nextMode = "scan") {
        setMode(nextMode);
        if (running) return;
        running = true;
        lastFrameAt = 0;
        rafId = window.requestAnimationFrame(tick);
      },
      stop() {
        running = false;
        window.cancelAnimationFrame(rafId);
        setFrame(0);
      },
      setMode
    };

    instances.set(button, api);
    return api;
  };

  window.ShynetymeChuckSprite = { mount };
})();