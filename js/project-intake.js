(() => {
  'use strict';

  const STORAGE_KEY = 'shynetymeProjectDraftV1';
  const ENDPOINT = document.documentElement.dataset.intakeEndpoint || '';

  const readDraft = () => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
    catch { return {}; }
  };

  const writeDraft = (patch) => {
    const next = { ...readDraft(), ...patch, updatedAt: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('shynetyme:draft-updated', { detail: next }));
    return next;
  };

  const selectedValues = (form, name) => [...form.querySelectorAll(`[name="${name}"]:checked`)].map((el) => el.value);

  const serializeForm = (form) => {
    const data = Object.fromEntries(new FormData(form).entries());
    form.querySelectorAll('input[type="checkbox"][name]').forEach((el) => {
      data[el.name] = selectedValues(form, el.name);
    });
    return data;
  };

  const renderDraft = (target) => {
    if (!target) return;
    const draft = readDraft();
    const products = Array.isArray(draft.products) ? draft.products : [];
    const zones = Array.isArray(draft.installationAreas) ? draft.installationAreas : [];
    target.innerHTML = `
      <div class="intake-summary-card">
        <h3>Project selections</h3>
        <p><strong>Project:</strong> ${draft.projectType || 'Not selected'}</p>
        <p><strong>Installation areas:</strong> ${zones.length ? zones.join(', ') : 'None selected'}</p>
        <p><strong>Products:</strong> ${products.length ? products.map((p) => p.name || p).join(', ') : 'None selected'}</p>
      </div>`;
  };

  const submit = async (form) => {
    const status = form.querySelector('[data-form-status]');
    const submitButton = form.querySelector('[type="submit"]');
    const payload = {
      source: location.pathname,
      submittedAt: new Date().toISOString(),
      form: serializeForm(form),
      projectDraft: readDraft()
    };

    if (!ENDPOINT || ENDPOINT.includes('PASTE_APPS_SCRIPT')) {
      writeDraft({ customer: payload.form, pendingSubmission: payload });
      status.textContent = 'Saved on this device. Google submission will activate after the Apps Script web-app URL is added.';
      status.className = 'form-status form-status--warning';
      return;
    }

    submitButton.disabled = true;
    status.textContent = 'Sending request…';
    status.className = 'form-status';

    try {
      await fetch(ENDPOINT, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(payload)
      });
      localStorage.removeItem(STORAGE_KEY);
      form.reset();
      status.textContent = 'Request sent. Check your email for confirmation.';
      status.className = 'form-status form-status--success';
    } catch (error) {
      console.error(error);
      status.textContent = 'The request could not be sent. Your details remain saved on this device.';
      status.className = 'form-status form-status--error';
      writeDraft({ pendingSubmission: payload });
    } finally {
      submitButton.disabled = false;
    }
  };

  document.addEventListener('change', (event) => {
    const form = event.target.closest('[data-project-builder]');
    if (!form) return;
    writeDraft({
      projectType: form.dataset.projectBuilder,
      installationAreas: selectedValues(form, 'installation_areas'),
      builderDetails: serializeForm(form)
    });
    renderDraft(document.querySelector('[data-project-summary]'));
  });

  document.addEventListener('submit', (event) => {
    const form = event.target.closest('[data-google-intake-form]');
    if (!form) return;
    event.preventDefault();
    submit(form);
  });

  document.querySelectorAll('[data-add-product]').forEach((button) => {
    button.addEventListener('click', () => {
      const draft = readDraft();
      const products = Array.isArray(draft.products) ? draft.products : [];
      products.push({
        id: button.dataset.productId || '',
        name: button.dataset.productName || button.textContent.trim(),
        url: button.dataset.productUrl || location.href
      });
      writeDraft({ products });
      renderDraft(document.querySelector('[data-project-summary]'));
    });
  });

  window.ShyneTymeIntake = { readDraft, writeDraft, renderDraft };
  renderDraft(document.querySelector('[data-project-summary]'));
})();