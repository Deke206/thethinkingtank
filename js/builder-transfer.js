(() => {
  const STORAGE_KEY = 'shynetyme.builderPlan.v1';
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  const builderForm = document.getElementById('bikeBuilderForm') || document.getElementById('vehicleBuilderForm');

  const builderConfigs = {
    'build-my-bike.html': {
      key: 'bike',
      builderName: 'Build My Bike',
      projectType: 'Bicycle or e-bike',
      base: [2, 3],
      minimum: [5, 6],
      options: {
        addKidBike: [3, 5],
        frameLights: [.5, .75],
        frontForks: [.5, .75],
        frontWheel: [.5, .75],
        rearWheel: [.5, .75],
        handlebars: [.5, .75],
        frontBasket: [.5, .75],
        rearBasket: [.75, 1.25],
        pouch: [.4, .75],
        seatPouch: [.4, .75],
        flagPole: [.5, 1],
        appControl: [.75, 1.25],
        rearBrake: [.5, .75],
        turnSignals: [.75, 1.25],
        helmetLights: [.4, .75]
      }
    },
    'build-my-auto.html': {
      key: 'auto',
      builderName: 'Build My Auto',
      projectType: 'Automobile',
      base: [6, 8],
      minimum: [8, 10],
      options: {
        underbody: [5, 6],
        frontWheelWell: [1.5, 2.5],
        rearWheelWell: [1.5, 2.5],
        frontWheelRim: [1.5, 2],
        rearWheelRim: [1.5, 2],
        dashboardConsole: [3, 5],
        doorPanels: [4, 6],
        frontFootwells: [2, 3],
        rearFootwells: [2, 3],
        appControl: [2, 3]
      }
    },
    'build-my-yacht.html': {
      key: 'yacht',
      builderName: 'Build My Yacht',
      projectType: 'Yacht or boat',
      base: [8, 12],
      minimum: [10, 14],
      options: {
        railings: [4, 8],
        mast: [3, 6],
        foredeck: [3, 6],
        aftDeck: [3, 6],
        portGangway: [2, 4],
        starboardGangway: [2, 4],
        salonGalley: [4, 8],
        sleepingQuarters: [3, 6],
        interiorPassage: [3, 5],
        appControl: [2, 4]
      }
    },
    'build-my-house.html': {
      key: 'house',
      builderName: 'Build My Home',
      projectType: 'Home, room or garage',
      base: [3, 5],
      minimum: [4, 6],
      options: {
        bedroomOneCeiling: [2, 4],
        bedroomTwoCeiling: [2, 4],
        bathroomVanity: [1.5, 3],
        kitchenCabinets: [3, 6],
        livingRoomPerimeter: [3, 6],
        hallwayLighting: [1.5, 3],
        garageCeiling: [3, 6],
        garageDoor: [2, 4],
        frontWindows: [2, 4],
        frontEntry: [1.5, 3],
        appControl: [1.5, 3]
      }
    }
  };

  const roundHalf = (value) => Math.round(value * 2) / 2;
  const formatHours = (value) => Number.isInteger(value) ? String(value) : value.toFixed(1);

  function selectedYesNames(form) {
    return [...form.querySelectorAll('input[type="radio"][value="yes"]:checked')]
      .map((input) => input.name)
      .filter(Boolean);
  }

  function laborEstimate(form, config) {
    let low = config.base[0];
    let high = config.base[1];

    selectedYesNames(form).forEach((name) => {
      const range = config.options[name] || [.5, 1];
      low += range[0];
      high += range[1];
    });

    low = Math.max(low, config.minimum[0]);
    high = Math.max(high, config.minimum[1], low);
    return {
      low: roundHalf(low),
      high: roundHalf(high)
    };
  }

  function estimateLabel(estimate) {
    return `${formatHours(estimate.low)}–${formatHours(estimate.high)} labor hours`;
  }

  function budgetValue(form) {
    const budget = form.querySelector('#budget');
    return budget && budget.value ? Number(budget.value) : null;
  }

  function visibleSummaryLines() {
    return [...document.querySelectorAll('#buildSummary li')]
      .map((item) => item.textContent.trim())
      .filter(Boolean);
  }

  function storageSet(plan) {
    const serialized = JSON.stringify(plan);
    try {
      window.localStorage.setItem(STORAGE_KEY, serialized);
      return;
    } catch (error) {
      window.sessionStorage.setItem(STORAGE_KEY, serialized);
    }
  }

  function storageGet() {
    let serialized = null;
    try {
      serialized = window.localStorage.getItem(STORAGE_KEY);
    } catch (error) {
      serialized = window.sessionStorage.getItem(STORAGE_KEY);
    }
    if (!serialized) return null;
    try {
      return JSON.parse(serialized);
    } catch (error) {
      return null;
    }
  }

  function storageRemove() {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
    try { window.sessionStorage.removeItem(STORAGE_KEY); } catch (error) { /* no-op */ }
  }

  function addMotionOverrides() {
    if (!document.querySelector('.vehicle-stage')) return;
    document.documentElement.classList.add('force-vehicle-planner-motion');
    if (document.getElementById('vehiclePlannerMotionOverride')) return;

    const style = document.createElement('style');
    style.id = 'vehiclePlannerMotionOverride';
    style.textContent = `
      html.force-vehicle-planner-motion .vehicle-zone.zone-on {
        animation: vehicleLedTravel 1.45s linear infinite !important;
        animation-play-state: running !important;
      }
      html.force-vehicle-planner-motion .vehicle-zone.zone-fill.zone-on {
        animation: vehicleZonePulse 1.35s ease-in-out infinite alternate !important;
        animation-play-state: running !important;
      }
      @media (max-width: 767.98px), (prefers-reduced-motion: reduce) {
        html.force-vehicle-planner-motion .vehicle-zone.zone-on {
          animation: vehicleLedTravel 1.45s linear infinite !important;
          animation-play-state: running !important;
        }
        html.force-vehicle-planner-motion .vehicle-zone.zone-fill.zone-on {
          animation: vehicleZonePulse 1.35s ease-in-out infinite alternate !important;
          animation-play-state: running !important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function setupBuilderTransfer() {
    const config = builderConfigs[currentPage];
    if (!builderForm || !config) return;

    const summaryBox = builderForm.querySelector('.summary-box');
    const summaryActions = summaryBox?.querySelector('.d-flex.flex-wrap.gap-2.mt-3');
    if (!summaryBox || !summaryActions) return;

    let laborNote = document.getElementById('planningLaborEstimate');
    if (!laborNote) {
      laborNote = document.createElement('div');
      laborNote.id = 'planningLaborEstimate';
      laborNote.className = 'small mt-3 p-2 rounded border border-info-subtle';
      summaryBox.querySelector('#buildSummary')?.insertAdjacentElement('afterend', laborNote);
    }

    let requestButton = document.getElementById('requestCurrentBuild');
    if (!requestButton) {
      requestButton = document.createElement('button');
      requestButton.id = 'requestCurrentBuild';
      requestButton.type = 'button';
      requestButton.className = 'btn btn-info fw-bold';
      requestButton.textContent = 'Request this installation';
      summaryActions.appendChild(requestButton);
    }

    const updateLaborNote = () => {
      const estimate = laborEstimate(builderForm, config);
      laborNote.innerHTML = `<strong>Planning labor:</strong> ${estimateLabel(estimate)}. Final labor and materials require photos, measurements and an inspection.`;
    };

    builderForm.addEventListener('change', () => window.setTimeout(updateLaborNote, 0));
    builderForm.addEventListener('reset', () => window.setTimeout(updateLaborNote, 0));

    requestButton.addEventListener('click', () => {
      const estimate = laborEstimate(builderForm, config);
      const plan = {
        version: 1,
        builderKey: config.key,
        builderName: config.builderName,
        projectType: config.projectType,
        sourcePage: currentPage,
        summaryLines: visibleSummaryLines(),
        budget: budgetValue(builderForm),
        laborLow: estimate.low,
        laborHigh: estimate.high,
        laborLabel: estimateLabel(estimate),
        createdAt: new Date().toISOString()
      };
      storageSet(plan);
      window.location.href = 'contact.html?builder-plan=1';
    });

    updateLaborNote();
  }

  function selectBudgetRange(select, budget) {
    if (!select || !Number.isFinite(budget)) return;
    let label = '$5,000 or more';
    if (budget < 500) label = '$100–$499';
    else if (budget < 1000) label = '$500–$999';
    else if (budget < 2500) label = '$1,000–$2,499';
    else if (budget < 5000) label = '$2,500–$4,999';

    const option = [...select.options].find((item) => item.textContent.trim() === label);
    if (option) select.value = option.value;
  }

  function ensureProjectTypeOption(select, label) {
    if (!select || !label) return;
    let option = [...select.options].find((item) => item.textContent.trim() === label);
    if (!option) {
      option = document.createElement('option');
      option.textContent = label;
      option.value = label;
      select.appendChild(option);
    }
    select.value = option.value;
  }

  function setupContactPrefill() {
    const selections = document.getElementById('builderSelections');
    const contactForm = selections?.closest('form');
    if (!selections || !contactForm) return;

    const projectType = document.getElementById('projectType');
    ensureProjectTypeOption(projectType, 'Home, room or garage');

    const plan = storageGet();
    if (!plan) return;

    ensureProjectTypeOption(projectType, plan.projectType);
    selectBudgetRange(document.getElementById('budgetRange'), Number(plan.budget));

    const summaryText = [
      `SHYNETYME WORKS — ${String(plan.builderName || 'BUILDER PLAN').toUpperCase()}`,
      '',
      ...(plan.summaryLines || []).map((line) => `• ${line}`),
      `• Planning labor estimate: ${plan.laborLabel || 'inspection required'}`,
      '• Estimate note: Labor and materials are not final until photos, measurements and access conditions are reviewed.'
    ].join('\n');
    selections.value = summaryText;

    const subject = contactForm.querySelector('input[name="_subject"]');
    if (subject) subject.value = `New ShyneTyme Works ${plan.projectType || 'installation'} request`;

    const hiddenValues = {
      'Builder source page': plan.sourcePage || '',
      'Planning labor estimate': plan.laborLabel || ''
    };
    Object.entries(hiddenValues).forEach(([name, value]) => {
      let input = contactForm.querySelector(`input[name="${name}"]`);
      if (!input) {
        input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        contactForm.appendChild(input);
      }
      input.value = value;
    });

    const row = contactForm.querySelector('.row.g-3');
    if (row && !document.getElementById('importedBuilderPlan')) {
      const notice = document.createElement('div');
      notice.id = 'importedBuilderPlan';
      notice.className = 'col-12';
      notice.innerHTML = `
        <div class="alert alert-info d-flex flex-wrap justify-content-between align-items-center gap-2 mb-0" role="status">
          <span><strong>Imported:</strong> ${plan.builderName || 'builder'} selections and ${plan.laborLabel || 'labor planning estimate'}.</span>
          <button class="btn btn-sm btn-outline-dark" type="button" id="clearImportedBuilderPlan">Clear imported plan</button>
        </div>`;
      row.prepend(notice);

      notice.querySelector('#clearImportedBuilderPlan')?.addEventListener('click', () => {
        storageRemove();
        selections.value = '';
        notice.remove();
      });
    }

    contactForm.addEventListener('submit', storageRemove, { once: true });
  }

  function addHomeBuilderLinks() {
    document.querySelectorAll('.builder-button-group').forEach((group) => {
      if (group.querySelector('a[href="build-my-house.html"]')) return;
      const link = document.createElement('a');
      link.className = 'btn btn-outline-light builder-choice-btn';
      link.href = 'build-my-house.html';
      link.textContent = 'Home';
      const requestLink = group.querySelector('a[href="contact.html"]');
      if (requestLink) group.insertBefore(link, requestLink);
      else group.appendChild(link);
    });

    const helper = document.getElementById('siteGuidePanel');
    if (helper && !helper.querySelector('a[href="build-my-house.html"]')) {
      const link = document.createElement('a');
      link.href = 'build-my-house.html';
      link.textContent = 'Home Builder';
      const catalog = helper.querySelector('a[href="catalog.html"]');
      if (catalog) helper.insertBefore(link, catalog);
      else helper.appendChild(link);
    }
  }

  addMotionOverrides();
  setupBuilderTransfer();
  setupContactPrefill();
  addHomeBuilderLinks();
})();
