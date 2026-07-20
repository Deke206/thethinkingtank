(() => {
  const carousel = document.getElementById('heroCarousel');
  if (!carousel) return;

  const hero = carousel.closest('.hero');
  const scenes = [...carousel.querySelectorAll('.hero-carousel__scene')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const previewMode = new URLSearchParams(window.location.search).has('preview');
  const sceneDuration = previewMode ? 6500 : 35000;
  const maxDevicePixelRatio = 1.5;
  const maxPointsPerScene = 1250;
  const effects = ['twinkle', 'chase', 'colorwave', 'centerout'];
  const sceneNames = [
    'After-work homecoming',
    'School-day homecoming',
    'Neighborhood dance break',
    'Marina homecoming'
  ];

  let currentScene = 0;
  let timer = 0;
  let animationFrame = 0;
  let sceneStartedAt = performance.now();
  let resizeTimer = 0;

  carousel.style.setProperty('--scene-duration', `${sceneDuration}ms`);

  // Keep the existing approved images, but remove the visible copy panel, sparkle wash and controls.
  hero?.querySelector(':scope > .container')?.remove();
  carousel.querySelector('.hero-carousel__controls')?.remove();
  carousel.querySelector('.hero-carousel__sparkle')?.remove();

  const status = document.createElement('p');
  status.className = 'visually-hidden';
  status.setAttribute('aria-live', 'polite');
  carousel.append(status);

  const style = document.createElement('style');
  style.dataset.heroLedCarousel = 'true';
  style.textContent = `
    .home-page .hero {
      min-height: clamp(360px, 56.25vw, 900px);
      padding: 0 !important;
      display: block;
      background: #030918;
    }
    .home-page .hero::before {
      z-index: 2;
      background:
        linear-gradient(180deg, rgba(3,9,24,.08), transparent 64%, rgba(3,9,24,.32)),
        linear-gradient(90deg, rgba(3,9,24,.08), transparent 20%, transparent 80%, rgba(3,9,24,.08));
    }
    .home-page .hero-carousel {
      position: absolute;
      inset: 0;
      overflow: hidden;
      background: #030918;
    }
    .home-page .hero-carousel__scene {
      overflow: hidden;
      background: #030918;
    }
    .home-page .hero-carousel__scene img,
    .home-page .hero-carousel__led-layer {
      position: absolute;
      inset: 0;
      display: block;
      width: 100%;
      height: 100%;
    }
    .home-page .hero-carousel__scene img {
      object-fit: cover;
      object-position: center;
      filter: saturate(.98) brightness(.9) contrast(1.05);
    }
    .home-page .hero-carousel__led-layer {
      z-index: 1;
      pointer-events: none;
      mix-blend-mode: screen;
      opacity: .96;
      transform-origin: center;
    }
    .home-page .hero-carousel__scene.is-active img,
    .home-page .hero-carousel__scene.is-active .hero-carousel__led-layer {
      animation: hero-scene-drift var(--scene-duration, 35000ms) ease-out both;
    }
    @media (max-width: 991.98px) {
      .home-page .hero { min-height: clamp(390px, 68vw, 680px); }
      .home-page .hero-carousel__scene img { object-position: 58% center; }
    }
    @media (max-width: 575.98px) {
      .home-page .hero { min-height: 58vh; max-height: 720px; }
      .home-page .hero-carousel__scene img { object-position: 62% center; }
    }
    @media (prefers-reduced-motion: reduce) {
      .home-page .hero-carousel__scene.is-active img,
      .home-page .hero-carousel__scene.is-active .hero-carousel__led-layer {
        animation: none !important;
      }
    }
  `;
  document.head.append(style);

  scenes.forEach((scene, index) => {
    scene.dataset.ledEffect = effects[index % effects.length];
    scene.dataset.sceneName = sceneNames[index] || `Scene ${index + 1}`;

    const canvas = document.createElement('canvas');
    canvas.className = 'hero-carousel__led-layer';
    canvas.setAttribute('aria-hidden', 'true');
    scene.append(canvas);
  });

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  function hash01(x, y, seed) {
    let value = Math.imul((x + 1) ^ (seed * 374761393), 668265263);
    value = Math.imul(value ^ (y + 1), 2246822519);
    value ^= value >>> 13;
    value = Math.imul(value, 3266489917);
    value ^= value >>> 16;
    return (value >>> 0) / 4294967295;
  }

  function rgbToHsv(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    let hue = 0;

    if (delta) {
      if (max === r) hue = 60 * (((g - b) / delta) % 6);
      else if (max === g) hue = 60 * ((b - r) / delta + 2);
      else hue = 60 * ((r - g) / delta + 4);
    }

    if (hue < 0) hue += 360;
    return { h: hue, s: max === 0 ? 0 : delta / max, v: max };
  }

  function pixelValue(data, width, x, y) {
    const height = data.length / 4 / width;
    const safeX = clamp(x, 0, width - 1);
    const safeY = clamp(y, 0, height - 1);
    const index = (safeY * width + safeX) * 4;
    return Math.max(data[index], data[index + 1], data[index + 2]) / 255;
  }

  function isNeonPixel(data, width, height, x, y) {
    const index = (y * width + x) * 4;
    const red = data[index];
    const green = data[index + 1];
    const blue = data[index + 2];
    const hsv = rgbToHsv(red, green, blue);
    const maxChannel = Math.max(red, green, blue);
    const minChannel = Math.min(red, green, blue);
    const chroma = maxChannel - minChannel;

    if (y < height * 0.22) return null;
    if (maxChannel < 112 || chroma < 44 || hsv.s < 0.46 || hsv.v < 0.44) return null;

    const warmHue = hsv.h >= 22 && hsv.h <= 68;
    const redOrangeHue = hsv.h < 22 || hsv.h > 342;

    // Suppress ordinary porch/window/street lighting while retaining saturated red/orange LEDs.
    if (warmHue && (hsv.s < 0.76 || hsv.v < 0.72 || y < height * 0.42)) return null;
    if (redOrangeHue && (hsv.s < 0.63 || hsv.v < 0.56)) return null;

    const radius = 6;
    const neighborAverage = (
      pixelValue(data, width, x - radius, y) +
      pixelValue(data, width, x + radius, y) +
      pixelValue(data, width, x, y - radius) +
      pixelValue(data, width, x, y + radius)
    ) / 4;
    const prominence = hsv.v - neighborAverage;

    // Luminous colored points survive; broad colored clothing and ordinary objects usually do not.
    if (prominence < 0.045 && !(hsv.v > 0.82 && hsv.s > 0.7)) return null;
    return hsv;
  }

  async function buildLedMap(scene, sceneIndex) {
    const image = scene.querySelector('img');
    const canvas = scene.querySelector('.hero-carousel__led-layer');
    if (!image || !canvas) return;

    try {
      await image.decode();
    } catch {
      // Cached images may already be usable even when decode() rejects.
    }

    const sourceWidth = image.naturalWidth || 1600;
    const sourceHeight = image.naturalHeight || 900;
    const sampleScale = Math.min(1, 960 / sourceWidth);
    const sampleWidth = Math.max(1, Math.round(sourceWidth * sampleScale));
    const sampleHeight = Math.max(1, Math.round(sourceHeight * sampleScale));
    const sampleCanvas = document.createElement('canvas');
    const sampleContext = sampleCanvas.getContext('2d', { willReadFrequently: true });

    sampleCanvas.width = sampleWidth;
    sampleCanvas.height = sampleHeight;
    sampleContext.drawImage(image, 0, 0, sampleWidth, sampleHeight);

    let pixels;
    try {
      pixels = sampleContext.getImageData(0, 0, sampleWidth, sampleHeight).data;
    } catch {
      scene.dataset.ledUnavailable = 'true';
      return;
    }

    const points = [];
    const step = sampleWidth > 760 ? 6 : 5;

    for (let y = step; y < sampleHeight - step; y += step) {
      for (let x = step; x < sampleWidth - step; x += step) {
        const hsv = isNeonPixel(pixels, sampleWidth, sampleHeight, x, y);
        if (!hsv || hash01(x, y, sceneIndex + 11) < 0.24) continue;

        points.push({
          nx: x / sampleWidth,
          ny: y / sampleHeight,
          hue: hsv.h,
          saturation: clamp(hsv.s * 112, 70, 100),
          lightness: clamp(48 + hsv.v * 22, 54, 72),
          phase: hash01(x + 17, y + 31, sceneIndex + 23) * Math.PI * 2,
          speed: 1.35 + hash01(x + 61, y + 7, sceneIndex + 37) * 2.4,
          size: 0.78 + hash01(x + 3, y + 89, sceneIndex + 41) * 0.8
        });
      }
    }

    if (points.length > maxPointsPerScene) {
      const stride = points.length / maxPointsPerScene;
      scene._ledPoints = Array.from(
        { length: maxPointsPerScene },
        (_, index) => points[Math.floor(index * stride)]
      );
    } else {
      scene._ledPoints = points;
    }

    scene._sourceSize = { width: sourceWidth, height: sourceHeight };
    sizeCanvas(scene);
  }

  function sizeCanvas(scene) {
    const canvas = scene.querySelector('.hero-carousel__led-layer');
    if (!canvas) return;

    const rect = scene.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, maxDevicePixelRatio);
    const width = Math.max(1, Math.round(rect.width * dpr));
    const height = Math.max(1, Math.round(rect.height * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }

    scene._canvasSize = { cssWidth: rect.width, cssHeight: rect.height, dpr };
  }

  function effectAlpha(effect, point, elapsed) {
    switch (effect) {
      case 'chase': {
        const head = (elapsed * 0.115) % 1.25 - 0.12;
        const distance = Math.abs(point.nx - head);
        const trailDistance = point.nx <= head ? head - point.nx : 2;
        return clamp(0.14 + Math.exp(-distance * 42) + Math.exp(-trailDistance * 9) * 0.42, 0, 1);
      }
      case 'colorwave': {
        const waveA = (Math.sin(elapsed * 2.2 + point.nx * 13 + point.phase) + 1) / 2;
        const waveB = (Math.sin(elapsed * 1.35 - point.ny * 18 + point.phase * 0.35) + 1) / 2;
        return 0.12 + Math.pow(waveA * 0.62 + waveB * 0.38, 2.1) * 0.88;
      }
      case 'centerout': {
        const distanceFromCenter = Math.abs(point.nx - 0.5) * 2;
        const front = (elapsed * 0.24) % 1.18;
        const distance = Math.abs(distanceFromCenter - front);
        const echo = Math.abs(distanceFromCenter - ((front + 0.34) % 1.18));
        return clamp(0.12 + Math.exp(-distance * 33) + Math.exp(-echo * 42) * 0.44, 0, 1);
      }
      case 'twinkle':
      default: {
        const pulse = Math.max(0, Math.sin(elapsed * point.speed + point.phase));
        const slowGlow = (Math.sin(elapsed * 0.7 + point.phase * 0.45) + 1) / 2;
        return 0.1 + Math.pow(pulse, 5) * 0.78 + slowGlow * 0.12;
      }
    }
  }

  function renderLedScene(scene, timestamp, staticFrame = false) {
    const canvas = scene.querySelector('.hero-carousel__led-layer');
    const points = scene._ledPoints;
    const source = scene._sourceSize;
    const viewport = scene._canvasSize;
    if (!canvas || !points?.length || !source || !viewport) return;

    const context = canvas.getContext('2d');
    const { cssWidth, cssHeight, dpr } = viewport;
    const coverScale = Math.max(cssWidth / source.width, cssHeight / source.height);
    const renderedWidth = source.width * coverScale;
    const renderedHeight = source.height * coverScale;
    const offsetX = (cssWidth - renderedWidth) / 2;
    const offsetY = (cssHeight - renderedHeight) / 2;
    const elapsed = staticFrame ? 1.25 : (timestamp - sceneStartedAt) / 1000;
    const effect = scene.dataset.ledEffect || 'twinkle';
    const baseRadius = clamp(cssWidth / 760, 0.9, 2.05);

    context.setTransform(dpr, 0, 0, dpr, 0, 0);
    context.clearRect(0, 0, cssWidth, cssHeight);
    context.globalCompositeOperation = 'lighter';

    for (const point of points) {
      const x = offsetX + point.nx * renderedWidth;
      const y = offsetY + point.ny * renderedHeight;
      if (x < -8 || y < -8 || x > cssWidth + 8 || y > cssHeight + 8) continue;

      const alpha = staticFrame ? 0.66 : effectAlpha(effect, point, elapsed);
      if (alpha < 0.13) continue;

      const radius = baseRadius * point.size * (0.82 + alpha * 0.48);
      const color = `hsl(${point.hue.toFixed(1)} ${point.saturation.toFixed(0)}% ${point.lightness.toFixed(0)}%)`;

      context.globalAlpha = alpha * 0.22;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius * 3.2, 0, Math.PI * 2);
      context.fill();

      context.globalAlpha = alpha;
      context.shadowColor = color;
      context.shadowBlur = 5 + alpha * 8;
      context.fillStyle = color;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();

      if (alpha > 0.86) {
        context.globalAlpha = (alpha - 0.86) * 4.7;
        context.shadowColor = '#fff';
        context.shadowBlur = 7;
        context.fillStyle = '#fff';
        context.beginPath();
        context.arc(x, y, Math.max(0.55, radius * 0.34), 0, Math.PI * 2);
        context.fill();
      }
    }

    context.shadowBlur = 0;
    context.globalAlpha = 1;
    context.globalCompositeOperation = 'source-over';
  }

  function animationLoop(timestamp) {
    renderLedScene(scenes[currentScene], timestamp, false);
    animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function restartAnimation() {
    window.cancelAnimationFrame(animationFrame);
    sceneStartedAt = performance.now();

    if (reducedMotion.matches) {
      renderLedScene(scenes[currentScene], sceneStartedAt, true);
      return;
    }

    animationFrame = window.requestAnimationFrame(animationLoop);
  }

  function restartTimer() {
    window.clearTimeout(timer);
    if (reducedMotion.matches || document.hidden) return;
    timer = window.setTimeout(() => showScene(currentScene + 1), sceneDuration);
  }

  function showScene(index) {
    currentScene = (index + scenes.length) % scenes.length;

    scenes.forEach((scene, sceneIndex) => {
      const active = sceneIndex === currentScene;
      scene.classList.toggle('is-active', active);
      scene.setAttribute('aria-hidden', String(!active));

      if (!active) {
        const context = scene.querySelector('.hero-carousel__led-layer')?.getContext('2d');
        context?.clearRect(0, 0, context.canvas.width, context.canvas.height);
      }
    });

    status.textContent = `Scene ${currentScene + 1} of ${scenes.length}: ${scenes[currentScene].dataset.sceneName}`;
    restartAnimation();
    restartTimer();
  }

  function resizeAll() {
    scenes.forEach(sizeCanvas);
    restartAnimation();
  }

  async function initialize() {
    await Promise.all(scenes.map(buildLedMap));
    showScene(0);
  }

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resizeAll, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      window.clearTimeout(timer);
      window.cancelAnimationFrame(animationFrame);
    } else {
      restartAnimation();
      restartTimer();
    }
  });

  const handleMotionChange = () => {
    restartAnimation();
    restartTimer();
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', handleMotionChange);
  else reducedMotion.addListener(handleMotionChange);

  initialize();
})();
