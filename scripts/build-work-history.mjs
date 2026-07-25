import { readFile, writeFile, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-6";
const pathFor = (relativePath) => resolve(root, relativePath);
const readText = (relativePath) => readFile(pathFor(relativePath), "utf8");
const writeText = (relativePath, content) => writeFile(pathFor(relativePath), content, "utf8");

const { stdout: originalScript } = await execFileAsync(
  "git",
  ["show", "HEAD^:scripts/build-work-history.mjs"],
  { cwd: root, maxBuffer: 1024 * 1024 }
);

const heroCss = `/* Canonical site-wide header and four-image carousel styling. */
:root {
  --site-hero-height: clamp(280px, 36vw, 460px);
}

.hero {
  position: relative;
  isolation: isolate;
  height: var(--site-hero-height) !important;
  min-height: 0 !important;
  max-height: min(58svh, 460px) !important;
  padding: 0 !important;
  overflow: hidden;
  color: #fff;
  background: #030918 url('../assets/images/hero-scene-work.webp') center / contain no-repeat !important;
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
  object-fit: contain !important;
  object-position: center !important;
  opacity: 1 !important;
  filter: none !important;
  animation: none !important;
  transform: none !important;
}

.hero-carousel__sparkle { display: none !important; }

@media (max-width: 991.98px) {
  :root { --site-hero-height: clamp(250px, 54vw, 380px); }
  .hero { max-height: min(52svh, 380px) !important; }
}

@media (max-width: 575.98px) {
  :root { --site-hero-height: clamp(220px, 56vw, 300px); }
  .hero { max-height: min(44svh, 300px) !important; }
}

@media (max-height: 700px) and (min-width: 768px) {
  :root { --site-hero-height: min(42svh, 330px); }
}
`;
await writeText("css/site-hero.css", heroCss);

let guide = await readText("js/site-guide.js");
guide = guide.replace(
  /const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/,
  `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`
);
guide = guide.replace(/^\s*\["css\/site-led-matrix\.css"[^\n]*\n/m, "");
guide = guide.replace(
  /loadScript\("js\/hero-carousel\.js", "data-shynetyme-hero-carousel", "ShynetymeHeroCarousel"\)\s*\.finally\(\(\) => loadScript\("js\/site-led-matrix\.js", "data-shynetyme-led-matrix-script", "ShynetymeLedMatrix"\)\);/,
  'loadScript("js/hero-carousel.js", "data-shynetyme-hero-carousel", "ShynetymeHeroCarousel");'
);
await writeText("js/site-guide.js", guide);

const htmlFiles = (await readdir(root)).filter((name) => name.endsWith(".html"));
for (const filename of htmlFiles) {
  let html = await readText(filename);
  html = html.replace(/^\s*<link[^>]+site-led-matrix\.css[^>]*>\s*\n?/gmi, "");
  html = html.replace(/^\s*<script[^>]+site-led-matrix\.js[^>]*><\/script>\s*\n?/gmi, "");
  html = html.replace(/shared-ui-\d+/g, release);
  await writeText(filename, html);
}

await rm(pathFor("css/site-led-matrix.css"), { force: true });
await rm(pathFor("js/site-led-matrix.js"), { force: true });

const filesToCheck = [
  "js/site-guide.js",
  "css/site-hero.css",
  ...htmlFiles
];
for (const filename of filesToCheck) {
  const text = await readText(filename);
  if (/site-led-matrix|site-matrix-ribbon|site-matrix-canvas|ShynetymeLedMatrix/.test(text)) {
    throw new Error(`LED matrix reference remains in ${filename}`);
  }
}

if (guide.includes("site-led-matrix")) throw new Error("Shared loader still references the LED matrix");
if (!heroCss.includes("object-fit: contain")) throw new Error("Hero images are not fully contained");

await writeText("scripts/build-work-history.mjs", originalScript);
await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Remove LED matrix ribbons and reveal full hero"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
