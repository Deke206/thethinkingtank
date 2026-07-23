const form = document.getElementById('bikeBuilderForm');
const summaryList = document.getElementById('buildSummary');
const budgetSelect = document.getElementById('budget');
const budgetBadge = document.getElementById('budgetBadge');
const copyStatus = document.getElementById('copyStatus');

const bikeStyleLabels = {
  comfort: 'Comfort / cruiser bicycle',
  mountain: 'Mountain bike',
  bmx: 'BMX bike',
  beachCruiser: 'Beach cruiser',
  road: 'Road bike',
  fatTire: 'Fat-tire e-bike',
  stepThroughEb: 'Step-through e-bike',
  cargo: 'Cargo / delivery bike',
  recumbent: 'Recumbent bicycle',
  balance: "Kid's balance bike"
};

const sizeConfig = {
  toddler: { label: 'Toddler / balance bike', scale: 0.62 },
  preschool: { label: 'Small child / preschool bicycle', scale: 0.72 },
  youth: { label: 'Youth bicycle', scale: 0.84 },
  teen: { label: 'Teen / small-adult bicycle', scale: 0.94 },
  adult: { label: 'Adult bicycle', scale: 1 }
};

const bikeBodies = {
  comfort: {
    scale: 1,
    bounds: { minX: 105, maxX: 790, minY: 120, maxY: 560 },
    rearWheel: { x: 245, y: 438, r: 122 }, frontWheel: { x: 665, y: 438, r: 122 },
    frame: ['M245 438L450 438L382 286L245 438', 'M382 286C418 352 449 350 482 326C520 298 536 252 568 238', 'M450 438C495 360 527 292 568 238'],
    metal: ['M382 286L355 205M322 195H390', 'M558 220L550 154L584 128', 'M548 151C571 139 590 139 614 149'],
    forks: ['M578 264L665 438', 'M595 262L680 435'], handlebar: 'M550 154L584 128M548 151C571 139 590 139 614 149',
    frontBasket: { x: 608, y: 186, w: 182, h: 120 }, rearBasket: { x: 92, y: 246, w: 143, h: 102 },
    pouch: { x: 540, y: 164, w: 88, h: 54 }, seatPouch: 'M332 214H397L386 266H345Z',
    flag: { x: 150, top: 62, bottom: 310 }, tail: { x: 166, y: 345 }, signal: { left: 106, right: 235, y: 365 }, helmet: { x: 430, y: 60 }
  },
  mountain: {
    scale: 1,
    bounds: { minX: 105, maxX: 790, minY: 115, maxY: 570 },
    rearWheel: { x: 245, y: 445, r: 124 }, frontWheel: { x: 670, y: 445, r: 124 },
    frame: ['M245 445L450 445L355 255L245 445', 'M355 255L565 238L450 445'],
    metal: ['M355 255L322 182M292 176H365', 'M554 238L560 166L610 138', 'M548 166C580 151 608 154 638 171', 'M602 286L622 248M586 288L606 250'],
    forks: ['M594 280L670 445', 'M610 276L687 442'], handlebar: 'M560 166L610 138M548 166C580 151 608 154 638 171',
    frontBasket: { x: 620, y: 180, w: 150, h: 96 }, rearBasket: { x: 92, y: 242, w: 138, h: 96 },
    pouch: { x: 556, y: 175, w: 76, h: 48 }, seatPouch: 'M300 190H360L351 239H314Z',
    flag: { x: 150, top: 58, bottom: 305 }, tail: { x: 158, y: 342 }, signal: { left: 98, right: 227, y: 362 }, helmet: { x: 420, y: 54 }
  },
  bmx: {
    scale: 1.08,
    bounds: { minX: 165, maxX: 715, minY: 195, maxY: 565 },
    rearWheel: { x: 275, y: 456, r: 96 }, frontWheel: { x: 615, y: 456, r: 96 },
    frame: ['M275 456L440 456L345 330L275 456', 'M345 330L530 338L440 456'],
    metal: ['M345 330L328 272M304 270H356', 'M520 334V258M485 255H558'],
    forks: ['M530 338L615 456', 'M514 335L602 454'], handlebar: 'M520 258V224M485 224H558',
    frontBasket: { x: 574, y: 285, w: 108, h: 74 }, rearBasket: { x: 116, y: 314, w: 114, h: 72 },
    pouch: { x: 506, y: 278, w: 58, h: 38 }, seatPouch: 'M300 296H346L339 334H309Z',
    flag: { x: 168, top: 118, bottom: 380 }, tail: { x: 156, y: 390 }, signal: { left: 96, right: 225, y: 410 }, helmet: { x: 400, y: 92 }
  },
  beachCruiser: {
    scale: 1,
    bounds: { minX: 105, maxX: 800, minY: 120, maxY: 570 },
    rearWheel: { x: 255, y: 446, r: 118 }, frontWheel: { x: 675, y: 446, r: 118 },
    frame: ['M255 446L445 446C430 376 398 332 356 292', 'M356 292C416 295 470 300 532 304C566 307 594 288 605 252', 'M445 446C520 380 566 316 605 252'],
    metal: ['M356 292L330 214M300 204H370', 'M600 250L596 177L640 150', 'M593 177C623 164 651 167 681 184'],
    forks: ['M615 276L675 446', 'M630 272L690 443'], handlebar: 'M596 177L640 150M593 177C623 164 651 167 681 184',
    frontBasket: { x: 624, y: 196, w: 146, h: 96 }, rearBasket: { x: 104, y: 248, w: 138, h: 98 },
    pouch: { x: 590, y: 196, w: 70, h: 42 }, seatPouch: 'M305 214H372L360 268H318Z',
    flag: { x: 160, top: 74, bottom: 310 }, tail: { x: 170, y: 348 }, signal: { left: 110, right: 239, y: 368 }, helmet: { x: 432, y: 56 }
  },
  road: {
    scale: 1,
    bounds: { minX: 110, maxX: 785, minY: 135, maxY: 570 },
    rearWheel: { x: 258, y: 448, r: 116 }, frontWheel: { x: 668, y: 448, r: 116 },
    frame: ['M258 448L446 448L364 276L258 448', 'M364 276L560 260L446 448'],
    metal: ['M364 276L338 203M306 196H364', 'M556 260L566 185L618 158', 'M563 187H648M618 158L598 180'],
    forks: ['M586 292L668 448', 'M599 289L683 445'], handlebar: 'M566 185H648M618 158L598 180',
    frontBasket: { x: 608, y: 230, w: 126, h: 78 }, rearBasket: { x: 104, y: 262, w: 126, h: 84 },
    pouch: { x: 554, y: 214, w: 66, h: 38 }, seatPouch: 'M315 214H365L356 252H325Z',
    flag: { x: 158, top: 92, bottom: 320 }, tail: { x: 162, y: 360 }, signal: { left: 102, right: 231, y: 380 }, helmet: { x: 420, y: 70 }
  },
  fatTire: {
    scale: 0.96,
    bounds: { minX: 80, maxX: 825, minY: 105, maxY: 590 },
    rearWheel: { x: 250, y: 448, r: 136 }, frontWheel: { x: 675, y: 448, r: 136 },
    frame: ['M250 448L450 448L355 258L250 448', 'M355 258L562 238L450 448'],
    metal: ['M355 258L326 174M294 166H360', 'M552 238L560 166L612 136', 'M546 166C579 151 607 153 640 170', 'M405 280H490V350H405Z'],
    forks: ['M598 292L675 448', 'M614 289L692 444'], handlebar: 'M560 166L612 136M546 166C579 151 607 153 640 170',
    frontBasket: { x: 620, y: 180, w: 152, h: 98 }, rearBasket: { x: 94, y: 234, w: 142, h: 96 },
    pouch: { x: 557, y: 176, w: 78, h: 44 }, seatPouch: 'M300 188H360L350 240H315Z',
    flag: { x: 150, top: 55, bottom: 298 }, tail: { x: 158, y: 336 }, signal: { left: 98, right: 227, y: 356 }, helmet: { x: 422, y: 54 }
  },
  stepThroughEb: {
    scale: 0.99,
    bounds: { minX: 100, maxX: 800, minY: 115, maxY: 575 },
    rearWheel: { x: 252, y: 446, r: 122 }, frontWheel: { x: 668, y: 446, r: 122 },
    frame: ['M252 446L446 446L380 292L252 446', 'M380 292C422 326 467 324 508 304C546 286 574 262 586 232', 'M446 446C512 370 554 309 586 232'],
    metal: ['M380 292L349 206M316 198H386', 'M576 229L571 163L612 136', 'M569 162C597 148 622 150 650 166', 'M402 300H470V378H402Z'],
    forks: ['M608 282L668 446', 'M623 279L683 443'], handlebar: 'M571 163L612 136M569 162C597 148 622 150 650 166',
    frontBasket: { x: 614, y: 190, w: 160, h: 104 }, rearBasket: { x: 100, y: 244, w: 142, h: 98 },
    pouch: { x: 552, y: 176, w: 82, h: 46 }, seatPouch: 'M323 215H384L372 267H334Z',
    flag: { x: 158, top: 64, bottom: 308 }, tail: { x: 166, y: 342 }, signal: { left: 106, right: 235, y: 362 }, helmet: { x: 430, y: 58 }
  },
  cargo: {
    scale: 0.92,
    bounds: { minX: 60, maxX: 820, minY: 110, maxY: 570 },
    rearWheel: { x: 215, y: 448, r: 110 }, frontWheel: { x: 700, y: 448, r: 110 },
    frame: ['M215 448L430 448L350 274L215 448', 'M350 274L575 274L430 448'],
    metal: ['M350 274L320 198M292 190H360', 'M566 272L566 190L610 160', 'M560 190C590 176 617 178 646 194', 'M112 276H352M112 276V320H352V276'],
    forks: ['M575 274L700 448', 'M590 274L715 444'], handlebar: 'M566 190L610 160M560 190C590 176 617 178 646 194',
    frontBasket: { x: 594, y: 216, w: 176, h: 108 }, rearBasket: { x: 78, y: 240, w: 170, h: 108 },
    pouch: { x: 542, y: 204, w: 78, h: 44 }, seatPouch: 'M296 206H362L350 266H308Z',
    flag: { x: 108, top: 66, bottom: 306 }, tail: { x: 140, y: 352 }, signal: { left: 80, right: 209, y: 372 }, helmet: { x: 402, y: 58 }
  },
  recumbent: {
    scale: 0.96,
    bounds: { minX: 90, maxX: 825, minY: 165, maxY: 600 },
    rearWheel: { x: 245, y: 468, r: 120 }, frontWheel: { x: 710, y: 498, r: 88 },
    frame: ['M245 468L400 468L540 420L618 420L710 498', 'M400 468L332 358L250 468', 'M540 420L472 372L400 468'],
    metal: ['M330 356L300 282M292 280H356', 'M620 420L650 362M648 360L690 334', 'M642 362C662 350 688 352 709 366', 'M486 356L410 338L364 388M365 388H415'],
    forks: ['M618 420L710 498'], handlebar: 'M650 362L690 334M642 362C662 350 688 352 709 366',
    frontBasket: { x: 628, y: 380, w: 122, h: 80 }, rearBasket: { x: 116, y: 250, w: 132, h: 90 },
    pouch: { x: 610, y: 380, w: 62, h: 38 }, seatPouch: 'M318 322H388L374 376H332Z',
    flag: { x: 146, top: 58, bottom: 308 }, tail: { x: 154, y: 360 }, signal: { left: 94, right: 223, y: 380 }, helmet: { x: 360, y: 118 }
  },
  balance: {
    scale: 1.08,
    bounds: { minX: 135, maxX: 675, minY: 205, maxY: 570 },
    rearWheel: { x: 292, y: 470, r: 84 }, frontWheel: { x: 574, y: 470, r: 84 },
    frame: ['M292 470L432 470L360 366L292 470', 'M360 366L496 382L432 470'],
    metal: ['M360 366L340 310M316 304H374', 'M490 380V318M455 314H526', 'M360 350H405C438 350 448 330 448 308'],
    forks: ['M496 382L574 470', 'M482 378L560 466'], handlebar: 'M490 318V286M455 286H526',
    frontBasket: { x: 526, y: 342, w: 106, h: 68 }, rearBasket: { x: 150, y: 346, w: 108, h: 72 },
    pouch: { x: 474, y: 334, w: 52, h: 34 }, seatPouch: 'M324 322H366L360 356H332Z',
    flag: { x: 182, top: 144, bottom: 384 }, tail: { x: 184, y: 408 }, signal: { left: 124, right: 253, y: 428 }, helmet: { x: 366, y: 128 }
  }
};

const yesNoDefaults = {
  frameLights: 'yes', frontForks: 'no', frontWheel: 'yes', rearWheel: 'yes', handlebars: 'no',
  frontBasket: 'no', rearBasket: 'no', pouch: 'no', seatPouch: 'no', flagPole: 'no',
  appControl: 'yes', rearBrake: 'yes', turnSignals: 'no', helmetLights: 'no'
};

let previewMode = 'side';
let currentMainBody = 'comfort';
let currentKidBody = 'balance';
let mainTransform = { x: 0, y: 0, scale: 1 };

function bodyOptions(selected) {
  return Object.entries(bikeStyleLabels).map(([value, label]) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${label}</option>`).join('');
}

function injectBuilderControlsAndStyles() {
  document.getElementById('frontViewPanel')?.remove();

  const frameRow = document.getElementById('frameSize')?.closest('.question-row');
  if (frameRow && !document.getElementById('bikeStyle')) {
    const bodyRow = document.createElement('div');
    bodyRow.className = 'question-row';
    bodyRow.innerHTML = `
      <label class="question-label" for="bikeStyle">Primary bicycle body style</label>
      <select id="bikeStyle" name="bikeStyle" class="form-select">${bodyOptions('comfort')}</select>
      <div class="question-note mt-2">The selected SVG body replaces only the bicycle layer; the street background stays the same.</div>`;
    frameRow.after(bodyRow);
  }

  const kidOptions = document.getElementById('kidBikeOptions');
  if (kidOptions) {
    kidOptions.innerHTML = `
      <label class="form-label fw-bold" for="kidBikeStyle">Additional kid's bicycle body style</label>
      <select id="kidBikeStyle" name="kidBikeStyle" class="form-select mb-3">${bodyOptions('balance')}</select>
      <label class="form-label fw-bold" for="kidFrameSize">Additional kid's bicycle size</label>
      <select id="kidFrameSize" name="kidFrameSize" class="form-select">
        <option value="toddler">Toddler / balance bike</option>
        <option value="preschool" selected>Small child / preschool</option>
        <option value="youth">Youth bicycle</option>
      </select>
      <div class="question-note mt-2">The additional bicycle mirrors the selected lighting and rear-safety zones.</div>`;
  }

  const previewNote = document.querySelector('.preview-rules__note');
  if (previewNote) previewNote.textContent = 'The rear vantage point opens only after selecting the rear brake light or turn signals. Any other builder selection returns every selected bicycle to the centered side view.';

  if (!document.getElementById('builderLayoutUpgradeStyles')) {
    const style = document.createElement('style');
    style.id = 'builderLayoutUpgradeStyles';
    style.textContent = `
      .builder-shell{grid-template-columns:minmax(285px,.7fr) minmax(520px,1.3fr);gap:1.2rem}
      .builder-form{min-width:0;max-width:455px}
      .preview-card{min-width:0;border:1px solid rgba(49,230,255,.38)!important;box-shadow:0 .9rem 2.4rem rgba(0,0,0,.38),0 0 24px rgba(49,230,255,.12)!important}
      .summary-box{border:1px solid rgba(49,230,255,.38);box-shadow:0 .75rem 1.7rem rgba(0,0,0,.28),0 0 18px rgba(49,230,255,.08)}
      .builder-form .btn{font-size:.82rem;line-height:1.15;padding:.34rem .68rem;border-radius:999px}
      .builder-form .yes-no{gap:.35rem}
      .builder-form .yes-no .btn{min-width:56px}
      .builder-form .form-select{font-size:.9rem;padding:.38rem 2rem .38rem .65rem;border-radius:.65rem}
      .builder-form .question-row{padding:.72rem 0}
      .builder-form .accordion-button{padding:.78rem .9rem;font-size:.93rem}
      .bike-stage,.bike-stage svg{min-height:560px;height:560px}
      #rearViewPanel[hidden],#mainBikeGroup[hidden],#kidBikeGroup[hidden],#appControlIcons[hidden]{display:none!important}
      @media(max-width:991.98px){.builder-shell{grid-template-columns:1fr}.builder-form{max-width:none}.preview-card{position:relative;top:auto}.bike-stage,.bike-stage svg{min-height:500px;height:500px}}
      @media(min-width:1400px){.builder-shell{grid-template-columns:minmax(320px,.64fr) minmax(680px,1.36fr)}.builder-form{max-width:470px}}
    `;
    document.head.appendChild(style);
  }
}

function createYesNoControls(container) {
  const name = container.dataset.yesNo;
  const defaultValue = yesNoDefaults[name] || 'no';
  container.innerHTML = `
    <input class="btn-check" type="radio" name="${name}" id="${name}Yes" value="yes" ${defaultValue === 'yes' ? 'checked' : ''}>
    <label class="btn btn-outline-success" for="${name}Yes">Yes</label>
    <input class="btn-check" type="radio" name="${name}" id="${name}No" value="no" ${defaultValue === 'no' ? 'checked' : ''}>
    <label class="btn btn-outline-danger" for="${name}No">No</label>`;
}

function selectedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || 'no';
}

function isYes(name) {
  return selectedValue(name) === 'yes';
}

function idFor(prefix, base) {
  return prefix ? `${prefix}${base.charAt(0).toUpperCase()}${base.slice(1)}` : base;
}

function pathsMarkup(paths) {
  return paths.map((d) => `<path d="${d}"/>`).join('');
}

function wheelMarkup(wheel) {
  const rim = Math.max(44, wheel.r - 22);
  const d = Math.round(rim * .7);
  return `
    <circle class="bike-tire" cx="${wheel.x}" cy="${wheel.y}" r="${wheel.r}"/>
    <circle class="bike-rim" cx="${wheel.x}" cy="${wheel.y}" r="${rim}"/>
    <g class="bike-spoke"><path d="M${wheel.x} ${wheel.y-rim}V${wheel.y+rim}M${wheel.x-rim} ${wheel.y}H${wheel.x+rim}M${wheel.x-d} ${wheel.y-d}L${wheel.x+d} ${wheel.y+d}M${wheel.x-d} ${wheel.y+d}L${wheel.x+d} ${wheel.y-d}"/></g>`;
}

function basketMarkup(id, basket) {
  const slant = 16;
  return `<g id="${id}" class="zone zone-off" stroke-width="8"><path d="M${basket.x} ${basket.y}H${basket.x+basket.w}L${basket.x+basket.w-slant} ${basket.y+basket.h}H${basket.x+slant}Z"/><path d="M${basket.x+10} ${basket.y+26}H${basket.x+basket.w-10}M${basket.x+8} ${basket.y+basket.h-15}H${basket.x+basket.w-10}M${basket.x+Math.round(basket.w*.35)} ${basket.y+5}L${basket.x+Math.round(basket.w*.3)} ${basket.y+basket.h-5}M${basket.x+Math.round(basket.w*.7)} ${basket.y+5}L${basket.x+Math.round(basket.w*.65)} ${basket.y+basket.h-5}"/></g>`;
}

function tailMarkup(id, x, y) {
  return `<g id="${id}" class="tail-light zone zone-off" stroke-width="5"><rect class="tail-housing" x="${x}" y="${y}" width="80" height="38" rx="8"/><rect class="tail-pixel tail-outer" x="${x+6}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-inner" x="${x+20}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-center" x="${x+34}" y="${y+7}" width="12" height="24" rx="2"/><rect class="tail-pixel tail-inner" x="${x+50}" y="${y+7}" width="10" height="24" rx="2"/><rect class="tail-pixel tail-outer" x="${x+64}" y="${y+7}" width="10" height="24" rx="2"/></g>`;
}

function signalsMarkup(id, signal) {
  return `<g id="${id}" class="turn-signal zone zone-off" stroke-width="3"><g class="signal-arrow signal-left"><path class="signal-segment signal-step-3" d="M${signal.left} ${signal.y}L${signal.left+33} ${signal.y-28}V${signal.y-12}H${signal.left+45}V${signal.y+13}H${signal.left+33}V${signal.y+29}Z"/><rect class="signal-segment signal-step-2" x="${signal.left+45}" y="${signal.y-12}" width="13" height="25" rx="2"/><rect class="signal-segment signal-step-1" x="${signal.left+58}" y="${signal.y-12}" width="13" height="25" rx="2"/></g><g class="signal-arrow signal-right"><rect class="signal-segment signal-step-1" x="${signal.right}" y="${signal.y-12}" width="13" height="25" rx="2"/><rect class="signal-segment signal-step-2" x="${signal.right+13}" y="${signal.y-12}" width="13" height="25" rx="2"/><path class="signal-segment signal-step-3" d="M${signal.right+71} ${signal.y}L${signal.right+38} ${signal.y-28}V${signal.y-12}H${signal.right+26}V${signal.y+13}H${signal.right+38}V${signal.y+29}Z"/></g></g>`;
}

function renderSideBike(group, styleKey, prefix) {
  const body = bikeBodies[styleKey] || bikeBodies.comfort;
  const frameId = idFor(prefix, 'frameLightsSvg');
  const forksId = idFor(prefix, 'frontForksSvg');
  const frontWheelId = idFor(prefix, 'frontWheelSvg');
  const rearWheelId = idFor(prefix, 'rearWheelSvg');
  const barsId = idFor(prefix, 'handlebarsSvg');
  const frontBasketId = idFor(prefix, 'frontBasketSvg');
  const rearBasketId = idFor(prefix, 'rearBasketSvg');
  const pouchId = idFor(prefix, 'handlebarPouchSvg');
  const seatPouchId = idFor(prefix, 'seatPouchSvg');
  const flagId = idFor(prefix, 'flagPoleSvg');
  const tailId = idFor(prefix, 'rearBrakeSvg');
  const signalId = idFor(prefix, 'turnSignalsSvg');
  const helmetId = idFor(prefix, 'helmetSvg');
  const helmetLightsId = idFor(prefix, 'helmetLightsSvg');
  const helmetFrontId = idFor(prefix, 'helmetFrontLight');
  const helmetRearId = idFor(prefix, 'helmetRearLight');

  group.innerHTML = `
    ${wheelMarkup(body.rearWheel)}${wheelMarkup(body.frontWheel)}
    <g class="bike-metal">${pathsMarkup(body.frame)}${pathsMarkup(body.forks)}${pathsMarkup(body.metal)}</g>
    <g id="${frameId}" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">${pathsMarkup(body.frame)}</g>
    <g id="${forksId}" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round">${pathsMarkup(body.forks)}</g>
    <circle id="${frontWheelId}" class="zone zone-off" cx="${body.frontWheel.x}" cy="${body.frontWheel.y}" r="${Math.max(42,body.frontWheel.r-12)}" fill="none" stroke-width="12"/>
    <circle id="${rearWheelId}" class="zone zone-off" cx="${body.rearWheel.x}" cy="${body.rearWheel.y}" r="${Math.max(42,body.rearWheel.r-12)}" fill="none" stroke-width="12"/>
    <path id="${barsId}" class="zone zone-off" d="${body.handlebar}" fill="none" stroke-width="16" stroke-linecap="round"/>
    ${basketMarkup(frontBasketId,body.frontBasket)}${basketMarkup(rearBasketId,body.rearBasket)}
    <g id="${flagId}" class="flag-pole zone zone-off" fill="none" stroke-linecap="round"><path class="flag-pole-light" d="M${body.flag.x} ${body.flag.bottom}V${body.flag.top}" stroke-width="12"/><path d="M${body.flag.x+7} ${body.flag.top+6}H${body.flag.x+132}L${body.flag.x+98} ${body.flag.top+48}L${body.flag.x+132} ${body.flag.top+90}H${body.flag.x+7}Z" fill="#e9ecef" stroke="#2d333b" stroke-width="4"/></g>
    <g id="${pouchId}" class="zone zone-off solid-green-zone" stroke-width="6"><rect x="${body.pouch.x}" y="${body.pouch.y}" width="${body.pouch.w}" height="${body.pouch.h}" rx="12"/></g>
    <g id="${seatPouchId}" class="zone zone-off solid-green-zone" stroke-width="6"><path d="${body.seatPouch}"/></g>
    ${tailMarkup(tailId,body.tail.x,body.tail.y)}${signalsMarkup(signalId,body.signal)}
    <g id="${helmetId}" transform="translate(${body.helmet.x} ${body.helmet.y})"><path d="M0 70C0 20 35 0 75 0s75 20 75 70v15H0Z" fill="#d9dde5" stroke="#2d333b" stroke-width="8"/><path id="${helmetLightsId}" class="zone zone-off" d="M18 68C22 30 45 18 75 18s53 12 57 50" fill="none" stroke-width="12" stroke-linecap="round"/><circle id="${helmetFrontId}" cx="142" cy="70" r="10" fill="#b5bac3" stroke="#2d333b" stroke-width="4"/><circle id="${helmetRearId}" cx="8" cy="70" r="10" fill="#b5bac3" stroke="#2d333b" stroke-width="4"/></g>`;
}

function renderRearBike(prefix, label, centerX, scale) {
  const tailId = idFor(prefix, 'rearBrakeRearSvg');
  const signalId = idFor(prefix, 'turnSignalsRearSvg');
  return `<g transform="translate(${centerX} 145) scale(${scale})"><text x="0" y="-38" text-anchor="middle" font-size="24" font-weight="900" fill="#171a20">${label}</text><circle cx="0" cy="190" r="78" fill="#fff" stroke="#2d333b" stroke-width="14"/><path d="M0 42V222M-58 68H58" stroke="#2d333b" stroke-width="14" stroke-linecap="round"/>${tailMarkup(tailId,-40,105)}${signalsMarkup(signalId,{left:-122,right:51,y:124})}</g>`;
}

function renderRearViewPanel() {
  const panel = document.getElementById('rearViewPanel');
  const hasKid = selectedValue('addKidBike') === 'yes';
  panel.setAttribute('transform','translate(0 0)');
  panel.innerHTML = `<rect x="35" y="35" width="830" height="555" rx="28" fill="rgba(255,255,255,.96)" stroke="#171a20" stroke-width="6"/><text x="450" y="82" text-anchor="middle" font-size="26" font-weight="900" fill="#171a20">REAR SAFETY VIEW</text>${hasKid ? renderRearBike('', 'PRIMARY BICYCLE', 270, 1.05)+renderRearBike('kid','ADDITIONAL KID BICYCLE',630,.82) : renderRearBike('', 'PRIMARY BICYCLE',450,1.2)}`;
}

function zoneIds(mainId, includeKid=true) {
  return includeKid ? [mainId,idFor('kid',mainId)] : [mainId];
}

const zoneTargets = {
  frameLights: zoneIds('frameLightsSvg'), frontForks: zoneIds('frontForksSvg'), frontWheel: zoneIds('frontWheelSvg'), rearWheel: zoneIds('rearWheelSvg'), handlebars: zoneIds('handlebarsSvg'),
  frontBasket: zoneIds('frontBasketSvg'), rearBasket: zoneIds('rearBasketSvg'), pouch: zoneIds('handlebarPouchSvg'), seatPouch: zoneIds('seatPouchSvg'), flagPole: zoneIds('flagPoleSvg'),
  rearBrake: ['rearBrakeSvg','kidRearBrakeSvg','rearBrakeRearSvg','kidRearBrakeRearSvg'], turnSignals: ['turnSignalsSvg','kidTurnSignalsSvg','turnSignalsRearSvg','kidTurnSignalsRearSvg'], helmetLights: zoneIds('helmetLightsSvg')
};

const conditionalMap = { pouch:'pouchOptions',seatPouch:'seatPouchOptions',flagPole:'flagPoleOptions',appControl:'appControlOptions',rearBrake:'rearBrakeOptions',turnSignals:'turnSignalOptions',helmetLights:'helmetOptions' };

function setZone(ids, enabled) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.toggle('zone-on',enabled);
    element.classList.toggle('zone-off',!enabled);
  });
}

function fitTransform(body, requestedScale, centerX, availableWidth, bottomY) {
  const width = body.bounds.maxX-body.bounds.minX;
  const height = body.bounds.maxY-body.bounds.minY;
  const scale = Math.min(requestedScale*body.scale,availableWidth/width,535/height);
  const x = Math.round(centerX-((body.bounds.minX+body.bounds.maxX)/2)*scale);
  const y = Math.round(bottomY-body.bounds.maxY*scale);
  return {x,y,scale};
}

function applySideLayout() {
  const mainGroup = document.getElementById('mainBikeGroup');
  const kidGroup = document.getElementById('kidBikeGroup');
  const hasKid = selectedValue('addKidBike') === 'yes';
  const mainBody = bikeBodies[currentMainBody];
  const kidBody = bikeBodies[currentKidBody];
  const mainSize = sizeConfig[document.getElementById('frameSize').value];

  if (!hasKid) {
    mainTransform = fitTransform(mainBody,mainSize.scale,450,825,632);
    mainGroup.setAttribute('transform',`translate(${mainTransform.x} ${mainTransform.y}) scale(${mainTransform.scale})`);
    kidGroup.hidden = true;
  } else {
    const kidSize = sizeConfig[document.getElementById('kidFrameSize').value];
    mainTransform = fitTransform(mainBody,mainSize.scale,300,530,632);
    const kidTransform = fitTransform(kidBody,kidSize.scale*.82,700,300,632);
    mainGroup.setAttribute('transform',`translate(${mainTransform.x} ${mainTransform.y}) scale(${mainTransform.scale})`);
    kidGroup.setAttribute('transform',`translate(${kidTransform.x} ${kidTransform.y}) scale(${kidTransform.scale})`);
    kidGroup.hidden = false;
  }

  const gapCenter = (mainBody.rearWheel.x+mainBody.frontWheel.x)/2;
  const wheelBottom = Math.max(mainBody.rearWheel.y+mainBody.rearWheel.r,mainBody.frontWheel.y+mainBody.frontWheel.r);
  const iconScale = Math.max(.58,Math.min(.92,mainTransform.scale*.85));
  const iconX = Math.round(mainTransform.x+gapCenter*mainTransform.scale-72*iconScale);
  const iconY = Math.round(mainTransform.y+wheelBottom*mainTransform.scale-43*iconScale);
  document.getElementById('appControlIcons').setAttribute('transform',`translate(${iconX} ${iconY}) scale(${iconScale})`);

  const label = `${mainSize.label} · ${bikeStyleLabels[currentMainBody]}`;
  document.getElementById('sizeLabel').textContent = hasKid ? `${label} + additional ${bikeStyleLabels[currentKidBody]}` : label;
}

function updateConditionalOptions() {
  Object.entries(conditionalMap).forEach(([name,id]) => { document.getElementById(id).hidden=!isYes(name); });
  document.getElementById('kidBikeOptions').hidden=selectedValue('addKidBike')!=='yes';
}

function updateFlagPoleStyle() {
  const enabled=isYes('flagPole');
  const style=document.getElementById('flagPoleStyle').value;
  ['flagPoleSvg','kidFlagPoleSvg'].forEach((id) => {
    const group=document.getElementById(id); if(!group)return;
    group.classList.remove('flag-flash-red','flag-flash-orange','flag-solid-red');
    if(enabled){ if(style.includes('orange'))group.classList.add('flag-flash-orange'); else if(style.includes('flashing'))group.classList.add('flag-flash-red'); else group.classList.add('flag-solid-red'); }
  });
}

function updateTailLightStyle() {
  const enabled=isYes('rearBrake');
  const animated=document.getElementById('rearBrakeStyle').value==='animated center-out';
  ['rearBrakeSvg','kidRearBrakeSvg','rearBrakeRearSvg','kidRearBrakeRearSvg'].forEach((id)=>{const group=document.getElementById(id);if(!group)return;group.classList.toggle('tail-solid',enabled&&!animated);group.classList.toggle('tail-animated',enabled&&animated);});
}

function updateTurnSignalStyle() {
  const enabled=isYes('turnSignals');
  const animated=document.getElementById('turnSignalStyle').value==='animated directional gradient';
  ['turnSignalsSvg','kidTurnSignalsSvg','turnSignalsRearSvg','kidTurnSignalsRearSvg'].forEach((id)=>{const group=document.getElementById(id);if(!group)return;group.classList.toggle('signal-solid-orange',enabled&&!animated);group.classList.toggle('signal-animated',enabled&&animated);});
}

function updateAppControlIcons() {
  const enabled=isYes('appControl');
  const map={wifiIcon:document.getElementById('appWifi').checked,bluetoothIcon:document.getElementById('appBluetooth').checked,remoteIcon:document.getElementById('appRemote').checked};
  Object.entries(map).forEach(([id,selected])=>document.getElementById(id).classList.toggle('control-icon-on',enabled&&selected));
  document.getElementById('appControlIcons').classList.toggle('has-selection',enabled&&Object.values(map).some(Boolean));
}

function updateHelmetStyle() {
  const enabled=isYes('helmetLights');
  const red=document.getElementById('helmetRed').checked;
  const white=document.getElementById('helmetWhite').checked;
  ['helmetRearLight','kidHelmetRearLight'].forEach((id)=>document.getElementById(id)?.setAttribute('fill',enabled&&red?'#ff1f3d':'#b5bac3'));
  ['helmetFrontLight','kidHelmetFrontLight'].forEach((id)=>document.getElementById(id)?.setAttribute('fill',enabled&&white?'#fff':'#b5bac3'));
}

function updateViewMode() {
  const rearPanel=document.getElementById('rearViewPanel');
  const sideHidden=previewMode==='rear';
  document.getElementById('mainBikeGroup').hidden=sideHidden;
  document.getElementById('kidBikeGroup').hidden=sideHidden||selectedValue('addKidBike')!=='yes';
  document.getElementById('appControlIcons').hidden=sideHidden;
  rearPanel.hidden=!sideHidden;
}

function checkedValues(selector) { return [...document.querySelectorAll(`${selector}:checked`)].map((input)=>input.value); }

function humanLabel(name) {
  return ({frameLights:'Frame lights',frontForks:'Front-fork lights',frontWheel:'Front-wheel lights',rearWheel:'Rear-wheel lights',handlebars:'Handlebar lights',frontBasket:'Front basket',rearBasket:'Rear basket',pouch:'Handlebar pouch',seatPouch:'Rear pouch',flagPole:'Flag-pole LEDs',appControl:'App Control',rearBrake:'Rear tail light assembly',turnSignals:'Turn signals',helmetLights:'Helmet lights'})[name]||name;
}

function buildSummaryLines() {
  const mainSize=sizeConfig[document.getElementById('frameSize').value].label;
  const lines=[`Primary bike: ${mainSize}`,`Primary body: ${bikeStyleLabels[currentMainBody]}`];
  if(selectedValue('addKidBike')==='yes') lines.push(`Additional kid's bicycle: ${sizeConfig[document.getElementById('kidFrameSize').value].label}`,`Additional kid's body: ${bikeStyleLabels[currentKidBody]}`);
  Object.keys(yesNoDefaults).forEach((name)=>{if(isYes(name))lines.push(humanLabel(name));});
  if(isYes('flagPole'))lines.push(`Flag-pole style: ${document.getElementById('flagPoleStyle').value}`);
  if(isYes('pouch'))lines.push(`Handlebar pouch: ${document.getElementById('pouchStyle').value}; solid green preview`);
  if(isYes('seatPouch'))lines.push(`Rear pouch: ${document.getElementById('seatPouchStyle').value}; solid green preview`);
  if(isYes('rearBrake'))lines.push(`Tail-light style: ${document.getElementById('rearBrakeStyle').selectedOptions[0].textContent}`);
  if(isYes('turnSignals'))lines.push(`Turn-signal style: ${document.getElementById('turnSignalStyle').selectedOptions[0].textContent}`);
  if(isYes('appControl')){const values=checkedValues('.app-control-option');lines.push(`App Control methods: ${values.length?values.join(', '):'none selected'}`);}
  if(isYes('helmetLights')){const values=checkedValues('.helmet-option');lines.push(`Helmet options: ${values.length?values.join(', '):'lighting requested; details not selected'}`);}
  lines.push(`Suggested budget: $${Number(budgetSelect.value).toLocaleString()}`);
  return lines;
}

function updateSummary() {
  summaryList.innerHTML=buildSummaryLines().map((line)=>`<li>${line}</li>`).join('');
  budgetBadge.textContent=`Budget: $${Number(budgetSelect.value).toLocaleString()}`;
}

function renderAllBikes() {
  currentMainBody=document.getElementById('bikeStyle').value;
  currentKidBody=document.getElementById('kidBikeStyle').value;
  renderSideBike(document.getElementById('mainBikeGroup'),currentMainBody,'');
  renderSideBike(document.getElementById('kidBikeGroup'),currentKidBody,'kid');
  renderRearViewPanel();
}

function updateBuilder() {
  renderAllBikes();
  Object.entries(zoneTargets).forEach(([name,ids])=>setZone(ids,isYes(name)));
  updateConditionalOptions();
  applySideLayout();
  updateFlagPoleStyle();updateTailLightStyle();updateTurnSignalStyle();updateAppControlIcons();updateHelmetStyle();
  updateSummary();updateViewMode();
}

function isRearSafetyControl(target) {
  const name=target.name||'';
  const id=target.id||'';
  if((name==='rearBrake'||name==='turnSignals')&&target.value==='yes')return true;
  if(id==='rearBrakeStyle'&&isYes('rearBrake'))return true;
  if(id==='turnSignalStyle'&&isYes('turnSignals'))return true;
  return false;
}

injectBuilderControlsAndStyles();
document.querySelectorAll('[data-yes-no]').forEach(createYesNoControls);
for(let amount=100;amount<=2000;amount+=50){const option=document.createElement('option');option.value=String(amount);option.textContent=`$${amount.toLocaleString()}`;option.selected=amount===300;budgetSelect.appendChild(option);}

form.addEventListener('change',(event)=>{
  previewMode=isRearSafetyControl(event.target)?'rear':'side';
  updateBuilder();
});

form.addEventListener('reset',()=>setTimeout(()=>{
  document.querySelectorAll('[data-yes-no]').forEach((container)=>{const name=container.dataset.yesNo;const value=yesNoDefaults[name]||'no';document.getElementById(`${name}${value==='yes'?'Yes':'No'}`).checked=true;});
  document.getElementById('bikeStyle').value='comfort';document.getElementById('kidBikeStyle').value='balance';
  document.getElementById('appWifi').checked=true;document.getElementById('appBluetooth').checked=false;document.getElementById('appRemote').checked=false;
  budgetSelect.value='300';copyStatus.textContent='';previewMode='side';updateBuilder();
},0));

document.getElementById('copyBuild').addEventListener('click',async()=>{
  const text=`SHYNETYME WORKS — BUILD MY BIKE\n\n${buildSummaryLines().map((line)=>`• ${line}`).join('\n')}`;
  try{await navigator.clipboard.writeText(text);copyStatus.textContent='Build summary copied.';}catch(error){const area=document.createElement('textarea');area.value=text;document.body.appendChild(area);area.select();document.execCommand('copy');area.remove();copyStatus.textContent='Build summary copied.';}
});

updateBuilder();
