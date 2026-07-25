import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = process.cwd();
const release = "shared-ui-5";
const originalScriptBase64 = "aW1wb3J0IHsgbWtkaXIsIHdyaXRlRmlsZSB9IGZyb20gIm5vZGU6ZnMvcHJvbWlzZXMiOwppbXBvcnQgeyBkaXJuYW1lLCByZXNvbHZlIH0gZnJvbSAibm9kZTpwYXRoIjsKCmNvbnN0IHJlcG9zaXRvcnkgPSBwcm9jZXNzLmVudi5XT1JLX0hJU1RPUllfUkVQT1NJVE9SWSB8fCBwcm9jZXNzLmVudi5HSVRIVUJfUkVQT1NJVE9SWSB8fCAiRGVrZTIwNi90aGV0aGlua2luZ3RhbmsiOwpjb25zdCBicmFuY2ggPSBwcm9jZXNzLmVudi5XT1JLX0hJU1RPUllfQlJBTkNIIHx8ICJtYWluIjsKY29uc3QgdG9rZW4gPSBwcm9jZXNzLmVudi5HSVRIVUJfVE9LRU4gfHwgIiI7CmNvbnN0IG91dHB1dFBhdGggPSByZXNvbHZlKHByb2Nlc3MuY3dkKCksIHByb2Nlc3MuZW52LldPUktfSElTVE9SWV9PVVRQVVQgfHwgImRhdGEvd29yay1oaXN0b3J5Lmpzb24iKTsKY29uc3QgW293bmVyLCByZXBvXSA9IHJlcG9zaXRvcnkuc3BsaXQoIi8iKTsKCmlmICghb3duZXIgfHwgIXJlcG8pIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCByZXBvc2l0b3J5IG5hbWU6ICR7cmVwb3NpdG9yeX1gKTsKCmNvbnN0IGhlYWRlcnMgPSB7CiAgQWNjZXB0OiAiYXBwbGljYXRpb24vdm5kLmdpdGh1Yitqc29uIiwKICAiVXNlci1BZ2VudCI6ICJzaHluZXR5bWUtd29yay1oaXN0b3J5LWdlbmVyYXRvciIsCiAgIlgtR2l0SHViLUFwaS1WZXJzaW9uIjogIjIwMjItMTEtMjgiCn07CgppZiAodG9rZW4pIGhlYWRlcnMuQXV0aG9yaXphdGlvbiA9IGBCZWFyZXIgJHt0b2tlbn1gOwoKY29uc3QgY29tbWl0cyA9IFtdOwpjb25zdCBzZWVuID0gbmV3IFNldCgpOwpsZXQgcGFnZSA9IDE7Cgp3aGlsZSAocGFnZSA8PSAyMCkgewogIGNvbnN0IHVybCA9IG5ldyBVUkwoYGh0dHBzOi8vYXBpLmdpdGh1Yi5jb20vcmVwb3MvJHtvd25lcn0vJHtyZXBvfS9jb21taXRzYCk7CiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoInNoYSIsIGJyYW5jaCk7CiAgdXJsLnNlYXJjaFBhcmFtcy5zZXQoInBlcl9wYWdlIiwgIjEwMCIpOwogIHVybC5zZWFyY2hQYXJhbXMuc2V0KCJwYWdlIiwgU3RyaW5nKHBhZ2UpKTsKCiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwsIHsgaGVhZGVycyB9KTsKICBpZiAoIXJlc3BvbnNlLm9rKSB7CiAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpOwogICAgdGhyb3cgbmV3IEVycm9yKGBHaXRIdWIgQVBJICR7cmVzcG9uc2Uuc3RhdHVzfTogJHtib2R5LnNsaWNlKDAsIDMwMCl9YCk7CiAgfQoKICBjb25zdCBpdGVtcyA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTsKICBpZiAoIUFycmF5LmlzQXJyYXkoaXRlbXMpIHx8ICFpdGVtcy5sZW5ndGgpIGJyZWFrOwoKICBmb3IgKGNvbnN0IGl0ZW0gb2YgaXRlbXMpIHsKICAgIGNvbnN0IG1lc3NhZ2UgPSBTdHJpbmcoaXRlbS5jb21taXQ/Lm1lc3NhZ2UgfHwgIldlYnNpdGUgdXBkYXRlIikKICAgICAgLnNwbGl0KC9ccj9cbi8sIDEpWzBdCiAgICAgIC5yZXBsYWNlKC9ccysvZywgIiAiKQogICAgICAudHJpbSgpOwoKICAgIGlmICghaXRlbS5zaGEgfHwgc2Vlbi5oYXMoaXRlbS5zaGEpKSBjb250aW51ZTsKICAgIGlmICgvXmNob3JlXChoaXN0b3J5XCk6IHJlZnJlc2ggcmVhZC1vbmx5IHdlYnNpdGUgdGltZWxpbmUvaS50ZXN0KG1lc3NhZ2UpKSBjb250aW51ZTsKCiAgICBjb25zdCBkYXRlID0gaXRlbS5jb21taXQ/LmF1dGhvcj8uZGF0ZSB8fCBpdGVtLmNvbW1pdD8uY29tbWl0dGVyPy5kYXRlOwogICAgaWYgKCFkYXRlKSBjb250aW51ZTsKCiAgICBzZWVuLmFkZChpdGVtLnNoYSk7CiAgICBjb21taXRzLnB1c2goeyBzaGE6IGl0ZW0uc2hhLCBkYXRlLCBtZXNzYWdlIH0pOwogIH0KCiAgaWYgKGl0ZW1zLmxlbmd0aCA8IDEwMCkgYnJlYWs7CiAgcGFnZSArPSAxOwp9Cgpjb21taXRzLnNvcnQoKGEsIGIpID0+IG5ldyBEYXRlKGEuZGF0ZSkgLSBuZXcgRGF0ZShiLmRhdGUpKTsKCmNvbnN0IHBheWxvYWQgPSB7CiAgcmVwb3NpdG9yeSwKICBicmFuY2gsCiAgZ2VuZXJhdGVkQXQ6IG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKSwKICBjb21taXRDb3VudDogY29tbWl0cy5sZW5ndGgsCiAgY29tbWl0cwp9OwoKYXdhaXQgbWtkaXIoZGlybmFtZShvdXRwdXRQYXRoKSwgeyByZWN1cnNpdmU6IHRydWUgfSk7CmF3YWl0IHdyaXRlRmlsZShvdXRwdXRQYXRoLCBgJHtKU09OLnN0cmluZ2lmeShwYXlsb2FkLCBudWxsLCAyKX1cbmAsICJ1dGY4Iik7CmNvbnNvbGUubG9nKGBXcm90ZSAke2NvbW1pdHMubGVuZ3RofSBjb21taXRzIHRvICR7b3V0cHV0UGF0aH1gKTsK";
const pages = ["index.html", "aboutme.html", "build-my-bike.html", "build-my-home.html", "contact.html", "led-banner-magic.html", "led-catalog.html"];
const pathFor = (relativePath) => resolve(root, relativePath);
const readText = (relativePath) => readFile(pathFor(relativePath), "utf8");
const writeText = (relativePath, content) => writeFile(pathFor(relativePath), content, "utf8");

let site = await readText("css/site.css");
const marker = "/* Shared page subheader:";
const start = site.indexOf(marker);
if (start === -1) throw new Error("Shared page subheader block was not found");
site = `${site.slice(0, start).trimEnd()}\n\n/* Shared page subheader. */
#page-subheader {
  position: relative;
  background: linear-gradient(90deg, #020611, #0b1c3a 50%, #120b2a, #020611);
}

#page-subheader::after {
  content: "";
  position: absolute;
  inset: auto 0 0;
  height: 3px;
  background: linear-gradient(90deg, var(--coral), #ff8a00, var(--amber), var(--pink), var(--violet), var(--cyan), var(--coral));
  background-size: 300% 100%;
  animation: page-subheader-border-flow 6s linear infinite;
}

#page-subheader-row {
  max-width: 1140px;
  margin: auto;
  padding: .72rem 1rem .82rem;
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

.page-subheader-item { display: flex; align-items: center; gap: .45rem; }
.page-subheader-item + .page-subheader-item::before {
  content: "›";
  color: var(--amber);
  text-shadow: 0 0 8px rgba(255, 197, 98, .7);
}

#page-subheader-text :is(a, [aria-current="page"]) {
  color: #fff3d2;
  background: linear-gradient(180deg, #fff, #fff2bd 34%, #ffc562 58%, #ff7c82 78%, #ff9bd2);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 0 7px rgba(255, 138, 0, .38), 0 0 13px rgba(255, 90, 185, .28);
}

#page-subheader-text a { text-decoration: none; }
@keyframes page-subheader-border-flow { to { background-position: 300% 0; } }

@media (max-width: 575.98px) {
  #page-subheader-row { padding: .62rem .75rem .72rem; }
  #page-subheader-text { font-size: .95rem; letter-spacing: .045em; }
}

@media (prefers-reduced-motion: reduce) {
  #page-subheader::after { animation: none; }
}
`;
await writeText("css/site.css", site);

for (const filename of pages) {
  let text = await readText(filename);
  text = text.replace(/css\/site\.css(?:\?[^"']*)?/g, `css/site.css?v=${release}`);
  text = text.replace(/js\/site-guide\.js(?:\?[^"']*)?/g, `js/site-guide.js?v=${release}`);
  text = text.replace(/css\/site-(navigation|hero|led-matrix|chuck|motion)\.css(?:\?[^"']*)?/g,
    (_match, name) => `css/site-${name}.css?v=${release}`);
  await writeText(filename, text);
}

let guide = await readText("js/site-guide.js");
guide = guide.replace(
  /const sharedRevision = scriptUrl\.searchParams\.get\("v"\) \|\| "[^"]+";/,
  `const sharedRevision = scriptUrl.searchParams.get("v") || "${release}";`
);
await writeText("js/site-guide.js", guide);

if (!site.includes("@keyframes page-subheader-border-flow")) throw new Error("Subheader border animation is missing");
if (site.includes("contact-border-flow 6s")) throw new Error("Subheader still depends on the contact animation");

await writeText("scripts/build-work-history.mjs", Buffer.from(originalScriptBase64, "base64").toString("utf8"));
await execFileAsync("git", ["config", "user.name", "github-actions[bot]"], { cwd: root });
await execFileAsync("git", ["config", "user.email", "41898282+github-actions[bot]@users.noreply.github.com"], { cwd: root });
await execFileAsync("git", ["add", "-A"], { cwd: root });
await execFileAsync("git", ["commit", "-m", "Simplify shared page subheader styling"], { cwd: root });
await execFileAsync("git", ["push"], { cwd: root });
