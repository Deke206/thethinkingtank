(() => {
  'use strict';

  const STORAGE_KEY = 'shynetymeSimAutoBuildV1';
  const ZONES = {
    underglow: { label: 'Underglow', estimate: [180, 420], step: 2 },
    'rocker-panels': { label: 'Rocker boards', estimate: [120, 280], step: 4 },
    'wheel-rings': { label: 'Wheel rings', estimate: [280, 680], step: 3 },
    'wheel-wells': { label: 'Wheel well lights', estimate: [220, 520], step: 3 },
    headlights: { label: 'Headlight accents', estimate: [180, 480], step: 4 },
    interior: { label: 'Interior lighting', estimate: [160, 460], step: 4 },
    'rear-accents': { label: 'Trunk / rear accents', estimate: [140, 380], step: 4 }
  };

  const STEPS = {
    1: { title: 'Choose your vehicle', next: 'Start selecting', section: 'vehicle', tip: 'Choose the body style that best matches the customer vehicle.' },
    2: { title: 'Select main lighting', next: 'Choose wheel lighting', section: 'zones', tip: 'Tap underglow or rocker boards to add a base lighting layer.' },
    3: { title: 'Add wheel lighting', next: 'Choose accents', section: 'zones', tip: 'Wheel rings light inside the rims; wheel wells light the arches.' },
    4: { title: 'Add accent lighting', next: 'Choose color and motion', section: 'zones', tip: 'Add headlights, interior glow, or rear accents.' },
    5: { title: 'Dial in the style', next: 'Review build', section: 'theme', tip: 'Change color, brightness, and animation while watching the live preview.' },
    6: { title: 'Review your build', next: 'Open final review', section: 'review', tip: 'Confirm the selected zones and send the package into the installation request.' }
  };

  const COLOR_NAMES = {
    '#9b5cff': 'Electric purple',
    '#31e6ff': 'Icy cyan',
    '#48a9ff': 'Neon blue',
    '#55e6b5': 'Mint green',
    '#ffc562': 'Amber gold',
    '#ff5ab9': 'Hot magenta',
    '#ffffff': 'Pure white'
  };

  const EFFECT_NAMES = {
    solid: 'Solid',
    breathe: 'Breathe',
    chase: 'Chase',
    spectrum: 'Color spectrum'
  };

  const state = {
    step: 1,
    vehicle: 'sedan',
    view: 'side',
    selected: new Set(),
    color: '#9b5cff',
    effect: 'solid',
    brightness: 82
  };

  const root = document.documentElement;
  const stage = document.querySelector('[data-stage]');
  const zoneInputs = [...document.querySelectorAll('[data-zone-input]')];
  const summaryList = document.querySelector('[data-summary-list]');
  const stepTitle = document.querySelector('[data-step-title]');
  const stepNumber = document.querySelector('[data-step-number]');
  const nextButton = document.querySelector('[data-next]');
  const backButton = document.querySelector('[data-back]');
  const stageTip = document.querySelector('[data-stage-tip]');
  const inlineReview = document.querySelector('[data-inline-review]');
  const dialog = document.querySelector('[data-review-dialog]');
  const dialogReview = document.querySelector('[data-dialog-review]');
  const countNodes = [...document.querySelectorAll('[data-selected-count]')];

  function save() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        ...state,
        selected: [...state.selected]
      }));
    } catch (error) {
      // Storage can be unavailable in privacy modes or embedded previews.
    }
  }

  function load() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY));
      if (!saved || typeof saved !== 'object') return;
      if (Number.isInteger(saved.step) && STEPS[saved.step]) state.step = saved.step;
      if (typeof saved.vehicle === 'string') state.vehicle = saved.vehicle;
      if (['side', 'front', 'rear'].includes(saved.view)) state.view = saved.view;
      if (Array.isArray(saved.selected)) saved.selected.filter(id => ZONES[id]).forEach(id => state.selected.add(id));
      if (COLOR_NAMES[saved.color]) state.color = saved.color;
      if (EFFECT_NAMES[saved.effect]) state.effect = saved.effect;
      if (Number.isFinite(saved.brightness)) state.brightness = Math.min(100, Math.max(25, saved.brightness));
    } catch (error) {
      console.warn('SIM Auto state could not be restored.', error);
    }
  }

  function formatMoney(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
  }

  function estimate() {
    return [...state.selected].reduce((totals, id) => {
      totals[0] += ZONES[id].estimate[0];
      totals[1] += ZONES[id].estimate[1];
      return totals;
    }, [0, 0]);
  }

  function reviewMarkup() {
    const [low, high] = estimate();
    const selectedText = state.selected.size
      ? [...state.selected].map(id => ZONES[id].label).join(', ')
      : 'No zones selected';
    const estimateText = state.selected.size ? `${formatMoney(low)}–${formatMoney(high)}` : '$0';
    const vehicleLabel = document.querySelector('[data-vehicle-type]')?.selectedOptions[0]?.textContent || 'Four-door sedan';

    return `
      <div class="sim-review-grid">
        <div class="sim-review-row"><span>Vehicle</span><strong>${escapeHtml(vehicleLabel)}</strong></div>
        <div class="sim-review-row"><span>Lighting</span><strong>${escapeHtml(selectedText)}</strong></div>
        <div class="sim-review-row"><span>Theme</span><strong>${escapeHtml(COLOR_NAMES[state.color])}</strong></div>
        <div class="sim-review-row"><span>Effect</span><strong>${escapeHtml(EFFECT_NAMES[state.effect])} · ${state.brightness}%</strong></div>
        <div class="sim-review-row"><span>Estimate</span><strong>${escapeHtml(estimateText)}</strong></div>
      </div>`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
  }

  function toggleZone(id, force) {
    if (!ZONES[id]) return;
    const shouldSelect = typeof force === 'boolean' ? force : !state.selected.has(id);
    shouldSelect ? state.selected.add(id) : state.selected.delete(id);
    render();
  }

  function setStep(step) {
    const next = Math.min(6, Math.max(1, Number(step) || 1));
    state.step = next;
    render();
  }

  function setView(view) {
    if (!['side', 'front', 'rear'].includes(view)) return;
    state.view = view;
    render();
  }

  function renderZones() {
    zoneInputs.forEach(input => { input.checked = state.selected.has(input.value); });
    document.querySelectorAll('[data-zone-shape]').forEach(shape => {
      shape.classList.toggle('is-active', state.selected.has(shape.dataset.zoneShape));
    });
  }

  function renderView() {
    stage.dataset.view = state.view;
    document.querySelectorAll('[data-car-view]').forEach(svg => {
      svg.toggleAttribute('hidden', svg.dataset.carView !== state.view);
    });
    document.querySelectorAll('[data-view]').forEach(button => {
      const active = button.dataset.view === state.view;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', String(active));
    });
  }

  function renderStep() {
    const config = STEPS[state.step];
    stepTitle.textContent = config.title;
    stepNumber.textContent = String(state.step);
    nextButton.textContent = config.next;
    backButton.disabled = state.step === 1;
    stageTip.textContent = config.tip;

    document.querySelectorAll('[data-step-section]').forEach(section => {
      const visible = section.dataset.stepSection === config.section;
      section.setAttribute('aria-hidden', String(!visible));
    });

    document.querySelectorAll('[data-step]').forEach(item => {
      const itemStep = Number(item.dataset.step);
      item.classList.toggle('is-active', itemStep === state.step);
      item.classList.toggle('is-complete', itemStep < state.step);
      item.querySelector('button').setAttribute('aria-current', itemStep === state.step ? 'step' : 'false');
    });

    if (state.step === 6) inlineReview.innerHTML = reviewMarkup();
  }

  function renderSummary() {
    countNodes.forEach(node => { node.textContent = String(state.selected.size); });
    summaryList.replaceChildren();

    if (!state.selected.size) {
      const empty = document.createElement('p');
      empty.className = 'sim-empty-summary';
      empty.textContent = 'No lighting zones selected yet.';
      summaryList.append(empty);
    } else {
      [...state.selected].forEach(id => {
        const row = document.createElement('div');
        row.className = 'sim-summary-item';
        const label = document.createElement('span');
        label.textContent = ZONES[id].label;
        const remove = document.createElement('button');
        remove.type = 'button';
        remove.textContent = '×';
        remove.setAttribute('aria-label', `Remove ${ZONES[id].label}`);
        remove.addEventListener('click', () => toggleZone(id, false));
        row.append(label, remove);
        summaryList.append(row);
      });
    }

    const [low, high] = estimate();
    document.querySelector('[data-estimate]').textContent = state.selected.size ? `${formatMoney(low)}–${formatMoney(high)}` : '$0';
    document.querySelector('[data-theme-name]').textContent = COLOR_NAMES[state.color];
    document.querySelector('[data-effect-label]').textContent = `${EFFECT_NAMES[state.effect]} · ${state.brightness}% brightness`;
  }

  function renderTheme() {
    root.style.setProperty('--sim-active-light', state.color);
    root.style.setProperty('--sim-light-alpha', String(state.brightness / 100));
    stage.dataset.effect = state.effect;
    document.querySelector('[data-theme-dot]').style.background = state.color;
    document.querySelector('[data-theme-dot]').style.boxShadow = `0 0 12px ${state.color}`;
    document.querySelector('[data-brightness]').value = String(state.brightness);
    document.querySelector('[data-brightness-output]').textContent = `${state.brightness}%`;
    document.querySelector('[data-effect-mode]').value = state.effect;
    document.querySelectorAll('input[name="theme-color"]').forEach(input => { input.checked = input.value.toLowerCase() === state.color.toLowerCase(); });
  }

  function renderVehicle() {
    const select = document.querySelector('[data-vehicle-type]');
    select.value = state.vehicle;
    const label = select.selectedOptions[0]?.textContent || 'Four-door sedan';
    document.querySelector('#vehicle-preview-heading').textContent = label;
  }

  function render() {
    renderVehicle();
    renderTheme();
    renderZones();
    renderView();
    renderStep();
    renderSummary();
    save();
    window.dispatchEvent(new CustomEvent('simAutoBuildChange', { detail: getPayload() }));
  }

  function getPayload() {
    const [estimateLow, estimateHigh] = estimate();
    const vehicleSelect = document.querySelector('[data-vehicle-type]');
    return {
      vehicleType: state.vehicle,
      vehicleLabel: vehicleSelect?.selectedOptions[0]?.textContent || state.vehicle,
      view: state.view,
      selectedZones: [...state.selected].map(id => ({ id, label: ZONES[id].label })),
      themeColor: state.color,
      themeName: COLOR_NAMES[state.color],
      effect: state.effect,
      effectName: EFFECT_NAMES[state.effect],
      brightness: state.brightness,
      estimateLow,
      estimateHigh
    };
  }

  function openReview() {
    dialogReview.innerHTML = reviewMarkup();
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
  }

  function sendToContact() {
    const payload = getPayload();
    try {
      sessionStorage.setItem('shynetymeSimAutoSelections', JSON.stringify(payload));
    } catch (error) {
      // Continue to the request form even when storage is unavailable.
    }
    const params = new URLSearchParams({
      source: 'sim-auto',
      vehicle: payload.vehicleLabel,
      autoZones: payload.selectedZones.map(item => item.label).join(', '),
      ledTheme: `${payload.themeName} / ${payload.effectName} / ${payload.brightness}%`,
      estimate: payload.selectedZones.length ? `${formatMoney(payload.estimateLow)}–${formatMoney(payload.estimateHigh)}` : '$0'
    });
    window.location.href = `../contact.html?${params.toString()}`;
  }

  zoneInputs.forEach(input => input.addEventListener('change', () => toggleZone(input.value, input.checked)));

  document.querySelectorAll('[data-zone-hit]').forEach(hit => {
    const activate = () => toggleZone(hit.dataset.zoneHit);
    hit.addEventListener('click', activate);
    hit.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        activate();
      }
    });
  });

  document.querySelectorAll('[data-view]').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));
  document.querySelectorAll('[data-step] button').forEach(button => button.addEventListener('click', () => setStep(button.closest('[data-step]').dataset.step)));

  document.querySelector('[data-vehicle-type]').addEventListener('change', event => {
    state.vehicle = event.target.value;
    render();
  });

  document.querySelectorAll('input[name="theme-color"]').forEach(input => input.addEventListener('change', () => {
    state.color = input.value.toLowerCase();
    render();
  }));

  document.querySelector('[data-effect-mode]').addEventListener('change', event => {
    state.effect = event.target.value;
    render();
  });

  document.querySelector('[data-brightness]').addEventListener('input', event => {
    state.brightness = Number(event.target.value);
    render();
  });

  backButton.addEventListener('click', () => setStep(state.step - 1));
  nextButton.addEventListener('click', () => {
    if (state.step < 6) setStep(state.step + 1);
    else openReview();
  });

  document.querySelector('[data-clear]').addEventListener('click', () => {
    state.selected.clear();
    state.step = 1;
    state.color = '#9b5cff';
    state.effect = 'solid';
    state.brightness = 82;
    render();
  });

  document.querySelector('[data-request-build]').addEventListener('click', sendToContact);

  const navToggle = document.querySelector('.sim-nav-toggle');
  const navLinks = document.querySelector('.sim-nav-links');
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  window.getSimAutoBuild = getPayload;
  window.setSimAutoZones = ids => {
    state.selected.clear();
    (Array.isArray(ids) ? ids : []).filter(id => ZONES[id]).forEach(id => state.selected.add(id));
    render();
  };

  load();
  render();
})();
