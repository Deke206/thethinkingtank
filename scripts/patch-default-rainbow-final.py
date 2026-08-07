from pathlib import Path

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence.css')

s = js.read_text(encoding='utf-8')

# Base Rainbow is the one fixed Rainbow effect. Old saved `rainbow` recipes map to it.
custom_rainbow = '    { id: "rainbow", label: "Rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },\n'
assert custom_rainbow in s
s = s.replace(custom_rainbow, '', 1)
s = s.replace('{ id: "base-rainbow", label: "Base rainbow",', '{ id: "base-rainbow", label: "Rainbow",', 1)
old_lookup = '  const effectById = (id) => EFFECTS.find((effect) => effect.id === id) || EFFECTS[0];'
assert old_lookup in s
s = s.replace(old_lookup, '  const effectById = (id) => EFFECTS.find((effect) => effect.id === id) || (id === "rainbow" ? EFFECTS.find((effect) => effect.id === "base-rainbow") : EFFECTS[0]);', 1)

# Fixed default Rainbow ignores customer gradient/color/speed/direction edits.
normalize_marker = '''    const effect = effectById(recipe?.effect);\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;'''
assert normalize_marker in s
s = s.replace(normalize_marker, '''    const effect = effectById(recipe?.effect);\n    if (effect.id === "base-rainbow") return defaultRainbowDemoRecipe();\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;''', 1)

# Neutral visual helper. Bike uses the original legacy zone-on Rainbow exactly; Home/Auto use base-rainbow.
clear_marker = '''  function clearDomArea(area) {\n    elementTargets(area).forEach((element) => {'''
assert clear_marker in s
helper = '''  function applyDefaultRainbow(area) {\n    const recipe = defaultRainbowDemoRecipe();\n    if (simulator === "bike") {\n      elementTargets(area).forEach((element) => {\n        delete element.dataset.simAreaActive;\n        delete element.dataset.simEffect;\n        delete element.dataset.simSection;\n        delete element.dataset.simPalette;\n        delete element.dataset.simGradientLength;\n        delete element.dataset.simGradientOwner;\n        element.classList.remove("zone-off");\n        element.classList.add("zone-on");\n        ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction", "--sim-gradient-stroke"].forEach((property) => element.style.removeProperty(property));\n      });\n      return;\n    }\n    if (simulator === "home") {\n      applyHomeArea(area, recipe);\n      return;\n    }\n    applyDomArea(area, recipe);\n  }\n\n'''
s = s.replace(clear_marker, helper + clear_marker, 1)

# Custom Bike effects replace the legacy layer instead of stacking on top of it.
class_block = '''      element.classList.add("zone-on");\n      element.classList.remove("zone-off");'''
assert class_block in s
s = s.replace(class_block, '''      if (simulator === "bike") {\n        element.classList.remove("zone-on", "zone-off");\n      } else {\n        element.classList.add("zone-on");\n        element.classList.remove("zone-off");\n      }''', 1)

inactive_block = '''    if (!area.active) {\n      if (simulator === "home") clearHomeArea(area);\n      else clearDomArea(area);\n      area.currentStep = -1;\n      return;\n    }'''
assert inactive_block in s
s = s.replace(inactive_block, '''    if (!area.active) {\n      applyDefaultRainbow(area);\n      area.currentStep = -1;\n      return;\n    }''', 1)

s = s.replace('''        : "Off";''', '''        : "Default rainbow";''', 1)

# Base Rainbow has no customer gradient/color/speed/direction options.
s = s.replace('<label class="sim-field" id="simPaletteModeWrap">Color use', '<label class="sim-field" id="simPaletteModeWrap"${editorRecipe.effect === "base-rainbow" ? " hidden" : ""}>Color use', 1)
s = s.replace('<label class="sim-field sim-color-field" id="simColor1Wrap">Primary', '<label class="sim-field sim-color-field" id="simColor1Wrap"${editorRecipe.effect === "base-rainbow" ? " hidden" : ""}>Primary', 1)
s = s.replace('${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second', '${editorRecipe.paletteMode === "single" || editorRecipe.effect === "base-rainbow" ? " hidden" : ""}>Foreground / second', 1)
s = s.replace('${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third', '${editorRecipe.paletteMode !== "gradient" || editorRecipe.effect === "base-rainbow" ? " hidden" : ""}>Background / third', 1)
s = s.replace('id="simSpeedWrap"${effect.speed ? "" : " hidden"}', 'id="simSpeedWrap"${effect.speed && effect.id !== "base-rainbow" ? "" : " hidden"}', 1)
s = s.replace('id="simDirectionWrap"${effect.directional ? "" : " hidden"}', 'id="simDirectionWrap"${effect.directional && effect.id !== "base-rainbow" ? "" : " hidden"}', 1)

visibility = '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";'''
assert visibility in s
s = s.replace(visibility, '''    const isBaseRainbow = effect.id === "base-rainbow";\n    if (isBaseRainbow) {\n      editorRecipe = defaultRainbowDemoRecipe();\n      const palette = root.querySelector("#simPaletteMode");\n      if (palette) palette.value = "gradient";\n    }\n    if (speedWrap) speedWrap.hidden = !effect.speed || isBaseRainbow;\n    if (directionWrap) directionWrap.hidden = !effect.directional || isBaseRainbow;\n    if (paletteWrap) paletteWrap.hidden = isBaseRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient" || isBaseRainbow;\n    if (color1Wrap) color1Wrap.hidden = isBaseRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isBaseRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isBaseRainbow;''', 1)

# Invalidate the old visual snapshot once; saved presets are separate.
s = s.replace('if (stored?.version !== 2 || stored.simulator !== simulator) return;', 'if (stored?.version !== 3 || stored.simulator !== simulator) return;', 1)
s = s.replace('version: 2,', 'version: 3,', 1)

# Default Rainbow is visible on all pages, but it does not mark areas active/selected or enter the quote payload.
init_old = '''    areas.forEach((area) => {\n      if (!area.active) {\n        if (simulator === "home") clearHomeArea(area);\n        else clearDomArea(area);\n      }\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => { if (!area.active) clearHomeArea(area); });\n      }, 350);\n    }\n    areas.forEach((area) => {\n      if (!area.active) return;\n      area.startedAt = performance.now();\n      applyAreaRecipe(area, area.program[0]);\n    });'''
assert init_old in s
s = s.replace(init_old, '''    areas.forEach((area) => {\n      area.selected = false;\n      area.startedAt = performance.now();\n      if (area.active) applyAreaRecipe(area, area.program[0]);\n      else applyDefaultRainbow(area);\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => {\n          area.currentStep = -1;\n          if (area.active) applyAreaRecipe(area, area.program[0]);\n          else applyDefaultRainbow(area);\n        });\n      }, 350);\n    }''', 1)

js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
haze_marker = '''[data-sim-area-active="true"][data-sim-palette="gradient"] {\n  stroke: var(--sim-gradient-stroke, var(--sim-a, #35e7ff)) !important;\n}'''
assert haze_marker in c
c = c.replace(haze_marker, '''/* Custom Bike effects must not inherit the legacy zone-on translucent fill haze. */\n.sim-area-bike [data-sim-area-active="true"] {\n  fill: none !important;\n}\n\n''' + haze_marker, 1)
css.write_text(c, encoding='utf-8')
