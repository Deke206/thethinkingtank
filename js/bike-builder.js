const form = document.getElementById('bikeBuilderForm');
const summaryList = document.getElementById('buildSummary');
const budgetSelect = document.getElementById('budget');
const budgetBadge = document.getElementById('budgetBadge');
const copyStatus = document.getElementById('copyStatus');

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
  toddler: { label: 'Toddler / balance bike', scale: 0.67 },
  preschool: { label: 'Small child / preschool bicycle', scale: 0.76 },
  youth: { label: 'Youth bicycle', scale: 0.86 },
  teen: { label: 'Teen / small-adult bicycle', scale: 0.95 },
  adult: { label: 'Adult bicycle', scale: 1 }
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
  const translateX = Math.round((1 - config.scale) * 440);
  const translateY = Math.round((1 - config.scale) * 530);
  group.setAttribute('transform', `translate(${translateX} ${translateY}) scale(${config.scale})`);
  document.getElementById('sizeLabel').textContent = config.label;

  const addKid = selectedValue('addKidBike') === 'yes';
  const kidGroup = document.getElementById('kidBikeGroup');
  const kidOptions = document.getElementById('kidBikeOptions');
  kidGroup.hidden = !addKid;
  kidOptions.hidden = !addKid;
  if (addKid) {
    const kidValue = document.getElementById('kidFrameSize').value;
    const kidScaleMap = { toddler: 0.38, preschool: 0.46, youth: 0.54 };
    kidGroup.setAttribute('transform', `translate(505 430) scale(${kidScaleMap[kidValue] || 0.46})`);
  }
}

function updateConditionalOptions() {
  Object.entries(conditionalMap).forEach(([name, id]) => {
    document.getElementById(id).hidden = !isYes(name);
  });
  document.getElementById('preprogrammedOptions').hidden = isYes('appControl');
}

function updateStyles() {
  const flagShape = document.getElementById('flagShape');
  const flagStyle = document.getElementById('flagPoleStyle').value;
  const flagGroup = document.getElementById('flagPoleSvg');
  flagGroup.classList.remove('flag-pulse');
  let flagFill = '#6f42c1';
  if (flagStyle === 'RGB') flagFill = 'url(#rgbGradient)';
  if (flagStyle.includes('red')) { flagFill = '#dc3545'; flagGroup.classList.add('flag-pulse'); }
  if (flagStyle.includes('orange')) { flagFill = '#ff8a00'; flagGroup.classList.add('flag-pulse'); }
  flagShape.style.setProperty('fill', isYes('flagPole') ? flagFill : 'rgba(220,53,69,.04)', 'important');

  const brakeStyle = document.getElementById('rearBrakeStyle').value;
  const brakeText = document.getElementById('brakeText');
  const rearBrakeText = document.getElementById('rearBrakeRearText');
  const brakeGroups = [document.getElementById('rearBrakeSvg'), document.getElementById('rearBrakeRearSvg')];
  brakeGroups.forEach((group) => group.classList.remove('stop-pulse'));
  brakeText.textContent = brakeStyle === 'animated STOP' ? 'STOP' : 'BRAKE';
  rearBrakeText.textContent = brakeStyle === 'animated STOP' ? 'STOP' : 'BRAKE';
  if (isYes('rearBrake') && brakeStyle === 'animated STOP') brakeGroups.forEach((group) => group.classList.add('stop-pulse'));

  const signalStyle = document.getElementById('turnSignalStyle').value;
  const signalGroups = [document.getElementById('turnSignalsSvg'), document.getElementById('turnSignalsRearSvg')];
  signalGroups.forEach((group) => group.classList.toggle('signal-pulse', isYes('turnSignals') && signalStyle !== 'single orange color'));

  const helmetEnabled = isYes('helmetLights');
  const redSelected = document.getElementById('helmetRed').checked;
  const whiteSelected = document.getElementById('helmetWhite').checked;
  document.getElementById('helmetRearLight').setAttribute('fill', helmetEnabled && redSelected ? '#ff1f3d' : '#b5bac3');
  document.getElementById('helmetFrontLight').setAttribute('fill', helmetEnabled && whiteSelected ? '#ffffff' : '#b5bac3');
}

function updateRearView() {
  const showRear = isYes('rearBasket') || isYes('rearBrake') || isYes('turnSignals');
  document.getElementById('rearViewPanel').hidden = !showRear;
}

function humanLabel(name) {
  const labels = {
    frameLights: 'Frame lights', frontForks: 'Front-fork lights', frontWheel: 'Front-wheel lights',
    rearWheel: 'Rear-wheel lights', handlebars: 'Handlebar lights', frontBasket: 'Front basket',
    rearBasket: 'Rear basket', pouch: 'Handlebar pouch', seatPouch: 'Seat pouch', flagPole: 'Flag pole',
    appControl: 'App control', rearBrake: 'Rear brake light', turnSignals: 'Turn signals', helmetLights: 'Helmet lights'
  };
  return labels[name] || name;
}

function buildSummaryLines() {
  const frameSize = sizeConfig[document.getElementById('frameSize').value].label;
  const lines = [`Primary bike: ${frameSize}`];
  if (selectedValue('addKidBike') === 'yes') {
    lines.push(`Additional kid's bike: ${sizeConfig[document.getElementById('kidFrameSize').value].label}`);
  }

  Object.keys(yesNoDefaults).forEach((name) => {
    if (name === 'appControl') return;
    if (isYes(name)) lines.push(humanLabel(name));
  });

  if (isYes('flagPole')) lines.push(`Flag style: ${document.getElementById('flagPoleStyle').value}`);
  if (isYes('pouch')) lines.push(`Handlebar pouch: ${document.getElementById('pouchStyle').value}`);
  if (isYes('seatPouch')) lines.push(`Seat pouch: ${document.getElementById('seatPouchStyle').value}`);
  if (isYes('rearBrake')) lines.push(`Brake-light style: ${document.getElementById('rearBrakeStyle').value}`);
  if (isYes('turnSignals')) lines.push(`Turn-signal style: ${document.getElementById('turnSignalStyle').value}`);

  if (isYes('helmetLights')) {
    const helmetChoices = [...document.querySelectorAll('.helmet-option:checked')].map((input) => input.value);
    lines.push(`Helmet options: ${helmetChoices.length ? helmetChoices.join(', ') : 'lighting requested; details not selected'}`);
  }

  lines.push(isYes('appControl') ? 'Controller: app-controlled' : `Controller: preprogrammed — ${document.getElementById('cycleStyle').value}`);
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
  updateStyles();
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
