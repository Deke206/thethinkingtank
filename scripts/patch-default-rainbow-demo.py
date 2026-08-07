from pathlib import Path

js = Path('js/sim-node-sequence.js')
s = js.read_text(encoding='utf-8')

marker = '''  function defaultRecipe() {\n    return {\n      effect: "solid",\n      section: "whole",\n      gradientLength: "whole",\n      paletteMode: "single",\n      colors: ["#35e7ff", "#9b7cff", "#ff5ab9"],\n      brightness: 100,\n      speed: 55,\n      direction: 1,\n      duration: DEFAULT_STEP_SECONDS\n    };\n  }\n'''
assert marker in s
s = s.replace(marker, marker + '''\n  function defaultRainbowDemoRecipe() {\n    return {\n      effect: "rainbow",\n      section: "whole",\n      gradientLength: "whole",\n      paletteMode: "gradient",\n      colors: [RAINBOW_COLORS[0], RAINBOW_COLORS[3], RAINBOW_COLORS[6]],\n      brightness: 100,\n      speed: 55,\n      direction: 1,\n      duration: DEFAULT_STEP_SECONDS\n    };\n  }\n''', 1)

old_init = '''  function initialize() {\n    loadState();\n    preparePage();\n    areas.forEach((area) => {\n      if (!area.active) {\n        if (simulator === "home") clearHomeArea(area);\n        else clearDomArea(area);\n      }\n    });\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => { if (!area.active) clearHomeArea(area); });\n      }, 350);\n    }\n    areas.forEach((area) => {\n      if (!area.active) return;\n      area.startedAt = performance.now();\n      applyAreaRecipe(area, area.program[0]);\n    });'''
assert old_init in s
new_init = '''  function initialize() {\n    loadState();\n\n    // Default showroom state: every installation area is active with the base\n    // rainbow demonstration, while Step 1 target selection remains clear.\n    const demoRecipe = defaultRainbowDemoRecipe();\n    const demoStartedAt = performance.now();\n    areas.forEach((area) => {\n      area.selected = false;\n      area.active = true;\n      area.mode = "single";\n      area.program = [normalizeForSafety(area, demoRecipe)];\n      area.startedAt = demoStartedAt;\n      area.currentStep = -1;\n    });\n\n    preparePage();\n    areas.forEach((area) => applyAreaRecipe(area, area.program[0]));\n\n    // Home SIM finishes its canvas/controller API asynchronously; re-apply the\n    // same default demo once that API has had time to initialize.\n    if (simulator === "home") {\n      window.setTimeout(() => {\n        areas.forEach((area) => {\n          area.currentStep = -1;\n          applyAreaRecipe(area, area.program[0]);\n        });\n      }, 350);\n    }'''
s = s.replace(old_init, new_init, 1)
js.write_text(s, encoding='utf-8')
