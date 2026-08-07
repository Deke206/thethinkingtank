from pathlib import Path

p = Path('js/sim-node-sequence.js')
s = p.read_text(encoding='utf-8')

rainbow_effect = '    { id: "rainbow", label: "Rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },\n'
assert rainbow_effect in s
s = s.replace(rainbow_effect, rainbow_effect + '    { id: "base-rainbow", label: "Base rainbow", base: "rainbow", directional: true, speed: true, palette: "gradient" },\n', 1)

needs = 'const needsGradient = recipe.paletteMode === "gradient" && ["rainbow", "race", "comet", "waterfall", "wipe"].includes(recipe.effect);'
assert needs in s
s = s.replace(needs, 'const needsGradient = recipe.paletteMode === "gradient" && ["rainbow", "base-rainbow", "race", "comet", "waterfall", "wipe"].includes(recipe.effect);', 1)

stops = '    const stops = [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];'
assert stops in s
s = s.replace(stops, '''    const stops = recipe.effect === "base-rainbow"\n      ? RAINBOW_COLORS.map((color, index) => [index / (RAINBOW_COLORS.length - 1), color])\n      : [[0, colors[0]], [0.5, colors[1]], [1, colors[2]]];''', 1)

# Base Rainbow is fixed-color, but still keeps gradient length, speed, and direction controls.
visibility = '''    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = false;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = false;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single";\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient";'''
assert visibility in s
s = s.replace(visibility, '''    const isBaseRainbow = effect.id === "base-rainbow";\n    if (isBaseRainbow) editorRecipe.paletteMode = "gradient";\n    if (speedWrap) speedWrap.hidden = !effect.speed;\n    if (directionWrap) directionWrap.hidden = !effect.directional;\n    if (paletteWrap) paletteWrap.hidden = isBaseRainbow;\n    if (gradientLengthWrap) gradientLengthWrap.hidden = editorRecipe.paletteMode !== "gradient";\n    if (color1Wrap) color1Wrap.hidden = isBaseRainbow;\n    if (color2Wrap) color2Wrap.hidden = editorRecipe.paletteMode === "single" || isBaseRainbow;\n    if (color3Wrap) color3Wrap.hidden = editorRecipe.paletteMode !== "gradient" || isBaseRainbow;''', 1)

p.write_text(s, encoding='utf-8')
