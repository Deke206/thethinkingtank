from pathlib import Path

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence.css')

s = js.read_text(encoding='utf-8')

# Rainbow is a fixed base/default recipe again, not a customer-editable gradient recipe.
normalize_marker = '''    const effect = effectById(recipe?.effect);\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;'''
assert normalize_marker in s
s = s.replace(normalize_marker, '''    const effect = effectById(recipe?.effect);\n    if (effect.id === "rainbow") return defaultRainbowDemoRecipe();\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;''', 1)

# Neutral/default visual helper. Bike uses the original legacy zone-on Rainbow; Home/Auto use the shared demo recipe.
clear_marker = '''  function clearDomArea(area) {\n    elementTargets(area).forEach((element) => {'''
assert clear_marker in s
helper = '''  function applyDefaultRainbow(area) {\n    const recipe = defaultRainbowDemoRecipe();\n    if (simulator === "bike") {\n      elementTargets(area).forEach((element) => {\n        delete element.dataset.simAreaActive;\n        delete element.dataset.simEffect;\n        delete element.dataset.simSection;\n        delete element.dataset.simPalette;\n        delete element.dataset.simGradientLength;\n        delete element.dataset.simGradientOwner;\n        element.classList.remove("zone-off");\n        element.classList.add("zone-on");\n        ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction", "--sim-gradient-stroke"].forEach((property) => element.style.removeProperty(property));\n      });\n      return;\n    }\n    if (simulator === "home") {\n      applyHomeArea(area, recipe);\n      return;\n    }\n    applyDomArea(area, recipe);\n  }\n\n'''
s = s.replace(clear_marker, helper + clear_marker, 1)

# Custom Bike effects must replace, not stack on, the legacy zone-on fill/glow/animation.
class_block = '''      element.classList.add("zone-on");\n      element.classList.remove("zone-off");'''
assert class_block in s
s = s.replace(class_block, '''      if (simulator === "bike") {\n        element.classList.remove("zone-on", "zone-off");\n      } else {\n        element.classList.add("zone-on");\n        element.classList.remove("zone-off");\n      }''', 1)

# An inactive area means no custom customer effect; it returns to the neutral default Rainbow.
inactive_block = '''    if (!area.active) {\n      if (simulator === "home") clearHomeArea(area);\n      else clearDomArea(area);\n      area.currentStep = -1;\n      return;\n    }'''
assert inactive_block in s
s = s.replace(inactive_block, '''    if (!area.active) {\n      applyDefaultRainbow(area);\n      area.currentStep = -1;\n      return;\n    }''', 1)

# Default Rainbow is visible in the viewport but is not a selected/custom area state.
s = s.replace('''        : "Off";''', '''        : "Default rainbow";''', 1)

# Rainbow keeps its fixed base colors and no gradient/color/speed/direction editing controls.
s = s.replace('<label class="sim-field" id="simPaletteModeWrap">Color use', '<label class="sim-field" id="simPaletteModeWrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Color use', 1)
s = s.replace('<label class="sim-field sim-color-field" id="simColor1Wrap">Primary', '<label class="sim-field sim-color-field" id="simColor1Wrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Primary', 1)
s = s.replace('${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second', '${editorRecipe.paletteMode === "single" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Foreground / second', 1)
s = s.replace('${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third', '${editorRecipe.paletteMode !== "gradient" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Background / third', 1)
s = s.replace('id="simSpeedWrap"${effect.speed ? "" : " hidden"}', 'id="simSpeedWrap"${effect.speed && effect.id !== "rainbow" ? "" : " hidden"}', 1)
s = s.replace('id="simDirectionWrap"${effect.directional ? "" : " hidden"}', 'id="simDirectionWrap"${effect.directional && effect.id !== "rainbow" ? "" : " hidden"}', 1)

visibility = '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";'''
assert visibility in s
s = s.replace(visibility, '''    const isRainbow = effect.id === "rainbow";\n    if (isRainbow) {\n      editorRecipe = defaultRainbowDemoRecipe();\n      const palette = root.querySelector("#simPaletteMode");\n      if (palette) palette.value = "gradient";\n    }\n    if (speedWrap) speedWrap.hidden = !effect.speed || isRainbow;\n    if (directionWrap) directionWrap.hidden = !effect.directional || isRainbow;\n    if (paletteWrap) paletteWrap.hidden = isRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;\n    if (color1Wrap) color1Wrap.hidden = isRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;''', 1)

# Invalidate the old active-demo snapshot once; saved presets are stored separately.
s = s.replace('if (stored?.version !== 2 || stored.simulator !== simulator) return;', 'if (stored?.version !== 3 || stored.simulator !== simulator) return;', 1)
s = s.replace('version: 2,', 'version: 3,', 1)

# Replace the all-areas-active showroom implementation with a neutral visual default.
old_init = '''    // Default showroom state: every installation area is active with the base\n    // rainbow demonstration, while Step 1 target selection remains clear.\n    const demoRecipe = defaultRainbowDemoRecipe();\n    const demoStartedAt = performance.now();\n    areas.forEach((area) => {\n      area.selected = false;\n      area.active = true;\n      area.mode = "single";\n      area.program = [normalizeForSafety(area, demoRecipe)];\n      area.startedAt = demoStartedAt;\n      area.currentStep = -1;\n    });\n\n    preparePage();\n    areas.forEach((area) => applyAreaRecipe(area, area.program[0]));\n\n    // Home SIM finishes its canvas/controller API asynchronously; re-apply the\n    // same default demo once that API has had time to initialize.\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => {\n          area.currentStep = -1;\n          applyAreaRecipe(area, area.program[0]);\n        });\n      }, 350);\n    }'''
assert old_init in s
s = s.replace(old_init, '''    // Neutral showroom state: Rainbow is visible everywhere, but no area is\n    // selected or counted as having a customer effect until Apply is pressed.\n    areas.forEach((area) => {\n      area.selected = false;\n      if (!area.active) {\n        area.currentStep = -1;\n        applyDefaultRainbow(area);\n      }\n    });\n\n    preparePage();\n    areas.forEach((area) => {\n      if (area.active) applyAreaRecipe(area, area.program[0]);\n      else applyDefaultRainbow(area);\n    });\n\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => {\n          area.currentStep = -1;\n          if (area.active) applyAreaRecipe(area, area.program[0]);\n          else applyDefaultRainbow(area);\n        });\n      }, 350);\n    }''', 1)

js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
haze_marker = '''[data-sim-area-active="true"][data-sim-palette="gradient"] {\n  stroke: var(--sim-gradient-stroke, var(--sim-a, #35e7ff)) !important;\n}'''
assert haze_marker in c
c = c.replace(haze_marker, '''/* Custom Bike effects must not inherit the legacy zone-on translucent fill haze. */\n.sim-area-bike [data-sim-area-active="true"] {\n  fill: none !important;\n}\n\n''' + haze_marker, 1)
css.write_text(c, encoding='utf-8')
