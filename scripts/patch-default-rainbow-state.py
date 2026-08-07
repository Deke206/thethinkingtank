from pathlib import Path

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence.css')

s = js.read_text(encoding='utf-8')

# Re-establish Rainbow as the fixed base/default look rather than a customer-editable gradient recipe.
normalize_marker = '''    const effect = effectById(recipe?.effect);\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;'''
assert normalize_marker in s
s = s.replace(normalize_marker, '''    const effect = effectById(recipe?.effect);\n    if (effect.id === "rainbow") {\n      return {\n        effect: "rainbow",\n        section: "whole",\n        gradientLength: "whole",\n        paletteMode: "gradient",\n        colors: [...RAINBOW_COLORS],\n        brightness: 100,\n        speed: 55,\n        direction: 1,\n        duration: DEFAULT_STEP_SECONDS\n      };\n    }\n    const colors = Array.isArray(recipe?.colors) ? recipe.colors.slice(0, 3) : fallback.colors;''', 1)

# Default rainbow recipe used when an area has no custom customer effect applied.
status_marker = '''  let statusMessage = "Select one or more installation areas, create an effect, then press Apply.";\n  let homeRefreshPending = false;'''
assert status_marker in s
s = s.replace(status_marker, status_marker + '''\n\n  function defaultRainbowRecipe() {\n    return normalizeRecipe({ effect: "rainbow" });\n  }''', 1)

# Bike default state uses the original Bike Builder zone-on rainbow. Auto/Home use the shared fixed Rainbow recipe.
clear_marker = '''  function clearDomArea(area) {\n    elementTargets(area).forEach((element) => {'''
assert clear_marker in s
helper = '''  function applyDefaultRainbow(area) {\n    const recipe = defaultRainbowRecipe();\n    if (simulator === "bike") {\n      elementTargets(area).forEach((element) => {\n        delete element.dataset.simAreaActive;\n        delete element.dataset.simEffect;\n        delete element.dataset.simSection;\n        delete element.dataset.simPalette;\n        delete element.dataset.simGradientLength;\n        delete element.dataset.simGradientOwner;\n        element.classList.remove("zone-off");\n        element.classList.add("zone-on");\n        ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction", "--sim-gradient-stroke"].forEach((property) => element.style.removeProperty(property));\n      });\n      return;\n    }\n    if (simulator === "home") {\n      applyHomeArea(area, recipe);\n      return;\n    }\n    applyDomArea(area, recipe);\n  }\n\n'''
s = s.replace(clear_marker, helper + clear_marker, 1)

# Custom Bike effects must not stack on top of the legacy zone-on fill/filter/animation.
old_class_block = '''      element.classList.add("zone-on");\n      element.classList.remove("zone-off");'''
assert old_class_block in s
s = s.replace(old_class_block, '''      if (simulator === "bike") {\n        element.classList.remove("zone-on", "zone-off");\n      } else {\n        element.classList.add("zone-on");\n        element.classList.remove("zone-off");\n      }''', 1)

# Inactive areas return to the default Rainbow rather than the old pink/blue off-state styling.
old_inactive = '''    if (!area.active) {\n      if (simulator === "home") clearHomeArea(area);\n      else clearDomArea(area);\n      area.currentStep = -1;\n      return;\n    }'''
assert old_inactive in s
s = s.replace(old_inactive, '''    if (!area.active) {\n      applyDefaultRainbow(area);\n      area.currentStep = -1;\n      return;\n    }''', 1)

# The area buttons stay unselected/unlit while the viewport shows the neutral default Rainbow.
s = s.replace('''        : "Off";''', '''        : "Default rainbow";''', 1)

# Rainbow is fixed: hide its gradient/color/speed/direction editing controls and restore the original base colors.
s = s.replace('''<label class="sim-field" id="simPaletteModeWrap">Color use''', '''<label class="sim-field" id="simPaletteModeWrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Color use''', 1)
s = s.replace('''<label class="sim-field sim-color-field" id="simColor1Wrap">Primary''', '''<label class="sim-field sim-color-field" id="simColor1Wrap"${editorRecipe.effect === "rainbow" ? " hidden" : ""}>Primary''', 1)
s = s.replace('''${editorRecipe.paletteMode === "single" ? " hidden" : ""}>Foreground / second''', '''${editorRecipe.paletteMode === "single" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Foreground / second''', 1)
s = s.replace('''${editorRecipe.paletteMode !== "gradient" ? " hidden" : ""}>Background / third''', '''${editorRecipe.paletteMode !== "gradient" || editorRecipe.effect === "rainbow" ? " hidden" : ""}>Background / third''', 1)
s = s.replace('''id="simSpeedWrap"${effect.speed ? "" : " hidden"}''', '''id="simSpeedWrap"${effect.speed && effect.id !== "rainbow" ? "" : " hidden"}''', 1)
s = s.replace('''id="simDirectionWrap"${effect.directional ? "" : " hidden"}''', '''id="simDirectionWrap"${effect.directional && effect.id !== "rainbow" ? "" : " hidden"}''', 1)

visibility = '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";'''
assert visibility in s
s = s.replace(visibility, '''    const isRainbow = effect.id === "rainbow";\n    if (isRainbow) {\n      editorRecipe = defaultRainbowRecipe();\n      const palette = root.querySelector("#simPaletteMode");\n      if (palette) palette.value = "gradient";\n    }\n    if (speedWrap) speedWrap.hidden = !effect.speed || isRainbow;\n    if (directionWrap) directionWrap.hidden = !effect.directional || isRainbow;\n    if (paletteWrap) paletteWrap.hidden = isRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;\n    if (color1Wrap) color1Wrap.hidden = isRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isRainbow;''', 1)

# New default-state generation invalidates the previous assignment snapshot once across all SIM pages.
s = s.replace('if (stored?.version !== 2 || stored.simulator !== simulator) return;', 'if (stored?.version !== 3 || stored.simulator !== simulator) return;', 1)
s = s.replace('version: 2,', 'version: 3,', 1)

# Initial page state: every unconfigured area receives the default Rainbow. Custom active areas still win.
init_old = '''    areas.forEach((area) => {\n      if (!area.active) {\n        if (simulator === "home") clearHomeArea(area);\n        else clearDomArea(area);\n      }\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => { if (!area.active) clearHomeArea(area); });\n      }, 350);\n    }'''
assert init_old in s
s = s.replace(init_old, '''    areas.forEach((area) => {\n      if (!area.active) applyDefaultRainbow(area);\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => { if (!area.active) applyDefaultRainbow(area); });\n      }, 350);\n    }''', 1)

js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
# The haze came from legacy .zone-on fill remaining underneath a custom shared-editor effect.
haze_marker = '''[data-sim-area-active="true"][data-sim-palette="gradient"] {\n  stroke: var(--sim-gradient-stroke, var(--sim-a, #35e7ff)) !important;\n}'''
assert haze_marker in c
c = c.replace(haze_marker, '''.sim-area-bike [data-sim-area-active="true"] {\n  fill: none !important;\n}\n\n''' + haze_marker, 1)
css.write_text(c, encoding='utf-8')
