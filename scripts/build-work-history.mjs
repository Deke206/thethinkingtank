import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-7";
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

await writeText("css/site-hero.css", `/* Canonical site-wide full-width panoramic carousel. */
:root {
  --site-hero-height: clamp(300px, 32vw, 420px);
}

.hero {
  position: relative;
  isolation: isolate;
  display: block;
  width: 100%;
  height: var(--site-hero-height) !important;
  min-height: 0 !important;
  max-height: none !important;
  padding: 0 !important;
  overflow: hidden;
  color: #fff;
  background: #030918 url('../assets/images/hero-scene-work.webp') center center / cover no-repeat !important;
  border-bottom: 1px solid rgba(49, 230, 255, .22);
}

.hero::before,
.hero::after {
  content: none !important;
  display: none !important;
}

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
  opacity: 0;
  visibility: hidden;
  background: #030918;
  transition: none !important;
}

.hero-carousel__scene.is-active {
  opacity: 1;
  visibility: visible;
}

.hero-carousel__scene img,
.hero-carousel__scene.is-active img {
  display: block;
  width: 100% !important;
  height: 100% !important;
  padding: 0 !important;
  object-fit: cover !important;
  object-position: center center !important;
  opacity: 1 !important;
  filter: none !important;
  animation: none !important;
  transform: none !important;
}

.hero-carousel__sparkle { display: none !important; }

@media (max-width: 991.98px) {
  :root { --site-hero-height: clamp(270px, 46vw, 360px); }
}

@media (max-width: 575.98px) {
  :root { --site-hero-height: clamp(230px, 60vw, 290px); }
}

@media (max-height: 700px) and (min-width: 768px) {
  :root { --site-hero-height: min(44svh, 340px); }
}
`);

for (const page of pages) {
  let html = await readText(page);
  html = html.replace(/shared-ui-\d+/g, release);
  if (/site-led-matrix|site-matrix-ribbon|site-matrix-canvas/.test(html)) {
    throw new Error(`${page} still contains removed LED matrix markup or assets`);
  }
  await writeText(page, html);
}

let guide = await readText("js/site-guide.js");
guide = guide.replace(/const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/,
  `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`);
if (/site-led-matrix/.test(guide)) throw new Error("The shared loader still references the removed LED matrix");
await writeText("js/site-guide.js", guide);

const hero = await readText("css/site-hero.css");
if (!hero.includes("width: 100%;") || !hero.includes("object-fit: cover")) {
  throw new Error("The hero is not configured as a full-width panoramic banner");
}
if (hero.includes("object-fit: contain")) throw new Error("The old contained-image hero rule remains");

const { stdout: originalScript } = await execFileAsync("git", ["show", "HEAD^:scripts/build-work-history.mjs"], { cwd: root });
await writeText("scripts/build-work-history.mjs", originalScript);

await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Restore full-width panoramic hero banner"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
