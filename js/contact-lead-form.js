(() => {
  "use strict";

  if (window.ShynetymeLeadForm?.initialized) return;

  const config = window.ShynetymeLeadConfig || {};
  const form = document.querySelector("form.contact-form");
  if (!form) {
    window.ShynetymeLeadForm = { initialized: false, reason: "contact form not found" };
    return;
  }

  const fallbackEmail = config.fallbackEmail || "westsidelistingservices@gmail.com";
  const timeoutMs = Number(config.timeoutMs) > 0 ? Number(config.timeoutMs) : 25000;
  const endpoint = String(config.endpoint || "").trim();
  const fieldsRow = form.querySelector(".row.g-3");
  const messageColumn = form.querySelector("#contactMessage")?.closest(".col-12");
  const actionColumn = form.querySelector('button[type="submit"]')?.closest(".col-12");

  if (!fieldsRow || !messageColumn || !actionColumn) {
    window.ShynetymeLeadForm = { initialized: false, reason: "contact form structure changed" };
    return;
  }

  const makeToken = () => {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `stw-${Date.now()}-${Math.random().toString(36).slice(2, 12)}`;
  };

  const escapeMailValue = (value) => String(value || "").trim();
  const getField = (name) => form.elements.namedItem(name)?.value || "";

  const iframe = document.createElement("iframe");
  iframe.name = "shynetymeLeadReceiver";
  iframe.id = "shynetymeLeadReceiver";
  iframe.title = "ShyneTyme lead submission receiver";
  iframe.hidden = true;
  document.body.appendChild(iframe);

  const style = document.createElement("style");
  style.id = "shynetymeLeadFormStyles";
  style.textContent = `
    .shynetyme-honeypot{position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important}
    .lead-form-status{flex:1 1 100%;margin:0;padding:.8rem 1rem;border-radius:.75rem;border:1px solid transparent;line-height:1.45}
    .lead-form-status[hidden]{display:none!important}
    .lead-form-status--info{color:#d9f7ff;background:rgba(49,230,255,.09);border-color:rgba(49,230,255,.3)}
    .lead-form-status--success{color:#dcffe8;background:rgba(69,224,125,.1);border-color:rgba(69,224,125,.35)}
    .lead-form-status--error{color:#ffe1e7;background:rgba(255,85,119,.1);border-color:rgba(255,85,119,.4)}
    .lead-form-fallback{display:inline-flex;align-items:center;gap:.35rem;margin-left:auto}
    .lead-form-consent{padding:.9rem 1rem;border:1px solid rgba(255,255,255,.12);border-radius:.75rem;background:rgba(3,9,24,.45)}
    .contact-form.is-submitting{opacity:.82}
    .contact-form.is-submitting button[type="submit"]{pointer-events:none}
  `;
  document.head.appendChild(style);

  const insertBeforeMessage = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    messageColumn.before(template.content);
  };

  const zipField = document.getElementById("serviceZip")
    ? ""
    : `<div class="col-md-6">
        <label class="form-label" for="contactZip">ZIP code</label>
        <input class="form-control" id="contactZip" name="zip_code" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="10" placeholder="90034">
      </div>`;

  insertBeforeMessage(`
    ${zipField}
    <div class="col-md-6">
      <label class="form-label" for="preferredContact">Preferred contact</label>
      <select class="form-select" id="preferredContact" name="preferred_contact">
        <option value="Email">Email</option>
        <option value="Phone call">Phone call</option>
        <option value="Text message">Text message</option>
        <option value="WhatsApp">WhatsApp</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label" for="contactBudget">Approximate budget</label>
      <select class="form-select" id="contactBudget" name="budget">
        <option value="Not sure yet">Not sure yet</option>
        <option value="Under $250">Under $250</option>
        <option value="$250-$500">$250-$500</option>
        <option value="$500-$1,000">$500-$1,000</option>
        <option value="$1,000-$2,500">$1,000-$2,500</option>
        <option value="$2,500+">$2,500+</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label" for="contactTimeline">Preferred timeline</label>
      <select class="form-select" id="contactTimeline" name="timeline">
        <option value="Flexible">Flexible</option>
        <option value="As soon as possible">As soon as possible</option>
        <option value="Within 2 weeks">Within 2 weeks</option>
        <option value="Within 30 days">Within 30 days</option>
        <option value="Planning for later">Planning for later</option>
      </select>
    </div>
  `);

  const consentColumn = document.createElement("div");
  consentColumn.className = "col-12";
  consentColumn.innerHTML = `
    <div class="form-check lead-form-consent">
      <input class="form-check-input" id="contactConsent" name="consent" type="checkbox" value="yes" required>
      <label class="form-check-label" for="contactConsent">I agree that ShyneTyme Works may use this information to respond to my request and prepare an estimate. <a href="PRIVACY.md" target="_blank" rel="noopener">Privacy notice</a>.</label>
    </div>`;
  actionColumn.before(consentColumn);

  const status = document.createElement("p");
  status.className = "lead-form-status";
  status.id = "leadFormStatus";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  actionColumn.appendChild(status);

  const fallbackLink = document.createElement("a");
  fallbackLink.className = "lead-form-fallback";
  fallbackLink.textContent = "Email request instead";
  fallbackLink.href = `mailto:${fallbackEmail}`;
  actionColumn.appendChild(fallbackLink);

  const hiddenFields = {
    source: "contact-page",
    form_started_at: String(Date.now()),
    form_token: makeToken(),
    page_url: window.location.href,
    user_agent: navigator.userAgent,
    build_summary: ""
  };

  Object.entries(hiddenFields).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  if (!form.elements.namedItem("zip_code")) {
    const zipInput = document.createElement("input");
    zipInput.type = "hidden";
    zipInput.name = "zip_code";
    form.appendChild(zipInput);
  }

  const honeypot = document.createElement("div");
  honeypot.className = "shynetyme-honeypot";
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.innerHTML = '<label>Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label>';
  form.appendChild(honeypot);

  form.id = "shynetymeLeadForm";
  form.method = "post";
  form.target = iframe.name;
  form.enctype = "application/x-www-form-urlencoded";
  form.removeAttribute("action");

  const submitButton = form.querySelector('button[type="submit"]');
  const initialButtonText = submitButton?.textContent || "Send Request";
  let activeToken = "";
  let submitTimer = 0;

  const setStatus = (type, message) => {
    status.className = `lead-form-status lead-form-status--${type}`;
    status.textContent = message;
    status.hidden = false;
  };

  const setSubmitting = (submitting) => {
    form.classList.toggle("is-submitting", submitting);
    if (submitButton) {
      submitButton.disabled = submitting;
      submitButton.textContent = submitting ? "Sending…" : initialButtonText;
    }
  };

  const refreshSubmissionIdentity = () => {
    form.elements.namedItem("form_started_at").value = String(Date.now());
    form.elements.namedItem("form_token").value = makeToken();
    form.elements.namedItem("page_url").value = window.location.href;
    form.elements.namedItem("user_agent").value = navigator.userAgent;
  };

  const syncProjectDetails = () => {
    const serviceZip = getField("service_zip");
    if (serviceZip && form.elements.namedItem("zip_code")) {
      form.elements.namedItem("zip_code").value = serviceZip;
    }

    const details = [];
    const addDetail = (label, fieldName) => {
      const value = escapeMailValue(getField(fieldName));
      if (value) details.push(`${label}: ${value}`);
    };

    addDetail("Service address", "service_address");
    addDetail("Service city", "service_city");
    addDetail("Service state", "service_state");
    addDetail("Service ZIP", "service_zip");
    addDetail("Material delivery", "material_delivery");
    addDetail("Appointment timing", "appointment_timing");
    addDetail("Shipping address", "shipping_address");
    addDetail("Material deposit", "material_deposit_acknowledgement");

    const catalogSelections = escapeMailValue(getField("catalog_selections"));
    if (catalogSelections) details.push(`Catalog selections:\n${catalogSelections}`);

    const existingSummary = escapeMailValue(getField("build_summary"));
    const combined = [existingSummary, details.join("\n")].filter(Boolean).join("\n\n");
    form.elements.namedItem("build_summary").value = combined;
  };

  const buildMailto = () => {
    syncProjectDetails();
    const projectType = escapeMailValue(getField("project_type"));
    const subject = `ShyneTyme ${projectType || "LED"} project request`;
    const body = [
      `Name: ${escapeMailValue(getField("name"))}`,
      `Email: ${escapeMailValue(getField("email"))}`,
      `Phone: ${escapeMailValue(getField("phone"))}`,
      `ZIP: ${escapeMailValue(getField("zip_code"))}`,
      `Preferred contact: ${escapeMailValue(getField("preferred_contact"))}`,
      `Project type: ${projectType}`,
      `Budget: ${escapeMailValue(getField("budget"))}`,
      `Timeline: ${escapeMailValue(getField("timeline"))}`,
      "",
      escapeMailValue(getField("message")),
      "",
      escapeMailValue(getField("build_summary"))
    ].filter(Boolean).join("\n");
    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const applyStoredBuild = () => {
    try {
      const stored = sessionStorage.getItem("shynetymeLeadDraft")
        || localStorage.getItem("shynetymeContactDraft");
      if (!stored) return;
      const draft = JSON.parse(stored);
      if (!draft || typeof draft !== "object") return;
      if (draft.projectType && form.elements.namedItem("project_type")) form.elements.namedItem("project_type").value = draft.projectType;
      if (draft.budget && form.elements.namedItem("budget")) form.elements.namedItem("budget").value = draft.budget;
      const draftSummary = draft.summary || (Array.isArray(draft.project) ? draft.project.map((item) => item.productName || item.name || item.key).filter(Boolean).join(", ") : "");
      if (draftSummary) {
        form.elements.namedItem("build_summary").value = String(draftSummary);
        if (!getField("message")) form.elements.namedItem("message").value = "I completed a ShyneTyme simulator build and would like the next steps for an estimate.";
        setStatus("info", "Your simulator selections were attached to this request.");
      }
    } catch {
      // Ignore malformed or unavailable browser storage.
    }
  };

  fallbackLink.addEventListener("click", () => {
    fallbackLink.href = buildMailto();
  });

  window.addEventListener("message", (event) => {
    if (event.source !== iframe.contentWindow) return;
    const data = event.data;
    if (!data || data.type !== "shynetyme-lead-result" || data.token !== activeToken) return;

    window.clearTimeout(submitTimer);
    setSubmitting(false);

    if (data.ok) {
      const reference = data.leadId ? ` Reference: ${data.leadId}.` : "";
      setStatus("success", `Request received. Deke has your project details.${reference}`);
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          event_category: "contact",
          project_type: getField("project_type") || "unknown",
          lead_reference: data.leadId || ""
        });
      }
      form.reset();
      sessionStorage.removeItem("shynetymeLeadDraft");
      localStorage.removeItem("shynetymeContactDraft");
      refreshSubmissionIdentity();
      activeToken = "";
      return;
    }

    setStatus("error", data.message || "The request could not be confirmed. Your entries are still here; retry or use the email fallback.");
    activeToken = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    status.hidden = true;

    if (!form.reportValidity()) return;

    if (getField("website")) {
      setStatus("success", "Request received.");
      form.reset();
      refreshSubmissionIdentity();
      return;
    }

    syncProjectDetails();
    fallbackLink.href = buildMailto();

    if (!endpoint) {
      setStatus("error", "Online submission is not deployed yet. Use “Email request instead” so no project details are lost.");
      return;
    }

    activeToken = form.elements.namedItem("form_token").value;
    form.action = endpoint;
    setSubmitting(true);
    setStatus("info", "Sending your request securely…");

    window.clearTimeout(submitTimer);
    submitTimer = window.setTimeout(() => {
      setSubmitting(false);
      setStatus("error", "No confirmation was received. Your entries are still here; retry once or use the email fallback.");
      activeToken = "";
    }, timeoutMs);

    HTMLFormElement.prototype.submit.call(form);
  });

  applyStoredBuild();
  refreshSubmissionIdentity();

  window.ShynetymeLeadForm = {
    initialized: true,
    form,
    endpointConfigured: Boolean(endpoint),
    buildMailto
  };
})();
