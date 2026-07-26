import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-9";
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

const slides = [
  {
    image: "hero-scene-work.webp",
    alt: "Deke working on a ShyneTyme project",
    callout: "CUSTOM LED BUILDS",
    theme: "cyan",
    active: true
  },
  {
    image: "hero-scene-school.webp",
    alt: "School-day ShyneTyme lighting scene",
    callout: "COOL. WEIRD. USEFUL.",
    theme: "pink"
  },
  {
    image: "hero-scene-dance.webp",
    alt: "Neighborhood dance and lighting scene",
    callout: "LIGHT UP EVERYTHING",
    theme: "amber"
  },
  {
    image: "hero-scene-marina.webp",
    alt: "Marina lighting scene",
    callout: "BUILT BY DEKE",
    theme: "violet"
  }
];

function buildCarousel(hiddenCopy, isHome) {
  const indicators = slides.map((slide, index) => `      <button type="button" data-bs-target="#siteBannerCarousel" data-bs-slide-to="${index}"${index === 0 ? ' class="active" aria-current="true"' : ""} aria-label="Slide ${index + 1}"></button>`).join("\n");
  const items = slides.map((slide, index) => `      <div class="carousel-item${slide.active ? " active" : ""}" data-bs-interval="6000">
        <img src="assets/images/${slide.image}" class="d-block w-100 site-banner-image" width="1600" height="900" alt="${slide.alt}"${index === 0 ? ' fetchpriority="high"' : ' loading="lazy"'}>
        <div class="carousel-caption site-banner-caption">
          <span class="site-banner-callout site-banner-callout--${slide.theme}">${slide.callout}</span>
        </div>
      </div>`).join("\n");

  return `  <header${isHome ? ' id="top"' : ""} class="site-banner">
${hiddenCopy}
    <div id="siteBannerCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-touch="true" aria-label="ShyneTyme Works project scenes">
      <div class="carousel-indicators">
${indicators}
      </div>
      <div class="carousel-inner">
${items}
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#siteBannerCarousel" data-bs-slide="prev">
        <span class="carousel-control-prev-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Previous slide</span>
      </button>
      <button class="carousel-control-next" type="button" data-bs-target="#siteBannerCarousel" data-bs-slide="next">
        <span class="carousel-control-next-icon" aria-hidden="true"></span>
        <span class="visually-hidden">Next slide</span>
      </button>
    </div>
  </header>`;
}

for (const filename of pages) {
  let html = await readText(filename);
  const headerPattern = /  <header\b[^>]*class="[^"]*\bhero\b[^"]*"[^>]*>[\s\S]*?<\/header>/i;
  const match = html.match(headerPattern);
  if (!match) throw new Error(`${filename}: old custom hero was not found`);

  const hiddenMatch = match[0].match(/<div class="visually-hidden">[\s\S]*?<\/div>/i);
  const hiddenCopy = hiddenMatch
    ? hiddenMatch[0].split("\n").map((line) => `    ${line.trimEnd()}`).join("\n")
    : '    <div class="visually-hidden"><h1>ShyneTyme Works</h1></div>';

  html = html.replace(headerPattern, buildCarousel(hiddenCopy, filename === "index.html"));
  html = html.replace(/css\/site\.css(?:\?[^"']*)?/g, `css/site.css?v=${release}`);
  html = html.replace(/css\/site-navigation\.css(?:\?[^"']*)?/g, `css/site-navigation.css?v=${release}`);
  html = html.replace(/css\/site-hero\.css(?:\?[^"']*)?/g, `css/site-hero.css?v=${release}`);
  html = html.replace(/css\/site-chuck\.css(?:\?[^"']*)?/g, `css/site-chuck.css?v=${release}`);
  html = html.replace(/css\/site-motion\.css(?:\?[^"']*)?/g, `css/site-motion.css?v=${release}`);
  html = html.replace(/js\/site-guide\.js(?:\?[^"']*)?/g, `js/site-guide.js?v=${release}`);
  await writeText(filename, html);
}

await writeText("css/site-hero.css", `/* Shared Bootstrap 5.3 banner sizing and caption treatment. */
.site-banner {
  width: 100%;
  margin: 0;
  overflow: hidden;
  background: #030918;
  border-bottom: 1px solid rgba(49, 230, 255, .22);
}

.site-banner .carousel,
.site-banner .carousel-inner,
.site-banner .carousel-item {
  height: clamp(280px, 30vw, 410px);
}

.site-banner-image {
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.site-banner-caption {
  right: auto;
  bottom: 1.2rem;
  left: clamp(1rem, 6vw, 5rem);
  padding: 0;
  text-align: left;
}

.site-banner-callout {
  --banner-accent: var(--cyan);
  display: inline-block;
  padding: .52rem .82rem;
  border: 2px solid var(--banner-accent);
  border-radius: .7rem;
  color: #fff;
  background: rgba(3, 9, 24, .76);
  box-shadow: 0 0 18px color-mix(in srgb, var(--banner-accent) 34%, transparent);
  font-family: var(--heading-font);
  font-size: clamp(.9rem, 1.4vw, 1.15rem);
  font-weight: 800;
  letter-spacing: .08em;
  line-height: 1.15;
  text-transform: uppercase;
  text-shadow: 0 0 10px color-mix(in srgb, var(--banner-accent) 55%, transparent);
  backdrop-filter: blur(4px);
}

.site-banner-callout--pink { --banner-accent: var(--pink); }
.site-banner-callout--amber { --banner-accent: var(--amber); }
.site-banner-callout--violet { --banner-accent: var(--violet); }

.site-banner .carousel-control-prev,
.site-banner .carousel-control-next { width: 8%; }

.site-banner .carousel-indicators { margin-bottom: .45rem; }
.site-banner .carousel-indicators [data-bs-target] { height: 3px; }

@media (max-width: 991.98px) {
  .site-banner .carousel,
  .site-banner .carousel-inner,
  .site-banner .carousel-item { height: clamp(250px, 44vw, 340px); }
}

@media (max-width: 575.98px) {
  .site-banner .carousel,
  .site-banner .carousel-inner,
  .site-banner .carousel-item { height: clamp(220px, 58vw, 280px); }

  .site-banner-caption {
    bottom: .9rem;
    left: .8rem;
  }

  .site-banner-callout {
    padding: .42rem .65rem;
    font-size: .82rem;
    letter-spacing: .055em;
  }
}
`);

let guide = await readText("js/site-guide.js");
guide = guide.replace(/const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/, `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`);
guide = guide.replace(/^\s*loadScript\("js\/hero-carousel\.js"[^\n]*\n/m, "");
await writeText("js/site-guide.js", guide);
await rm(pathFor("js/hero-carousel.js"), { force: true });

for (const filename of pages) {
  const html = await readText(filename);
  if ((html.match(/id="siteBannerCarousel"/g) || []).length !== 1) throw new Error(`${filename}: Bootstrap carousel count is not one`);
  if (!html.includes('class="carousel slide"')) throw new Error(`${filename}: Bootstrap carousel markup is missing`);
  if (!html.includes("bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js")) throw new Error(`${filename}: Bootstrap bundle is missing`);
  if (/data-site-hero|class="[^"]*\bhero\b/.test(html)) throw new Error(`${filename}: custom hero markup remains`);
}

if (/hero-carousel\.js|ShynetymeHeroCarousel/.test(guide)) throw new Error("Custom carousel loader remains in site-guide.js");
const heroCss = await readText("css/site-hero.css");
if (/hero-led-|hero-carousel__scene|site-led-mode/.test(heroCss)) throw new Error("Old carousel or LED styling remains in site-hero.css");

const originalScript = (await execFileAsync("git", ["show", "HEAD^:scripts/build-work-history.mjs"], { cwd: root })).stdout;
await writeText("scripts/build-work-history.mjs", originalScript);

await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Replace custom hero with Bootstrap carousel"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
