const form = document.getElementById('bikeBuilderForm');
const summaryList = document.getElementById('buildSummary');
const budgetSelect = document.getElementById('budget');
const budgetBadge = document.getElementById('budgetBadge');
const copyStatus = document.getElementById('copyStatus');

function renderComfortBike() {
  const mainBike = document.getElementById('mainBikeGroup');
  const kidBike = document.getElementById('kidBikeGroup');

  mainBike.innerHTML = `
    <!-- Step-through comfort bicycle based on the customer's reference image -->
    <circle class="bike-tire" cx="245" cy="438" r="122"/>
    <circle class="bike-rim" cx="245" cy="438" r="99"/>
    <circle class="bike-tire" cx="665" cy="438" r="122"/>
    <circle class="bike-rim" cx="665" cy="438" r="99"/>

    <g class="bike-spoke">
      <path d="M245 339V537M146 438H344M175 368L315 508M175 508L315 368M245 339L245 537"/>
      <path d="M665 339V537M566 438H764M595 368L735 508M595 508L735 368M665 339L665 537"/>
    </g>

    <g aria-hidden="true">
      <path d="M132 421A122 122 0 0 1 352 382" style="stroke:#2d333b;fill:none;stroke-width:9;stroke-linecap:round"/>
      <path d="M552 421A122 122 0 0 1 772 382" style="stroke:#2d333b;fill:none;stroke-width:9;stroke-linecap:round"/>
      <path d="M214 309H360L385 333" style="stroke:#2d333b;fill:none;stroke-width:8;stroke-linecap:round;stroke-linejoin:round"/>
      <circle cx="450" cy="438" r="34" style="stroke:#2d333b;fill:#f8f9fa;stroke-width:9"/>
      <circle cx="450" cy="438" r="8" fill="#2d333b"/>
      <path d="M450 438L492 458M450 438L413 418" style="stroke:#2d333b;fill:none;stroke-width:7;stroke-linecap:round"/>
      <path d="M492 458H525M382 418H414" style="stroke:#2d333b;fill:none;stroke-width:7;stroke-linecap:round"/>
    </g>

    <g class="bike-metal">
      <path d="M245 438L450 438L382 286L245 438"/>
      <path d="M382 286C407 355 425 401 450 438"/>
      <path d="M382 286C418 352 449 350 482 326C520 298 536 252 568 238"/>
      <path d="M450 438C495 360 527 292 568 238"/>
      <path d="M568 220L584 278"/>
      <path d="M578 264L665 438"/>
      <path d="M595 262L680 435"/>
      <path d="M382 286L355 205"/>
      <path d="M322 195H390"/>
      <path d="M558 220L550 154L584 128"/>
      <path d="M548 151C571 139 590 139 614 149"/>
    </g>

    <g id="frameLightsSvg" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round">
      <path d="M245 438L450 438L382 286L245 438"/>
      <path d="M382 286C418 352 449 350 482 326C520 298 536 252 568 238"/>
      <path d="M450 438C495 360 527 292 568 238"/>
    </g>
    <g id="frontForksSvg" class="zone zone-off" fill="none" stroke-width="16" stroke-linecap="round">
      <path d="M578 264L665 438"/>
      <path d="M595 262L680 435"/>
    </g>
    <circle id="frontWheelSvg" class="zone zone-off" cx="665" cy="438" r="110" fill="none" stroke-width="12"/>
    <circle id="rearWheelSvg" class="zone zone-off" cx="245" cy="438" r="110" fill="none" stroke-width="12"/>
    <path id="handlebarsSvg" class="zone zone-off" d="M550 154L584 128M548 151C571 139 590 139 614 149" fill="none" stroke-width="16" stroke-linecap="round"/>

    <g id="frontBasketSvg" class="zone zone-off" stroke-width="8">
      <path d="M608 186H790L770 306H630Z"/>
      <path d="M620 220H784M625 258H778M664 190L654 300M720 190L710 300"/>
    </g>
    <g id="rearBasketSvg" class="zone zone-off" stroke-width="8">
      <path d="M92 246H235L222 348H108Z"/>
      <path d="M103 280H230M100 315H226M143 251L138 343M185 251L180 343"/>
    </g>

    <g id="flagPoleSvg" class="flag-pole zone zone-off" fill="none" stroke-linecap="round">
      <path id="flagPoleLight" d="M150 310V62" stroke-width="12"/>
      <path id="flagShape" d="M157 68H292L255 112L292 156H157Z" fill="#e9ecef" stroke="#2d333b" stroke-width="4"/>
      <text id="flagPoleModeLabel" x="165" y="47" font-size="15" font-weight="800" fill="#2d333b">FLAG-POLE LED</text>
    </g>

    <g id="handlebarPouchSvg" class="zone zone-off solid-green-zone" stroke-width="6">
      <rect x="540" y="164" width="88" height="54" rx="13"/>
    </g>
    <g id="seatPouchSvg" class="zone zone-off solid-green-zone" stroke-width="6">
      <path d="M332 214H397L386 266H345Z"/>
    </g>

    <g id="rearBrakeSvg" class="tail-light zone zone-off" stroke-width="5">
      <rect class="tail-housing" x="166" y="345" width="80" height="38" rx="8"/>
      <rect class="tail-pixel tail-outer" x="172" y="352" width="10" height="24" rx="2"/>
      <rect class="tail-pixel tail-inner" x="186" y="352" width="10" height="24" rx="2"/>
      <rect class="tail-pixel tail-center" x="200" y="352" width="12" height="24" rx="2"/>
      <rect class="tail-pixel tail-inner" x="216" y="352" width="10" height="24" rx="2"/>
      <rect class="tail-pixel tail-outer" x="230" y="352" width="10" height="24" rx="2"/>
    </g>

    <g id="turnSignalsSvg" class="turn-signal zone zone-off" stroke-width="3">
      <g id="rearSignalLeft" class="signal-arrow signal-left">
        <path class="signal-segment signal-step-3" d="M106 365L139 337V353H151V378H139V394Z"/>
        <rect class="signal-segment signal-step-2" x="151" y="353" width="13" height="25" rx="2"/>
        <rect class="signal-segment signal-step-1" x="164" y="353" width="13" height="25" rx="2"/>
      </g>
      <g id="rearSignalRight" class="signal-arrow signal-right">
        <rect class="signal-segment signal-step-1" x="235" y="353" width="13" height="25" rx="2"/>
        <rect class="signal-segment signal-step-2" x="248" y="353" width="13" height="25" rx="2"/>
        <path class="signal-segment signal-step-3" d="M306 365L273 337V353H261V378H273V394Z"/>
      </g>
    </g>

    <g id="helmetSvg" transform="translate(430 60)">
      <path d="M0 70C0 20 35 0 75 0s75 20 75 70v15H0Z" fill="#d9dde5" stroke="#2d333b" stroke-width="8"/>
      <path id="helmetLightsSvg" class="zone zone-off" d="M18 68C22 30 45 18 75 18s53 12 57 50" fill="none" stroke-width="12" stroke-linecap="round"/>
      <circle id="helmetFrontLight" cx="142" cy="70" r="10" fill="#fff" stroke="#2d333b" stroke-width="4"/>
      <circle id="helmetRearLight" cx="8" cy="70" r="10" fill="#b5bac3" stroke="#2d333b" stroke-width="4"/>
    </g>`;

  kidBike.innerHTML = `
    <circle class="bike-tire" cx="120" cy="220" r="88"/>
    <circle class="bike-rim" cx="120" cy="220" r="70"/>
    <circle class="bike-tire" cx="420" cy="220" r="88"/>
    <circle class="bike-rim" cx="420" cy="220" r="70"/>
    <g class="bike-metal">
      <path d="M120 220L270 220L225 103L120 220"/>
      <path d="M225 103C246 162 265 160 292 140C314 123 331 93 350 90"/>
      <path d="M270 220L350 90M350 90L420 220M225 103L207 48M180 42H225M348 89L345 38L372 20"/>
    </g>
    <path id="kidFrameSvg" class="zone zone-off" d="M120 220L270 220L225 103L120 220M225 103C246 162 265 160 292 140C314 123 331 93 350 90M270 220L350 90" fill="none" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
    <circle id="kidFrontWheelSvg" class="zone zone-off" cx="420" cy="220" r="78" fill="none" stroke-width="12"/>
    <circle id="kidRearWheelSvg" class="zone zone-off" cx="120" cy="220" r="78" fill="none" stroke-width="12"/>
    <path id="kidFlagSvg" class="zone zone-off" d="M90 120V-30" fill="none" stroke-width="10"/>
    <text x="250" y="340" text-anchor="middle" font-size="34" font-weight="800" fill="#2d333b">Added kid's bike</text>`;
}

renderComfortBike();

const yesNoDefaults = {
  frameLights: 'yes',
  frontForks: 'no',
  frontWheel: 'yes',
  rearWheel: 'yes',
  handlebars: 'no',
  frontBasket: 'no',
  rearBasket: 'no',
  pouch: 'no',
  seatPouch: 'no',
  flagPole: 'no',
  appControl: 'yes',
  rearBrake: 'yes',
  turnSignals: 'no',
  helmetLights: 'no'
};

function createYesNoControls(container) {
  const name = container.dataset.yesNo;
  const defaultValue = yesNoDefaults[name] || 'no';
  container.innerHTML = `
    <input class="btn-check" type="radio" name="${name}" id="${name}Yes" value="yes" ${defaultValue === 'yes' ? 'checked' : ''}>
    <label class="btn btn-outline-success" for="${name}Yes">Yes</label>
    <input class="btn-check" type="radio" name="${name}" id="${name}No" value="no" ${defaultValue === 'no' ? 'checked' : ''}>
    <label class="btn btn-outline-danger" for="${name}No">No</label>`;
}

document.querySelectorAll('[data-yes-no]').forEach(createYesNoControls);

for (let amount = 100; amount <= 2000; amount += 50) {
  const option = document.createElement('option');
  option.value = String(amount);
  option.textContent = `$${amount.toLocaleString()}`;
  option.selected = amount === 300;
  budgetSelect.appendChild(option);
}

const sizeConfig = {
  toddler: { label: 'Toddler / balance bike', scale: 0.66 },
  preschool: { label: 'Small child / preschool bicycle', scale: 0.75 },
  youth: { label: 'Youth bicycle', scale: 0.85 },
  teen: { label: 'Teen / small-adult bicycle', scale: 0.94 },
  adult: { label: 'Adult Bicycle', scale: 1 }
};

const zoneTargets = {
  frameLights: ['frameLightsSvg', 'kidFrameSvg'],
  frontForks: ['frontForksSvg'],
  frontWheel: ['frontWheelSvg', 'kidFrontWheelSvg'],
  rearWheel: ['rearWheelSvg', 'kidRearWheelSvg'],
  handlebars: ['handlebarsSvg'],
  frontBasket: ['frontBasketSvg'],
  rearBasket: ['rearBasketSvg', 'rearBasketRearSvg'],
  pouch: ['handlebarPouchSvg'],
  seatPouch: ['seatPouchSvg'],
  flagPole: ['flagPoleSvg', 'kidFlagSvg'],
  rearBrake: ['rearBrakeSvg', 'rearBrakeRearSvg'],
  turnSignals: ['turnSignalsSvg', 'turnSignalsRearSvg'],
  helmetLights: ['helmetLightsSvg']
};

const conditionalMap = {
  pouch: 'pouchOptions',
  seatPouch: 'seatPouchOptions',
  flagPole: 'flagPoleOptions',
  appControl: 'appControlOptions',
  rearBrake: 'rearBrakeOptions',
  turnSignals: 'turnSignalOptions',
  helmetLights: 'helmetOptions'
};

function selectedValue(name) {
  return form.querySelector(`input[name="${name}"]:checked`)?.value || 'no';
}

function isYes(name) {
  return selectedValue(name) === 'yes';
}

function setZone(ids, enabled) {
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (!element) return;
    element.classList.toggle('zone-on', enabled);
    element.classList.toggle('zone-off', !enabled);
  });
}

function updateBikeSize() {
  const value = document.getElementById('frameSize').value;
  const config = sizeConfig[value];
  const group = document.getElementById('mainBikeGroup');
  // Center the actual artwork and keep every frame size planted on one road line.
  const stageScale = config.scale * 1.05;
  const translateX = Math.round(450 - (441 * stageScale));
  const translateY = Math.round(642 - (560 * stageScale));
  group.setAttribute('transform', `translate(${translateX} ${translateY}) scale(${stageScale})`);
  document.getElementById('sizeLabel').textContent = config.label;

  const addKid = selectedValue('addKidBike') === 'yes';
  const kidGroup = document.getElementById('kidBikeGroup');
  const kidOptions = document.getElementById('kidBikeOptions');
  kidGroup.hidden = !addKid;
  kidOptions.hidden = !addKid;
  if (addKid) {
    const kidValue = document.getElementById('kidFrameSize').value;
    const kidScaleMap = { toddler: 0.38, preschool: 0.46, youth: 0.54 };
    const kidScale = kidScaleMap[kidValue] || 0.46;
    const kidTranslateY = Math.round(642 - (308 * kidScale));
    kidGroup.setAttribute('transform', `translate(505 ${kidTranslateY}) scale(${kidScale})`);
  }
}

function updateConditionalOptions() {
  Object.entries(conditionalMap).forEach(([name, id]) => {
    document.getElementById(id).hidden = !isYes(name);
  });
}

function updateFlagPoleStyle() {
  const enabled = isYes('flagPole');
  const style = document.getElementById('flagPoleStyle').value;
  const group = document.getElementById('flagPoleSvg');
  const pole = document.getElementById('flagPoleLight');
  const label = document.getElementById('flagPoleModeLabel');

  group.classList.remove('flag-flash-red', 'flag-flash-orange', 'flag-solid-red');
  if (enabled) {
    if (style === 'caution flashing color orange') group.classList.add('flag-flash-orange');
    else if (style === 'caution flashing color red') group.classList.add('flag-flash-red');
    else group.classList.add('flag-solid-red');
  }

  pole.style.opacity = enabled ? '1' : '.34';
  label.textContent = enabled ? style.toUpperCase() : 'FLAG-POLE LED';
  label.style.opacity = enabled ? '1' : '.45';
}

function updateTailLightStyle() {
  const enabled = isYes('rearBrake');
  const animated = document.getElementById('rearBrakeStyle').value === 'animated center-out';
  ['rearBrakeSvg', 'rearBrakeRearSvg'].forEach((id) => {
    const group = document.getElementById(id);
    group.classList.toggle('tail-solid', enabled && !animated);
    group.classList.toggle('tail-animated', enabled && animated);
  });
}

function updateTurnSignalStyle() {
  const enabled = isYes('turnSignals');
  const animated = document.getElementById('turnSignalStyle').value === 'animated directional gradient';
  ['turnSignalsSvg', 'turnSignalsRearSvg'].forEach((id) => {
    const group = document.getElementById(id);
    group.classList.toggle('signal-solid-orange', enabled && !animated);
    group.classList.toggle('signal-animated', enabled && animated);
  });
}

function updateAppControlIcons() {
  const enabled = isYes('appControl');
  const map = {
    wifiIcon: document.getElementById('appWifi').checked,
    bluetoothIcon: document.getElementById('appBluetooth').checked,
    remoteIcon: document.getElementById('appRemote').checked
  };

  Object.entries(map).forEach(([id, selected]) => {
    document.getElementById(id).classList.toggle('control-icon-on', enabled && selected);
  });
  document.getElementById('appControlIcons').classList.toggle('has-selection', enabled && Object.values(map).some(Boolean));
}

function updateHelmetStyle() {
  const helmetEnabled = isYes('helmetLights');
  const redSelected = document.getElementById('helmetRed').checked;
  const whiteSelected = document.getElementById('helmetWhite').checked;
  document.getElementById('helmetRearLight').setAttribute('fill', helmetEnabled && redSelected ? '#ff1f3d' : '#b5bac3');
  document.getElementById('helmetFrontLight').setAttribute('fill', helmetEnabled && whiteSelected ? '#ffffff' : '#b5bac3');
}

function updateSpecialStyles() {
  updateFlagPoleStyle();
  updateTailLightStyle();
  updateTurnSignalStyle();
  updateAppControlIcons();
  updateHelmetStyle();
}

function updateRearView() {
  const showRear = isYes('rearBasket') || isYes('rearBrake') || isYes('turnSignals');
  document.getElementById('rearViewPanel').hidden = !showRear;
}

function humanLabel(name) {
  const labels = {
    frameLights: 'Frame lights',
    frontForks: 'Front-fork lights',
    frontWheel: 'Front-wheel lights',
    rearWheel: 'Rear-wheel lights',
    handlebars: 'Handlebar lights',
    frontBasket: 'Front basket',
    rearBasket: 'Rear basket',
    pouch: 'Handlebar pouch',
    seatPouch: 'Rear pouch',
    flagPole: 'Flag-pole LEDs',
    appControl: 'App Control',
    rearBrake: 'Rear tail light assembly',
    turnSignals: 'Turn signals',
    helmetLights: 'Helmet lights'
  };
  return labels[name] || name;
}

function checkedValues(selector) {
  return [...document.querySelectorAll(`${selector}:checked`)].map((input) => input.value);
}

function buildSummaryLines() {
  const frameSize = sizeConfig[document.getElementById('frameSize').value].label;
  const lines = [`Primary bike: ${frameSize}`];
  if (selectedValue('addKidBike') === 'yes') {
    lines.push(`Additional kid's bike: ${sizeConfig[document.getElementById('kidFrameSize').value].label}`);
  }

  Object.keys(yesNoDefaults).forEach((name) => {
    if (isYes(name)) lines.push(humanLabel(name));
  });

  if (isYes('flagPole')) lines.push(`Flag-pole style: ${document.getElementById('flagPoleStyle').value}`);
  if (isYes('pouch')) lines.push(`Handlebar pouch: ${document.getElementById('pouchStyle').value}; solid green preview`);
  if (isYes('seatPouch')) lines.push(`Rear pouch: ${document.getElementById('seatPouchStyle').value}; solid green preview`);
  if (isYes('rearBrake')) lines.push(`Tail-light style: ${document.getElementById('rearBrakeStyle').selectedOptions[0].textContent}`);
  if (isYes('turnSignals')) lines.push(`Turn-signal style: ${document.getElementById('turnSignalStyle').selectedOptions[0].textContent}`);

  if (isYes('appControl')) {
    const controls = checkedValues('.app-control-option');
    lines.push(`App Control methods: ${controls.length ? controls.join(', ') : 'none selected'}`);
  }

  if (isYes('helmetLights')) {
    const helmetChoices = checkedValues('.helmet-option');
    lines.push(`Helmet options: ${helmetChoices.length ? helmetChoices.join(', ') : 'lighting requested; details not selected'}`);
  }

  lines.push(`Suggested budget: $${Number(budgetSelect.value).toLocaleString()}`);
  return lines;
}

function updateSummary() {
  const lines = buildSummaryLines();
  summaryList.innerHTML = lines.map((line) => `<li>${line}</li>`).join('');
  budgetBadge.textContent = `Budget: $${Number(budgetSelect.value).toLocaleString()}`;
}

function updateBuilder() {
  Object.entries(zoneTargets).forEach(([name, ids]) => setZone(ids, isYes(name)));
  updateBikeSize();
  updateConditionalOptions();
  updateRearView();
  updateSpecialStyles();
  updateSummary();
}

form.addEventListener('change', updateBuilder);

form.addEventListener('reset', () => {
  setTimeout(() => {
    document.querySelectorAll('[data-yes-no]').forEach((container) => {
      const name = container.dataset.yesNo;
      const value = yesNoDefaults[name] || 'no';
      const input = document.getElementById(`${name}${value === 'yes' ? 'Yes' : 'No'}`);
      if (input) input.checked = true;
    });
    document.getElementById('appWifi').checked = true;
    document.getElementById('appBluetooth').checked = false;
    document.getElementById('appRemote').checked = false;
    budgetSelect.value = '300';
    copyStatus.textContent = '';
    updateBuilder();
  }, 0);
});

document.getElementById('copyBuild').addEventListener('click', async () => {
  const text = `THE THINKING TANK LED — BUILD MY BIKE\n\n${buildSummaryLines().map((line) => `• ${line}`).join('\n')}`;
  try {
    await navigator.clipboard.writeText(text);
    copyStatus.textContent = 'Build summary copied.';
  } catch (error) {
    const area = document.createElement('textarea');
    area.value = text;
    document.body.appendChild(area);
    area.select();
    document.execCommand('copy');
    area.remove();
    copyStatus.textContent = 'Build summary copied.';
  }
});

updateBuilder();
