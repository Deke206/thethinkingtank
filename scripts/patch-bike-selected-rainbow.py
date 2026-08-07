from pathlib import Path
import re

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence.css')
html = Path('build-my-bike.html')

s = js.read_text(encoding='utf-8')

# Selected primary/secondary/third colors stay authoritative for Rainbow.
needle = '    if (recipe.effect === "rainbow") return [RAINBOW_COLORS[0], RAINBOW_COLORS[3], RAINBOW_COLORS[6]];\n'
assert needle in s
s = s.replace(needle, '', 1)

old_stops = '''    const stops = recipe.effect === "rainbow"\n      ? RAINBOW_COLORS.map((color, index) => [index / (RAINBOW_COLORS.length - 1), color])\n      : [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];'''
assert old_stops in s
s = s.replace(old_stops, '    const stops = [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];', 1)

# Rainbow uses the normal three-color gradient editor plus gradient length, speed, and direction.
s = s.replace('<label class="sim-field" id="simPaletteModeWrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Color use', '<label class="sim-field" id="simPaletteModeWrap">Color use', 1)
s = s.replace('<label class="sim-field sim-color-field" id="simColor1Wrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Primary', '<label class="sim-field sim-color-field" id="simColor1Wrap">Primary', 1)
s = s.replace('${editorRecipe.paletteMode === "single" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Foreground / second', '${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second', 1)
s = s.replace('${editorRecipe.paletteMode !== "gradient" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Background / third', '${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third', 1)
s = s.replace('id="simSpeedWrap"${effect.speed && effect.id !== "rainbow" ? "" : " hidden"}', 'id="simSpeedWrap"${effect.speed ? "" : " hidden"}', 1)
s = s.replace('id="simDirectionWrap"${effect.directional && effect.id !== "rainbow" ? "" : " hidden"}', 'id="simDirectionWrap"${effect.directional ? "" : " hidden"}', 1)

old_visibility = '''    const isRainbow = effect.id === "rainbow";\n    if (isRainbow) {\n      editorRecipe.paletteMode = "gradient";\n      editorRecipe.colors = [RAINBOW_COLORS[0], RAINBOW_COLORS[3], RAINBOW_COLORS[6]];\n    }\n    if (speedWrap) speedWrap.hidden = !effect.speed || isRainbow;\n    if (directionWrap) directionWrap.hidden = !effect.directional || isRainbow;\n    if (paletteWrap) paletteWrap.hidden = isRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = isRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;'''
assert old_visibility in s
s = s.replace(old_visibility, '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";''', 1)

# Bike opens with every LED area off; saved presets remain available from the separate shared preset key.
load_marker = '''      const stored = JSON.parse(localStorage.getItem(ASSIGNMENT_KEY));\n      if (stored?.version !== 2 || stored.simulator !== simulator) return;'''
assert load_marker in s
s = s.replace(load_marker, load_marker + '\n      if (simulator === "bike") return;', 1)
js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
c = c.replace('content: "LED BIKE SIM";', 'content: "LED Bike Sim";', 1)
c = c.replace('grid-template-columns: repeat(auto-fit, 112px);', 'grid-template-columns: repeat(auto-fit, 102px);', 1)
c = c.replace('width: 112px;\n  height: 86px;', 'width: 102px;\n  height: 76px;', 1)
c = c.replace('''@media (max-width: 760px) {\n  .sim-area-bike .sim-area-grid { grid-template-columns: repeat(auto-fit, 102px); }\n  .sim-area-bike .sim-area-button { width: 102px; height: 80px; }\n}''', '''@media (max-width: 760px) {\n  .sim-area-bike .sim-area-grid { grid-template-columns: repeat(auto-fit, 96px); }\n  .sim-area-bike .sim-area-button { width: 96px; height: 74px; }\n}''', 1)
c = c.replace('''@media (max-width: 430px) {\n  .sim-area-bike .sim-area-grid { grid-template-columns: repeat(auto-fit, 94px); }\n  .sim-area-bike .sim-area-button { width: 94px; height: 76px; }\n}''', '''@media (max-width: 430px) {\n  .sim-area-bike .sim-area-grid { grid-template-columns: repeat(auto-fit, 90px); }\n  .sim-area-bike .sim-area-button { width: 90px; height: 70px; }\n}''', 1)
css.write_text(c, encoding='utf-8')

h = html.read_text(encoding='utf-8')
assert '<span aria-current="page">LED SIM BIKE</span>' in h
h = h.replace('<span aria-current="page">LED SIM BIKE</span>', '<span aria-current="page">LED Bike Sim</span>', 1)
html.write_text(h, encoding='utf-8')
