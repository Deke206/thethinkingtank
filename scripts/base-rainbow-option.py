from pathlib import Path
import re

p = Path('js/sim-node-sequence.js')
s = p.read_text(encoding='utf-8')

rainbow_effect = '    { id: "rainbow", label: "Rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },\n'
assert rainbow_effect in s
s = s.replace(rainbow_effect, rainbow_effect + '    { id: "base-rainbow", label: "Base rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },\n', 1)

stops = '    const stops = [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];'
assert stops in s
s = s.replace(stops, '''    const stops = recipe.effect === "base-rainbow"\n      ? RAINBOW_COLORS.map((color, index) => [index / (RAINBOW_COLORS.length - 1), color])\n      : [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];''', 1)

needle = '    if (speedWrap) speedWrap.hidden = !effect.speed;\n'
assert needle in s
s = s.replace(needle, '    const isBaseRainbow = effect.id === "base-rainbow";\n    if (isBaseRainbow) editorRecipe.paletteMode = "gradient";\n' + needle, 1)
s = s.replace('    if (paletteWrap) paletteWrap.hidden = false;', '    if (paletteWrap) paletteWrap.hidden = isBaseRainbow;', 1)
s = s.replace('    if (color1Wrap) color1Wrap.hidden = false;', '    if (color1Wrap) color1Wrap.hidden = isBaseRainbow;', 1)
s = s.replace('    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";', '    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isBaseRainbow;', 1)
s = s.replace('    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";', '    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isBaseRainbow;', 1)

# Remove the concurrent showroom-default behavior: Base Rainbow is an effect choice, not an automatic power-on state.
s, count = re.subn(r'\n  function defaultRainbowDemoRecipe\(\) \{.*?\n  \}\n', '\n', s, count=1, flags=re.S)
assert count == 1, 'Default rainbow demo helper not found'

start = s.index('  function initialize() {')
end = s.index('\n  if (document.readyState === "loading")', start)
old = s[start:end]
new = '''  function initialize() {\n    loadState();\n    preparePage();\n    areas.forEach((area) => {\n      if (!area.active) {\n        if (simulator === "home") clearHomeArea(area);\n        else clearDomArea(area);\n      }\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => { if (!area.active) clearHomeArea(area); });\n      }, 350);\n    }\n    areas.forEach((area) => {\n      if (!area.active) return;\n      area.startedAt = performance.now();\n      applyAreaRecipe(area, area.program[0]);\n    });\n    window.setInterval(tick, 120);\n    window.ShynetymeAreaEffects = {\n      initialized: true,\n      simulator,\n      areas,\n      effects: EFFECTS,\n      get savedPresets() { return savedPresets; },\n      get sequencePresetIds() { return sequencePresetIds; },\n      apply: applyToSelectedAreas,\n      reset() {\n        localStorage.removeItem(ASSIGNMENT_KEY);\n        window.location.reload();\n      }\n    };\n    window.ShynetymeNodeSequence = window.ShynetymeAreaEffects;\n  }\n'''
s = s[:start] + new + s[end:]

p.write_text(s, encoding='utf-8')
