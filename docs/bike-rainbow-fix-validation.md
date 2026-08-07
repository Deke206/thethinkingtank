# Bike SIM rainbow/apply fix validation

Validated on branch `agent/fix-bike-effect-apply-rainbow`.

- Existing production tagline override remains `LED BIKE SIM`.
- Step 1 Bike area buttons reduced to 112×86 px desktop, 102×80 px tablet, 94×76 px small mobile.
- Legacy active-area storage moved from V1 to V2 so previous accidental active states do not restore.
- Inactive Bike SVG lighting groups are explicitly reset to `zone-off` on initialization.
- `Turn selected areas off` clears the active area visual state; `Unselect areas` only clears the blue selection outline.
- Decorative effect-preview tile removed from the shared editor markup.
- Rainbow uses a fixed seven-color palette and hides manual color, speed, direction, and palette controls.
- Three-color gradients and Rainbow expose Gradient length: quarter, half, three-quarters, or whole LED run.
- SVG gradients use repeat spread and apply to child paths/shapes so wheel groups inherit the gradient.
- JavaScript syntax validation passed in the one-shot patch workflow.
