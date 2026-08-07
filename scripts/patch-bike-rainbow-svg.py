from pathlib import Path

js = Path('js/sim-node-sequence.js')
css = Path('css/sim-node-sequence-base.css')

s = js.read_text(encoding='utf-8')

marker = '''  function elementTargets(area) {\n    if (simulator === "auto") {\n      const lines = document.querySelectorAll(`.auto-zone[data-zone="${area.autoGroup}"] .led-line`);\n      return lines[area.autoIndex] ? [lines[area.autoIndex]] : [];\n    }\n    return (area.targets || []).flatMap((selector) => [...document.querySelectorAll(selector)]);\n  }\n'''
assert marker in s
helper = '''\n  function applyBikeRainbowGradient(area, recipe, element) {\n    if (simulator !== "bike" || recipe.effect !== "rainbow" || recipe.paletteMode !== "gradient") {\n      element.style.removeProperty("stroke");\n      return;\n    }\n\n    const svg = element.ownerSVGElement || element.closest?.("svg");\n    if (!svg) return;\n    const namespace = "http://www.w3.org/2000/svg";\n    let defs = svg.querySelector("defs");\n    if (!defs) {\n      defs = document.createElementNS(namespace, "defs");\n      svg.prepend(defs);\n    }\n\n    const gradientId = `sim-rainbow-${area.id.replace(/[^a-z0-9_-]/gi, "-")}`;\n    let gradient = defs.querySelector(`#${gradientId}`);\n    if (!gradient) {\n      gradient = document.createElementNS(namespace, "linearGradient");\n      gradient.id = gradientId;\n      defs.appendChild(gradient);\n    }\n\n    const spans = { quarter: .25, half: .5, "three-quarter": .75, whole: 1 };\n    const span = spans[recipe.gradientLength] || 1;\n    gradient.setAttribute("x1", "0");\n    gradient.setAttribute("y1", "0");\n    gradient.setAttribute("x2", String(span));\n    gradient.setAttribute("y2", "0");\n    gradient.setAttribute("spreadMethod", "repeat");\n    gradient.replaceChildren();\n\n    const colors = normalizedColors(recipe);\n    [["0%", colors[0]], ["50%", colors[1]], ["100%", colors[2]]].forEach(([offset, color]) => {\n      const stop = document.createElementNS(namespace, "stop");\n      stop.setAttribute("offset", offset);\n      stop.setAttribute("stop-color", color);\n      gradient.appendChild(stop);\n    });\n\n    const animate = document.createElementNS(namespace, "animateTransform");\n    const seconds = Math.max(.3, 3.7 - ((recipe.speed / 100) * 3.3)).toFixed(2);\n    animate.setAttribute("attributeName", "gradientTransform");\n    animate.setAttribute("type", "translate");\n    animate.setAttribute("from", "0 0");\n    animate.setAttribute("to", recipe.direction < 0 ? "-1 0" : "1 0");\n    animate.setAttribute("dur", `${seconds}s`);\n    animate.setAttribute("repeatCount", "indefinite");\n    gradient.appendChild(animate);\n\n    element.style.setProperty("stroke", `url(#${gradientId})`, "important");\n  }\n'''
s = s.replace(marker, marker + helper, 1)

s = s.replace('''      ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction"].forEach((property) => element.style.removeProperty(property));''', '''      ["--sim-a", "--sim-b", "--sim-c", "--sim-brightness", "--sim-speed", "--sim-direction", "stroke"].forEach((property) => element.style.removeProperty(property));''', 1)

apply_marker = '''      element.style.setProperty("--sim-direction", recipe.direction < 0 ? "reverse" : "normal");\n    });'''
assert apply_marker in s
s = s.replace(apply_marker, '''      element.style.setProperty("--sim-direction", recipe.direction < 0 ? "reverse" : "normal");\n      applyBikeRainbowGradient(area, recipe, element);\n    });''', 1)
js.write_text(s, encoding='utf-8')

c = css.read_text(encoding='utf-8')
old = '''[data-sim-area-active="true"][data-sim-effect="rainbow"],\n[data-sim-area-active="true"][data-sim-effect="sections"],\n[data-sim-area-active="true"][data-sim-effect="theater"] { animation-name: sim-area-palette !important; stroke-dasharray: 12 8 !important; }'''
assert old in c
c = c.replace(old, '''[data-sim-area-active="true"][data-sim-effect="rainbow"] { animation-name: sim-area-rainbow !important; stroke-dasharray: none !important; }\n[data-sim-area-active="true"][data-sim-effect="sections"],\n[data-sim-area-active="true"][data-sim-effect="theater"] { animation-name: sim-area-palette !important; stroke-dasharray: 12 8 !important; }''', 1)

# Gradient length is now implemented by the repeating SVG gradient, not dash spacing.
for line in [
    '[data-sim-area-active="true"][data-sim-gradient-length="quarter"][data-sim-effect="rainbow"] { stroke-dasharray: 4 3 !important; }\n',
    '[data-sim-area-active="true"][data-sim-gradient-length="half"][data-sim-effect="rainbow"] { stroke-dasharray: 8 5 !important; }\n',
    '[data-sim-area-active="true"][data-sim-gradient-length="three-quarter"][data-sim-effect="rainbow"] { stroke-dasharray: 12 7 !important; }\n',
    '[data-sim-area-active="true"][data-sim-gradient-length="whole"][data-sim-effect="rainbow"] { stroke-dasharray: 18 10 !important; }\n',
]:
    c = c.replace(line, '')

c = c.replace('@keyframes sim-area-solid', '@keyframes sim-area-rainbow { from, to { opacity: var(--sim-brightness, .95); } }\n@keyframes sim-area-solid', 1)
css.write_text(c, encoding='utf-8')
