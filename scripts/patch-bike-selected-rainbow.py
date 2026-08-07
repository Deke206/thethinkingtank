from pathlib import Path

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence.css')
html = Path('build-my-bike.html')

s = js.read_text(encoding='utf-8')

# Rainbow must use the customer's selected three colors instead of a fixed rainbow palette.
fixed_normalize = '''    if (effect.id === "rainbow") {\n      return {\n        effect: effect.id,\n        section: SECTIONS.some(([id]) => id === recipe?.section) ? recipe.section : "whole",\n        gradientLength: GRADIENT_LENGTHS.some(([id]) => id === recipe?.gradientLength) ? recipe.gradientLength : "whole",\n        paletteMode: "gradient",\n        colors: [...RAINBOW_COLORS],\n        brightness: Math.min(100, Math.max(5, Number(recipe?.brightness) || fallback.brightness)),\n        speed: 55,\n        direction: 1,\n        duration: DEFAULT_STEP_SECONDS\n      };\n    }\n'''
assert fixed_normalize in s
s = s.replace(fixed_normalize, '', 1)

fixed_apply = '''    const rainbowPalette = recipe.effect === "rainbow" ? [...RAINBOW_COLORS] : null;\n    const colors = rainbowPalette || normalizedColors(recipe);\n    const gradientUrl = buildSvgGradient(area, recipe, rainbowPalette);'''
assert fixed_apply in s
s = s.replace(fixed_apply, '''    const colors = normalizedColors(recipe);\n    const gradientUrl = buildSvgGradient(area, recipe, colors);''', 1)

# Rainbow keeps the same normal three-color editor, gradient length, speed, and direction controls.
s = s.replace('''<label class="sim-field" id="simPaletteModeWrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Color use''', '''<label class="sim-field" id="simPaletteModeWrap">Color use''', 1)
s = s.replace('''<label class="sim-field sim-color-field" id="simColor1Wrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Primary''', '''<label class="sim-field sim-color-field" id="simColor1Wrap">Primary''', 1)
s = s.replace('''${editorRecipe.paletteMode === "single" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Foreground / second''', '''${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second''', 1)
s = s.replace('''${editorRecipe.paletteMode !== "gradient" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Background / third''', '''${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third''', 1)
s = s.replace('''id="simSpeedWrap"${effect.speed && effect.id !== "rainbow" ? "" : " hidden"}''', '''id="simSpeedWrap"${effect.speed ? "" : " hidden"}''', 1)
s = s.replace('''id="simDirectionWrap"${effect.directional && effect.id !== "rainbow" ? "" : " hidden"}''', '''id="simDirectionWrap"${effect.directional ? "" : " hidden"}''', 1)

old_visibility = '''    const isRainbow = effect.id === "rainbow";\n    if (isRainbow) {\n      editorRecipe.paletteMode = "gradient";\n      editorRecipe.colors = [RAINBOW_COLORS[0], RAINBOW_COLORS[3], RAINBOW_COLORS[6]];\n    }\n    if (speedWrap) speedWrap.hidden = !effect.speed || isRainbow;\n    if (directionWrap) directionWrap.hidden = !effect.directional || isRainbow;\n    if (paletteWrap) paletteWrap.hidden = isRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = isRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;'''
assert old_visibility in s
s = s.replace(old_visibility, '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";''', 1)

# Bike always opens with installation areas off; saved effect recipes remain available.
load_marker = '''      const stored = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY));\n      if (stored?.version !== 2 || stored.simulator !== simulator) return;'''
assert load_marker in s
s = s.replace(load_marker, load_marker + '''\n      if (simulator === "bike") return;''', 1)

js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
c = c.replace('content: "LED BIKE SIM";', 'content: "LED Bike Sim";', 1)
c = c.replace('grid-template-columns: repeat(auto-fit, 112px);', 'grid-template-columns: repeat(auto-fit, 102px);', 1)
c = c.replace('width: 112px;\n  height: 86px;', 'width: 102px;\n  height: 76px;', 1)
c = c.replace('grid-template-columns: repeat(auto-fit, 102px);', 'grid-template-columns: repeat(auto-fit, 96px);', 1)
c = c.replace('width: 102px; height: 80px;', 'width: 96px; height: 74px;', 1)
c = c.replace('grid-template-columns: repeat(auto-fit, 94px);', 'grid-template-columns: repeat(auto-fit, 90px);', 1)
c = c.replace('width: 94px; height: 76px;', 'width: 90px; height: 70px;', 1)
css.write_text(c, encoding='utf-8')

h = html.read_text(encoding='utf-8')
assert '<span aria-current="page">LED SIM BIKE</span>' in h
h = h.replace('<span aria-current="page">LED SIM BIKE</span>', '<span aria-current="page">LED Bike Sim</span>', 1)
html.write_text(h, encoding='utf-8')
