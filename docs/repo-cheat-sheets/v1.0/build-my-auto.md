# build-my-auto.html — Page Object Cheat Sheet v1.0

**Source file:** `build-my-auto.html`  
**Purpose:** Stable object names and additive semantic selectors for page editing.

## Object map

- `body` — **Body 1** (no existing ID/class) → normalized `.page .page--build-my-auto`
- `main` — **Main page content** (no existing ID/class) → normalized `.page-main`
- `main` — **Main page content** (no existing ID/class) → normalized `.page-main`

## Naming rule

Use normalized selectors for future shared CSS/JavaScript; retain existing selectors wherever current functionality depends on them.
