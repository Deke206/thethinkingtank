from pathlib import Path

js = Path('js/sim-node-sequence.js')
base_css = Path('css/sim-node-sequence-base.css')
bike_css = Path('css/sim-node-sequence.css')
html = Path('build-my-bike.html')

s = js.read_text(encoding='utf-8')

marker = '''  const SECTIONS = Object.freeze([\n    ["whole", "All LEDs"],\n    ["first-half", "First half"],\n    ["second-half", "Second half"],\n    ["first-third", "First third"],\n    ["middle-third", "Middle third"],\n    ["last-third", "Last third"]\n  ]);\n'''
assert marker in s
s = s.replace(marker, marker + '''\n  const GRADIENT_LENGTHS = Object.freeze([\n    ["quarter", "Quarter of the LEDs"],\n    ["half", "Half of the LEDs"],\n    ["three-quarter", "Three-quarters of the LEDs"],\n    ["whole", "Whole LED run"]\n  ]);\n''', 1)

s = s.replace('''      direction: 1,\n      duration: DEFAULT_STEP_SECONDS''', '''      direction: 1,\n      gradientLength: "whole",\n      duration: DEFAULT_STEP_SECONDS''', 1)
s = s.replace('''      direction: Number(recipe?.direction) < 0 ? -1 : 1,\n      duration: DEFAULT_STEP_SECONDS''', '''      direction: Number(recipe?.direction) < 0 ? -1 : 1,\n      gradientLength: GRADIENT_LENGTHS.some(([id]) => id === recipe?.gradientLength) ? recipe.gradientLength : "whole",\n      duration: DEFAULT_STEP_SECONDS''', 1)

section_fn = '''  function sectionOptions(selectedId) {\n    return SECTIONS.map(([id, label]) => `<option value="${id}"${id === selectedId ? " selected" : ""}>${safeText(label)}</option>`).join("");\n  }\n'''
assert section_fn in s
s = s.replace(section_fn, section_fn + '''\n  function gradientLengthOptions(selectedId) {\n    return GRADIENT_LENGTHS.map(([id, label]) => `<option value="${id}"${id === selectedId ? " selected" : ""}>${safeText(label)}</option>`).join("");\n  }\n''', 1)

old_preview = '''          <div class="sim-effect-preview" id="simEffectPreview" style="--preview-a:${editorRecipe.colors[0]};--preview-b:${editorRecipe.colors[1]};--preview-c:${editorRecipe.colors[2]}">\n            <span>${safeText(effect.label)}</span>\n          </div>'''
assert old_preview in s
s = s.replace(old_preview, '''          <label class="sim-field sim-gradient-length" id="simGradientLengthWrap"${editorRecipe.paletteMode === "gradient" ? "" : " hidden"}>Gradient length\n            <select id="simGradientLength">${gradientLengthOptions(editorRecipe.gradientLength)}</select>\n          </label>\n          <div class="sim-gradient-strip" id="simGradientStrip" style="--preview-a:${editorRecipe.colors[0]};--preview-b:${editorRecipe.colors[1]};--preview-c:${editorRecipe.colors[2]}" aria-label="Primary, secondary, and third gradient colors"></div>''', 1)

s = s.replace('''      direction: root.querySelector("#simDirection")?.value\n    });''', '''      direction: root.querySelector("#simDirection")?.value,\n      gradientLength: root.querySelector("#simGradientLength")?.value || editorRecipe.gradientLength\n    });''', 1)

old_preview_update = '''    const preview = root.querySelector("#simEffectPreview");\n    if (preview) {\n      preview.style.setProperty("--preview-a", editorRecipe.colors[0]);\n      preview.style.setProperty("--preview-b", editorRecipe.colors[1]);\n      preview.style.setProperty("--preview-c", editorRecipe.colors[2]);\n      preview.querySelector("span").textContent = effect.label;\n    }'''
assert old_preview_update in s
s = s.replace(old_preview_update, '''    const gradientWrap = root.querySelector("#simGradientLengthWrap");\n    const gradientStrip = root.querySelector("#simGradientStrip");\n    if (gradientWrap) gradientWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (gradientStrip) {\n      gradientStrip.hidden = editorRecipe.paletteMode !== "gradient";\n      gradientStrip.style.setProperty("--preview-a", editorRecipe.colors[0]);\n      gradientStrip.style.setProperty("--preview-b", editorRecipe.colors[1]);\n      gradientStrip.style.setProperty("--preview-c", editorRecipe.colors[2]);\n    }''', 1)

s = s.replace('''["simEffectType", "simEffectSection", "simPaletteMode", "simDirection"]''', '''["simEffectType", "simEffectSection", "simPaletteMode", "simDirection", "simGradientLength"]''', 1)
s = s.replace('''      element.dataset.simSection = recipe.section;\n      element.classList.add("zone-on");''', '''      element.dataset.simSection = recipe.section;\n      element.dataset.simGradientLength = recipe.gradientLength;\n      element.classList.add("zone-on");''', 1)
s = s.replace('''      delete element.dataset.simSection;\n      element.classList.remove("zone-on");''', '''      delete element.dataset.simSection;\n      delete element.dataset.simGradientLength;\n      element.classList.remove("zone-on");''', 1)

load_marker = '''      const stored = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY));\n      if (stored?.version !== 1 || stored.simulator !== simulator) return;'''
assert load_marker in s
s = s.replace(load_marker, load_marker + '''\n      if (simulator === "bike") return;''', 1)

init_old = '''    areas.forEach((area) => {\n      if (!area.active) return;\n      area.startedAt = performance.now();\n      applyAreaRecipe(area, area.program[0]);\n    });'''
assert init_old in s
s = s.replace(init_old, '''    areas.forEach((area) => {\n      area.startedAt = performance.now();\n      if (area.active) applyAreaRecipe(area, area.program[0]);\n      else if (simulator === "home") clearHomeArea(area);\n      else clearDomArea(area);\n    });''', 1)

prep_marker = '''  function preparePage() {\n    document.body.classList.add("sim-area-mode", `sim-area-${simulator}`);'''
assert prep_marker in s
s = s.replace(prep_marker, prep_marker + '''\n    if (simulator === "bike") {\n      const tagline = document.querySelector("#page-subheader-text [aria-current='page']");\n      if (tagline) tagline.textContent = "LED Bike Sim";\n    }''', 1)
js.write_text(s, encoding='utf-8')

c = base_css.read_text(encoding='utf-8')
old_css_preview = '''.sim-effect-preview {\n  grid-column: span 2;\n  display: grid;\n  min-height: 4.2rem;\n  place-items: center;\n  border: 1px solid rgba(255, 255, 255, .15);\n  border-radius: .7rem;\n  color: #fff;\n  background: linear-gradient(110deg, var(--preview-a), var(--preview-b), var(--preview-c));\n  box-shadow: inset 0 0 2rem rgba(0, 0, 0, .35);\n  font: 800 .78rem Oxanium, sans-serif;\n  text-shadow: 0 2px 7px #000;\n}\n'''
assert old_css_preview in c
c = c.replace(old_css_preview, '''.sim-gradient-strip {\n  grid-column: span 2;\n  min-height: 2.35rem;\n  border: 1px solid rgba(255, 255, 255, .15);\n  border-radius: .55rem;\n  background: linear-gradient(90deg, var(--preview-a) 0 33.33%, var(--preview-b) 33.33% 66.66%, var(--preview-c) 66.66% 100%);\n  box-shadow: inset 0 0 1rem rgba(0, 0, 0, .22);\n}\n''', 1)

keyframe_marker = '@keyframes sim-area-solid'
assert keyframe_marker in c
c = c.replace(keyframe_marker, '''[data-sim-area-active="true"][data-sim-gradient-length="quarter"][data-sim-effect="rainbow"] { stroke-dasharray: 4 3 !important; }\n[data-sim-area-active="true"][data-sim-gradient-length="half"][data-sim-effect="rainbow"] { stroke-dasharray: 8 5 !important; }\n[data-sim-area-active="true"][data-sim-gradient-length="three-quarter"][data-sim-effect="rainbow"] { stroke-dasharray: 12 7 !important; }\n[data-sim-area-active="true"][data-sim-gradient-length="whole"][data-sim-effect="rainbow"] { stroke-dasharray: 18 10 !important; }\n\n''' + keyframe_marker, 1)
c = c.replace('''.sim-field--wide,\n  .sim-effect-preview { grid-column: 1 / -1; }''', '''.sim-field--wide,\n  .sim-gradient-strip { grid-column: 1 / -1; }''', 1)
base_css.write_text(c, encoding='utf-8')

b = bike_css.read_text(encoding='utf-8')
b = b.replace('content: "LED BIKE SIM";', 'content: "LED Bike Sim";', 1)
b = b.replace('repeat(5, minmax(0, 140px))', 'repeat(5, minmax(0, 118px))', 1)
b = b.replace('width: 140px;', 'width: 118px;\n  height: 84px;\n  aspect-ratio: auto;', 1)
b = b.replace('repeat(4, minmax(0, 132px))', 'repeat(4, minmax(0, 112px))', 1)
b = b.replace('width: 132px;', 'width: 112px;\n    height: 82px;', 1)
b = b.replace('repeat(2, minmax(0, 128px))', 'repeat(2, minmax(0, 108px))', 1)
b = b.replace('width: 128px;', 'width: 108px;\n    height: 80px;', 1)
bike_css.write_text(b, encoding='utf-8')

h = html.read_text(encoding='utf-8')
if '<span aria-current="page">LED SIM BIKE</span>' in h:
    h = h.replace('<span aria-current="page">LED SIM BIKE</span>', '<span aria-current="page">LED Bike Sim</span>', 1)
html.write_text(h, encoding='utf-8')
