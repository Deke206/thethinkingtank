import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-8";
const pages = [
  "index.html",
  "aboutme.html",
  "build-my-bike.html",
  "build-my-home.html",
  "contact.html",
  "led-banner-magic.html",
  "led-catalog.html"
];

const pathFor = (path) => resolve(root, path);
const readText = (path) => readFile(pathFor(path), "utf8");
const writeText = (path, content) => writeFile(pathFor(path), content, "utf8");

const heroCss = `/* Canonical site-wide hero carousel and inner LED edge strip. */
:root {
  --hero-led-a: #31e6ff;
  --hero-led-b: #9b83ff;
  --hero-led-speed: 5.8s;
  --hero-led-direction: normal;
}

html.site-led-palette--hot { --hero-led-a: #ff304f; --hero-led-b: #ffe45e; }
html.site-led-palette--sunset { --hero-led-a: #ff8a00; --hero-led-b: #ffc562; }
html.site-led-palette--electric { --hero-led-a: #48a9ff; --hero-led-b: #ff5ab9; }
html.site-led-palette--violet { --hero-led-a: #9b83ff; --hero-led-b: #31e6ff; }
html.site-led-mode--reverse { --hero-led-direction: reverse; --hero-led-speed: 6.4s; }
html.site-led-mode--stack { --hero-led-speed: 7.2s; }

.hero {
  position: relative;
  isolation: isolate;
  z-index: 0;
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  height: auto !important;
  min-height: 0 !important;
  max-height: none !important;
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden;
  color: #fff;
  background: #030918 url('../assets/images/hero-scene-work.webp') center / cover no-repeat !important;
}

.navbar + .hero { margin-top: 0 !important; }
.hero + #page-subheader { position: relative; z-index: 2; }

.hero::before {
  content: "" !important;
  position: absolute;
  inset: 5px;
  z-index: 4;
  display: block !important;
  pointer-events: none;
  background:
    radial-gradient(circle at 2px 2px, var(--hero-led-a) 0 1.45px, transparent 1.8px) 0 0 / 16px 4px repeat-x,
    radial-gradient(circle at 2px 2px, var(--hero-led-b) 0 1.45px, transparent 1.8px) 8px 0 / 16px 4px repeat-x,
    radial-gradient(circle at 2px 2px, var(--hero-led-b) 0 1.45px, transparent 1.8px) 0 100% / 16px 4px repeat-x,
    radial-gradient(circle at 2px 2px, var(--hero-led-a) 0 1.45px, transparent 1.8px) 8px 100% / 16px 4px repeat-x,
    radial-gradient(circle at 2px 2px, var(--hero-led-a) 0 1.45px, transparent 1.8px) 0 0 / 4px 16px repeat-y,
    radial-gradient(circle at 2px 2px, var(--hero-led-b) 0 1.45px, transparent 1.8px) 0 8px / 4px 16px repeat-y,
    radial-gradient(circle at 2px 2px, var(--hero-led-b) 0 1.45px, transparent 1.8px) 100% 0 / 4px 16px repeat-y,
    radial-gradient(circle at 2px 2px, var(--hero-led-a) 0 1.45px, transparent 1.8px) 100% 8px / 4px 16px repeat-y;
  filter: drop-shadow(0 0 3px var(--hero-led-a));
  animation: hero-led-edge-chase var(--hero-led-speed) linear infinite var(--hero-led-direction);
}

.hero::after { content: none !important; display: none !important; }

.hero-carousel {
  position: absolute;
  inset: 0;
  z-index: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.hero-carousel__scene {
  position: absolute;
  inset: 0;
  overflow: hidden;
  opacity: 0;
  visibility: hidden;
  background: #030918;
  transition: none !important;
}

.hero-carousel__scene.is-active { opacity: 1; visibility: visible; }

.hero-carousel__scene img,
.hero-carousel__scene.is-active img {
  display: block;
  width: 100% !important;
  height: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
  object-fit: cover !important;
  object-position: center center !important;
  opacity: 1 !important;
  filter: none !important;
  animation: none !important;
  transform: none !important;
}

.hero-carousel__sparkle { display: none !important; }

@keyframes hero-led-edge-chase {
  from {
    background-position: 0 0, 8px 0, 0 100%, 8px 100%, 0 0, 0 8px, 100% 0, 100% 8px;
  }
  to {
    background-position: 96px 0, 104px 0, -96px 100%, -88px 100%, 0 96px, 0 104px, 100% -96px, 100% -88px;
  }
}

html.site-led-mode--stack .hero::before { animation-timing-function: steps(16, end); }
html.site-led-mode--pulse .hero::before { animation-name: hero-led-edge-chase, hero-led-soft-pulse; animation-duration: var(--hero-led-speed), 2.8s; }

@keyframes hero-led-soft-pulse { 0%, 100% { opacity: .68; } 50% { opacity: 1; } }

@media (max-width: 991.98px) {
  .hero {
    aspect-ratio: auto;
    height: clamp(270px, 46vw, 360px) !important;
  }
}

@media (max-width: 575.98px) {
  .hero { height: clamp(230px, 60vw, 290px) !important; }
  .hero::before { inset: 4px; }
}

@media (max-height: 700px) and (min-width: 768px) and (max-width: 991.98px) {
  .hero { height: min(44svh, 340px) !important; }
}

@media (prefers-reduced-motion: reduce) {
  .hero::before { animation: none !important; opacity: .82; }
}
`;
await writeText("css/site-hero.css", heroCss);

let navigation = await readText("css/site-navigation.css");
const navMarker = "/* Shared navbar LED edge strip. */";
if (navigation.includes(navMarker)) navigation = navigation.slice(0, navigation.indexOf(navMarker)).trimEnd() + "\n";
navigation += `

/* Shared navbar LED edge strip. */
.navbar { position: sticky; top: 0; isolation: isolate; z-index: 1030; }
.navbar::after {
  content: "";
  position: absolute;
  right: 0;
  bottom: 2px;
  left: 0;
  z-index: 2;
  height: 4px;
  pointer-events: none;
  background:
    radial-gradient(circle at 2px 2px, var(--hero-led-a, #31e6ff) 0 1.45px, transparent 1.8px) 0 0 / 16px 4px repeat-x,
    radial-gradient(circle at 2px 2px, var(--hero-led-b, #9b83ff) 0 1.45px, transparent 1.8px) 8px 0 / 16px 4px repeat-x;
  filter: drop-shadow(0 0 3px var(--hero-led-a, #31e6ff));
  animation: navbar-led-chase var(--hero-led-speed, 5.8s) linear infinite var(--hero-led-direction, normal);
}

@keyframes navbar-led-chase { to { background-position: 96px 0, 104px 0; } }
html.site-led-mode--stack .navbar::after { animation-timing-function: steps(16, end); }
html.site-led-mode--pulse .navbar::after { animation-name: navbar-led-chase, navbar-led-soft-pulse; animation-duration: var(--hero-led-speed, 5.8s), 2.8s; }
@keyframes navbar-led-soft-pulse { 0%, 100% { opacity: .68; } 50% { opacity: 1; } }

@media (prefers-reduced-motion: reduce) {
  .navbar::after { animation: none !important; opacity: .82; }
}
`;
await writeText("css/site-navigation.css", navigation);

let carousel = await readText("js/hero-carousel.js");
if (!carousel.includes("const installLedFrameTheme")) {
  carousel = carousel.replace(
    "  const timers = new Set();\n",
    `  const timers = new Set();
  const framePalettes = ["hot", "sunset", "electric", "violet"];
  const frameModes = ["chase", "reverse", "stack", "pulse"];

  const installLedFrameTheme = () => {
    const root = document.documentElement;
    if (root.dataset.siteLedFrameReady === "true") return;
    root.dataset.siteLedFrameReady = "true";
    const randomIndex = (length) => {
      if (window.crypto?.getRandomValues) {
        const value = new Uint32Array(1);
        window.crypto.getRandomValues(value);
        return value[0] % length;
      }
      return Math.floor(Math.random() * length);
    };
    root.classList.add(
      \`site-led-palette--\${framePalettes[randomIndex(framePalettes.length)]}\`,
      \`site-led-mode--\${frameModes[randomIndex(frameModes.length)]}\`
    );
  };
`
  );
  carousel = carousel.replace(
    "    document.querySelectorAll(\"header.hero\").forEach(startCarousel);",
    "    installLedFrameTheme();\n    document.querySelectorAll(\"header.hero\").forEach(startCarousel);"
  );
}
await writeText("js/hero-carousel.js", carousel);

let guide = await readText("js/site-guide.js");
guide = guide.replace(
  /const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/,
  `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`
);
await writeText("js/site-guide.js", guide);

for (const page of pages) {
  let html = await readText(page);
  html = html.replace(/css\/site\.css(?:\?[^"']*)?/g, `css/site.css?v=${release}`);
  html = html.replace(/css\/site-(navigation|hero|chuck|motion)\.css(?:\?[^"']*)?/g, (_match, name) => `css/site-${name}.css?v=${release}`);
  html = html.replace(/js\/site-guide\.js(?:\?[^"']*)?/g, `js/site-guide.js?v=${release}`);
  await writeText(page, html);
}

const finalHero = await readText("css/site-hero.css");
if (!finalHero.includes("aspect-ratio: 16 / 9")) throw new Error("Desktop hero ratio was not applied");
if (!finalHero.includes("object-fit: cover")) throw new Error("Desktop hero no longer fills the width");
if (finalHero.includes("blur(")) throw new Error("A blurred filler was accidentally added");
if (!finalHero.includes("@media (max-width: 991.98px)")) throw new Error("Mobile hero rules are missing");

const { stdout: originalScript } = await execFileAsync("git", ["show", "HEAD^:scripts/build-work-history.mjs"], { cwd: root });
await writeText("scripts/build-work-history.mjs", originalScript);

await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Fit desktop hero between navigation and page ribbon"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
