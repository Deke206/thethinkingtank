import { readFile, writeFile, rm } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-3";
const originalScriptBase64 = "aW1wb3J0IHsgbWtkaXIsIHdyaXRlRmlsZSB9IGZyb20gIm5vZGU6ZnMvcHJvbWlzZXMiOwppbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAibm9kZTpwYXRoIjsKCmNvbnN0IHJlcG9zaXRvcnkgPSBwcm9jZXNzLmVudi5XT1JLX0hJU1RPUllfUkVQT1NJVE9SWSB8fCBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWSB8fCAiRGVrZTIwNi90aGV0aGlua2luZ3RhbmsiOwpjb25zdCBicmFuY2ggPSBwcm9jZXNzLmVudi5XT1JLX0hJU1RPUllfQlJBTkNIIHx8ICJtYWluIjsKY29uc3QgdG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgIiI7CmNvbnN0IG91dHB1dFBhdGggPSByZXNvbHZlKHByb2Nlc3MuY3dkKCksIHByb2Nlc3MuZW52LldPUktfSElTVE9SWV9PVVRQVVQgfHwgImRhdGEvd29yay1oaXN0b3J5Lmpzb24iKTsKY29uc3QgW293bmVyLCByZXBvXSA9IHJlcG9zaXRvcnkuc3BsaXQoIi8iKTsKCmlmICghb3duZXIgfHwgIXJlcG8pIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZXBvc2l0b3J5IG5hbWU6ICR7cmVwb3NpdG9yeX1gKTsKCmNvbnN0IGhlYWRlcnMgPSB7CiAgQWNjZXB0OiAiYXBwbGljYXRpb24vdm5kLmdpdGh1Yitqc29uIiwKICAiVXNlci1BZ2VudCI6ICJzaHluZXR5bWUtd29yay1oaXN0b3J5LWdlbmVyYXRvciIsCiAgIlgtR2l0SHViLUFwaS1WZXJzaW9uIjogIjIwMjItMTEtMjgiCn07CgppZiAodG9rZW4pIGhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IGBCZWFyZXIgJHt0b2tlbn1gOwoKY29uc3QgY29tbWl0cyA9IFtdOwpjb25zdCBzZWVuID0gbmV3IFNldCgpOwpsZXQgcGFnZSA9IDE7Cgp3aGlsZSAocGFnZSA8PSAyMCkgewogIGNvbnN0IHVybCA9IG5ldyBVUkwoYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtvd25lcn0vJHtyZXBvfS9jb21taXRzYCk7CiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoInNoYSIsIGJyYW5jaCk7CiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoInBlcl9wYWdlIiwgIjEwMCIpOwogIHVybC5zZWFyY2hQYXJhbXMuc2V0KCJwYWdlIiwgU3RyaW5nKHBhZ2UpKTsKCiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgaGVhZGVycyB9KTsKICBpZiAoIXJlc3BvbnNlLm9rKSB7CiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpOwogICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtib2R5LnNsaWNlKDAsIDMwMCl9YCk7CiAgfQoKICBjb25zdCBpdGVtcyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTsKICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpIHx8ICFpdGVtcy5sZW5ndGgpIGJyZWFrOwoKICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHsKICAgIGNvbnN0IG1lc3NhZ2UgPSBTdHJpbmcoaXRlbS5jb21taXQ/Lm1lc3NhZ2UgfHwgIldlYnNpdGUgdXBkYXRlIikKICAgICAgLnNwbGl0KC9ccj9cbi8sIDEpWzBdCiAgICAgIC5yZXBsYWNlKC9ccysvZywgIiAiKQogICAgICAudHJpbSgpOwoKICAgIGlmICghaXRlbS5zaGEgfHwgc2Vlbi5oYXMoaXRlbS5zaGEpKSBjb250aW51ZTsKICAgIGlmICgvXmNob3JlXChoaXN0b3J5XCk6IHJlZnJlc2ggcmVhZC1vbmx5IHdlYnNpdGUgdGltZWxpbmUvaS50ZXN0KG1lc3NhZ2UpKSBjb250aW51ZTsKCiAgICBjb25zdCBkYXRlID0gaXRlbS5jb21taXQ/LmF1dGhvcj8uZGF0ZSB8fCBpdGVtLmNvbW1pdD8uY29tbWl0dGVyPy5kYXRlOwogICAgaWYgKCFkYXRlKSBjb250aW51ZTsKCiAgICBzZWVuLmFkZChpdGVtLnNoYSk7CiAgICBjb21taXRzLnB1c2goeyBzaGE6IGl0ZW0uc2hhLCBkYXRlLCBtZXNzYWdlIH0pOwogIH0KCiAgaWYgKGl0ZW1zLmxlbmd0aCA8IDEwMCkgYnJlYWs7CiAgcGFnZSArPSAxOwp9Cgpjb21taXRzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTsKCmNvbnN0IHBheWxvYWQgPSB7CiAgcmVwb3NpdG9yeSwKICBicmFuY2gsCiAgZ2VuZXJhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSwKICBjb21taXRDb3VudDogY29tbWl0cy5sZW5ndGgsCiAgY29tbWl0cwp9OwoKYXdhaXQgbWtkaXIoZGlybmFtZShvdXRwdXRQYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7CmF3YWl0IHdyaXRlRmlsZShvdXRwdXRQYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKX1cbmAsICJ1dGY4Iik7CmNvbnNvbGUubG9nKGBXcm90ZSAke2NvbW1pdHMubGVuZ3RofSBjb21taXRzIHRvICR7b3V0cHV0UGF0aH1gKTsK";

const pageLabels = {
  "index.html": "Home",
  "aboutme.html": "About Deke",
  "build-my-bike.html": "LED Sim Bike",
  "build-my-home.html": "LED Sim Home",
  "contact.html": "Request Install",
  "led-banner-magic.html": "LED Banner Magic",
  "led-catalog.html": "LED Catalog"
};

const pathFor = (relativePath) => resolve(root, relativePath);
const readText = (relativePath) => readFile(pathFor(relativePath), "utf8");
const writeText = (relativePath, content) => writeFile(pathFor(relativePath), content, "utf8");

function addSharedId(tag, id) {
  const cleaned = tag.replace(/\s+id=(['"])[^'"]*\1/i, "");
  return cleaned.replace(/^<([a-z0-9-]+)/i, `<$1 id="${id}"`);
}

function normalizePageSubheader(text, filename, label) {
  text = text.replace(/\s+breadcrumb-ticker--matrix\b/g, "");
  const navPattern = /<nav\b(?=[^>]*\bclass=(['"])[^'"]*\bbreadcrumb-ticker\b[^'"]*\1)[^>]*>/i;

  if (navPattern.test(text)) {
    text = text.replace(navPattern, (tag) => addSharedId(tag, "page-subheader"));
  } else {
    const homeItem = filename === "index.html"
      ? '<li class="breadcrumb-ticker__item"><span aria-current="page">Home</span></li>'
      : '<li class="breadcrumb-ticker__item"><a href="index.html">Home</a></li>';
    const pageItem = filename === "index.html"
      ? ""
      : `\n        <li class="breadcrumb-ticker__item"><span aria-current="page">${label}</span></li>`;
    const subheader = `\n\n  <nav id="page-subheader" class="breadcrumb-ticker" aria-label="Breadcrumb">\n    <div id="page-subheader-row" class="breadcrumb-ticker__rail">\n      <ol id="page-subheader-text" class="breadcrumb-ticker__list">\n        ${homeItem}${pageItem}\n      </ol>\n    </div>\n  </nav>`;
    text = text.replace("</header>", `</header>${subheader}`);
  }

  const rowPattern = /<div\b(?=[^>]*\bclass=(['"])[^'"]*\bbreadcrumb-ticker__rail\b[^'"]*\1)[^>]*>/i;
  const textPattern = /<ol\b(?=[^>]*\bclass=(['"])[^'"]*\bbreadcrumb-ticker__list\b[^'"]*\1)[^>]*>/i;
  text = text.replace(rowPattern, (tag) => addSharedId(tag, "page-subheader-row"));
  text = text.replace(textPattern, (tag) => addSharedId(tag, "page-subheader-text"));

  text = text.replace(/css\/site\.css(?:\?[^"']*)?/g, `css/site.css?v=${release}`);
  text = text.replace(/js\/site-guide\.js(?:\?[^"']*)?/g, `js/site-guide.js?v=${release}`);
  text = text.replace(/css\/site-(navigation|hero|led-matrix|chuck|motion)\.css(?:\?[^"']*)?/g,
    (_match, name) => `css/site-${name}.css?v=${release}`);
  return text;
}

let matrix = await readText("js/site-led-matrix.js");
matrix = matrix.replace(/\n  function collectBreadcrumbText\(ticker\) \{.*?\n  \}\n/s, "\n");
matrix = matrix.replace(/\n  function transformBreadcrumb\(usedEffects, usedPalettes\) \{.*?\n  \}\n/s, "\n");
matrix = matrix.replace("    transformBreadcrumb(usedEffects, usedPalettes);\n", "");
matrix = matrix.replace("      this.role = options.role;\n", "");
matrix = matrix.replace('      this.rows = this.role === "breadcrumb" ? 10 : 11;\n', "      this.rows = 11;\n");
matrix = matrix.replace(
  /      this\.rows = this\.role === "breadcrumb"\n        \? \(this\.width < 560 \? 8 : 10\)\n        : \(this\.width < 560 \? 9 : 11\);/,
  "      this.rows = this.width < 560 ? 9 : 11;"
);
matrix = matrix.replace(
  "  function mountDisplay(canvas, text, mode, palette, role) {\n    if (!canvas || !text) return;\n    const display = new MatrixDisplay(canvas, { text, mode, palette, role });",
  "  function mountDisplay(canvas, text, mode, palette) {\n    if (!canvas || !text) return;\n    const display = new MatrixDisplay(canvas, { text, mode, palette });"
);
matrix = matrix.replace(
  '    mountDisplay(top.canvas, text.top, topMode, pickPalette(topMode, usedPalettes), "hero");',
  "    mountDisplay(top.canvas, text.top, topMode, pickPalette(topMode, usedPalettes));"
);
matrix = matrix.replace(
  '    mountDisplay(bottom.canvas, text.bottom, bottomMode, pickPalette(bottomMode, usedPalettes), "hero");',
  "    mountDisplay(bottom.canvas, text.bottom, bottomMode, pickPalette(bottomMode, usedPalettes));"
);
await writeText("js/site-led-matrix.js", matrix);

let navigation = await readText("css/site-navigation.css");
const temporaryBlockStart = navigation.indexOf("/* Shared body breadcrumb ribbon:");
if (temporaryBlockStart !== -1) {
  const temporaryBlockEnd = navigation.indexOf("@media (prefers-reduced-motion: reduce)", temporaryBlockStart);
  if (temporaryBlockEnd === -1) throw new Error("Could not locate the end of the temporary breadcrumb CSS");
  navigation = `${navigation.slice(0, temporaryBlockStart).trimEnd()}\n\n${navigation.slice(temporaryBlockEnd)}`;
}
await writeText("css/site-navigation.css", navigation);

let site = await readText("css/site.css");
for (const marker of [
  "/* Shared page subheader: centered text and one animated bottom rule. */",
  "/* Shared page subheader: one centered row with one animated bottom rule. */"
]) {
  const markerIndex = site.indexOf(marker);
  if (markerIndex !== -1) site = `${site.slice(0, markerIndex).trimEnd()}\n`;
}

site += `

/* Shared page subheader: centered text and one animated bottom rule. */
#page-subheader {
  position: relative;
  display: grid;
  min-height: 3.15rem;
  place-items: center;
  overflow: hidden;
  background: linear-gradient(90deg, #020611, #0b1c3a 50%, #120b2a, #020611);
}

#page-subheader::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 3px;
  background: linear-gradient(90deg, var(--coral), #ff8a00, var(--amber), var(--pink), var(--violet), var(--cyan), var(--coral));
  background-size: 300% 100%;
  animation: contact-border-flow 6s linear infinite;
}

#page-subheader-row {
  display: flex;
  width: min(100%, 1140px);
  min-height: 3.15rem;
  align-items: center;
  justify-content: center;
  padding: .65rem 1rem .75rem;
}

#page-subheader-text {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: .45rem;
  margin: 0;
  padding: 0;
  list-style: none;
  font: 800 clamp(1rem, 1.2vw, 1.125rem)/1.2 var(--heading-font);
  letter-spacing: .07em;
  text-align: center;
  text-transform: uppercase;
}

#page-subheader-text .breadcrumb-ticker__item {
  display: inline-flex;
  align-items: center;
  gap: .45rem;
}

#page-subheader-text .breadcrumb-ticker__item + .breadcrumb-ticker__item::before {
  content: "›";
  color: var(--amber);
  text-shadow: 0 0 8px rgba(255, 197, 98, .7);
}

#page-subheader-text a,
#page-subheader-text [aria-current="page"] {
  color: #fff3d2;
  background: linear-gradient(180deg, #fff, #fff2bd 34%, #ffc562 58%, #ff7c82 78%, #ff9bd2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 7px rgba(255, 138, 0, .38), 0 0 13px rgba(255, 90, 185, .28);
}

#page-subheader-text a { text-decoration: none; }
#page-subheader-text a:is(:hover, :focus-visible) { filter: brightness(1.2); }

@media (max-width: 575.98px) {
  #page-subheader,
  #page-subheader-row { min-height: 3rem; }
  #page-subheader-row { padding: .58rem .75rem .68rem; }
  #page-subheader-text { font-size: .95rem; letter-spacing: .045em; }
}

@media (prefers-reduced-motion: reduce) {
  #page-subheader::after { animation: none; }
}
`;
await writeText("css/site.css", site);

for (const [filename, label] of Object.entries(pageLabels)) {
  const updated = normalizePageSubheader(await readText(filename), filename, label);
  await writeText(filename, updated);
}

let guide = await readText("js/site-guide.js");
guide = guide.replace(
  /const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/,
  `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`
);
await writeText("js/site-guide.js", guide);

await writeText(
  "robots.txt",
  "User-agent: *\nAllow: /\nDisallow: /.github/\nDisallow: /docs/\n\nSitemap: https://shynetyme.works/sitemap.xml\n"
);
await rm(pathFor(".github/workflows/clean-page-subheader-once.yml"), { force: true });

const checks = {
  "breadcrumb matrix renderer": !matrix.includes("transformBreadcrumb"),
  "breadcrumb text collector": !matrix.includes("collectBreadcrumbText"),
  "breadcrumb role branch": !matrix.includes('"breadcrumb"'),
  "temporary navigation CSS": !navigation.includes("Shared body breadcrumb ribbon"),
  "canonical base CSS": site.includes("Shared page subheader: centered text and one animated bottom rule.")
};
const failedChecks = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
if (failedChecks.length) throw new Error(`Cleanup checks failed: ${failedChecks.join(", ")}`);

for (const filename of Object.keys(pageLabels)) {
  const text = await readText(filename);
  for (const requiredId of ["page-subheader", "page-subheader-row", "page-subheader-text"]) {
    if (!text.includes(`id="${requiredId}"`)) throw new Error(`${filename} is missing #${requiredId}`);
  }
}

await writeText(
  "scripts/build-work-history.mjs",
  Buffer.from(originalScriptBase64, "base64").toString("utf8")
);

await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Clean and centralize shared page subheader"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
