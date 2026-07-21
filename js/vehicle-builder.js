(() => {
  const form = document.getElementById('vehicleBuilderForm');
  if (!form) return;

  const summaryList = document.getElementById('buildSummary');
  const budgetSelect = document.getElementById('budget');
  const budgetBadge = document.getElementById('budgetBadge');
  const copyStatus = document.getElementById('copyStatus');
  const viewLabel = document.getElementById('viewLabel');
  const builderName = form.dataset.builderName || 'Custom LED build';
  const subjectLabel = form.dataset.subjectLabel || builderName;
  const defaultView = form.dataset.defaultView || 'exterior';

  const yesNoContainers = [...form.querySelectorAll('[data-yes-no]')];
  const viewButtons = [...document.querySelectorAll('[data-view-button]')];
  const viewPanels = [...document.querySelectorAll('[data-preview-view]')];

  function createYesNoControls(container) {
    const name = container.dataset.yesNo;
    const defaultValue = container.dataset.default === 'yes' ? 'yes' : 'no';
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '');
    container.innerHTML = `
      <input class="btn-check" type="radio" name="${name}" id="${safeName}Yes" value="yes" ${defaultValue === 'yes' ? 'checked' : ''}>
      <label class="btn btn-outline-success" for="${safeName}Yes">Yes</label>
      <input class="btn-check" type="radio" name="${name}" id="${safeName}No" value="no" ${defaultValue === 'no' ? 'checked' : ''}>
      <label class="btn btn-outline-danger" for="${safeName}No">No</label>`;
  }

  yesNoContainers.forEach(createYesNoControls);

  if (budgetSelect) {
    const minimum = Number(budgetSelect.dataset.min || 100);
    const maximum = Number(budgetSelect.dataset.max || 2000);
    const step = Number(budgetSelect.dataset.step || 50);
    const defaultBudget = Number(budgetSelect.dataset.default || minimum);

    for (let amount = minimum; amount <= maximum; amount += step) {
      const option = document.createElement('option');
      option.value = String(amount);
      option.textContent = `$${amount.toLocaleString()}`;
      option.selected = amount === defaultBudget;
      budgetSelect.appendChild(option);
    }
  }

  function selectedValue(name) {
    return form.querySelector(`input[name="${name}"]:checked`)?.value || 'no';
  }

  function isYes(name) {
    return selectedValue(name) === 'yes';
  }

  function setView(viewName) {
    viewPanels.forEach((panel) => {
      const shouldHide = panel.dataset.previewView !== viewName;
      panel.toggleAttribute('hidden', shouldHide);
    });

    viewButtons.forEach((button) => {
      const selected = button.dataset.viewButton === viewName;
      button.classList.toggle('active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });

    const activeButton = viewButtons.find((button) => button.dataset.viewButton === viewName);
    if (viewLabel && activeButton) viewLabel.textContent = activeButton.dataset.viewLabel || activeButton.textContent.trim();
  }

  function setZone(name, enabled) {
    document.querySelectorAll(`[data-zone-target="${name}"]`).forEach((element) => {
      element.classList.toggle('zone-on', enabled);
      element.classList.toggle('zone-off', !enabled);
    });
  }

  function updateZones() {
    yesNoContainers.forEach((container) => {
      const name = container.dataset.yesNo;
      if (container.dataset.view) setZone(name, isYes(name));
    });
  }

  function updateConditionalOptions() {
    yesNoContainers.forEach((container) => {
      const targetId = container.dataset.conditionalTarget;
      if (!targetId) return;
      const target = document.getElementById(targetId);
      if (target) target.hidden = !isYes(container.dataset.yesNo);
    });
  }

  function updateControllerIcons() {
    const controlsEnabled = isYes('appControl');
    const selected = new Set(
      [...form.querySelectorAll('[data-controller-option]:checked')].map((input) => input.value)
    );

    document.querySelectorAll('[data-controller-icon]').forEach((icon) => {
      icon.classList.toggle('control-icon-on', controlsEnabled && selected.has(icon.dataset.controllerIcon));
    });
  }

  function summaryLines() {
    const lines = [`Project: ${subjectLabel}`];
    const selectedZones = yesNoContainers
      .filter((container) => container.dataset.view && isYes(container.dataset.yesNo))
      .map((container) => container.dataset.label || container.dataset.yesNo);

    lines.push(`Selected lighting zones: ${selectedZones.length ? selectedZones.join(', ') : 'none selected'}`);

    form.querySelectorAll('[data-summary-label]').forEach((field) => {
      const when = field.dataset.summaryWhen;
      if (when && !isYes(when)) return;
      const label = field.dataset.summaryLabel;
      const value = field.selectedOptions?.[0]?.textContent || field.value;
      if (value) lines.push(`${label}: ${value}`);
    });

    form.querySelectorAll('[data-summary-group]').forEach((group) => {
      const when = group.dataset.summaryWhen;
      if (when && !isYes(when)) return;
      const values = [...group.querySelectorAll('input[type="checkbox"]:checked')].map((input) => input.value);
      lines.push(`${group.dataset.summaryGroup}: ${values.length ? values.join(', ') : 'none selected'}`);
    });

    if (budgetSelect) lines.push(`Suggested budget: $${Number(budgetSelect.value).toLocaleString()}`);
    return lines;
  }

  function updateSummary() {
    const lines = summaryLines();
    if (summaryList) summaryList.innerHTML = lines.map((line) => `<li>${line}</li>`).join('');
    if (budgetBadge && budgetSelect) budgetBadge.textContent = `Budget: $${Number(budgetSelect.value).toLocaleString()}`;
  }

  function updateBuilder() {
    updateZones();
    updateConditionalOptions();
    updateControllerIcons();
    updateSummary();
  }

  viewButtons.forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.viewButton));
  });

  form.addEventListener('change', (event) => {
    const radio = event.target.closest('input[type="radio"]');
    const container = radio?.closest('[data-yes-no]');
    if (radio?.value === 'yes' && container?.dataset.view) setView(container.dataset.view);
    updateBuilder();
  });

  form.addEventListener('reset', () => {
    setTimeout(() => {
      yesNoContainers.forEach((container) => {
        const name = container.dataset.yesNo;
        const defaultValue = container.dataset.default === 'yes' ? 'yes' : 'no';
        const input = form.querySelector(`input[name="${name}"][value="${defaultValue}"]`);
        if (input) input.checked = true;
      });

      form.querySelectorAll('[data-default-checked]').forEach((input) => {
        input.checked = input.dataset.defaultChecked === 'true';
      });

      if (budgetSelect) budgetSelect.value = budgetSelect.dataset.default || budgetSelect.options[0]?.value;
      if (copyStatus) copyStatus.textContent = '';
      setView(defaultView);
      updateBuilder();
    }, 0);
  });

  document.getElementById('copyBuild')?.addEventListener('click', async () => {
    const text = `SHYNETYME WORKS — ${builderName.toUpperCase()}\n\n${summaryLines().map((line) => `• ${line}`).join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      if (copyStatus) copyStatus.textContent = 'Build summary copied.';
    } catch (error) {
      const area = document.createElement('textarea');
      area.value = text;
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      if (copyStatus) copyStatus.textContent = 'Build summary copied.';
    }
  });

  setView(defaultView);
  updateBuilder();
})();
