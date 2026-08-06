(() => {
  "use strict";

  if (window.ShynetymeLeadForm?.initialized) return;

  const config = window.ShynetymeLeadConfig || {};
  const form = document.querySelector("form.contact-form");
  const row = form?.querySelector(".row.g-3");
  const messageCol = form?.querySelector("#contactMessage")?.closest(".col-12");
  const actionCol = form?.querySelector('button[type="submit"]')?.closest(".col-12");

  if (!form || !row || !messageCol || !actionCol) {
    window.ShynetymeLeadForm = { initialized: false, reason: "contact form structure changed" };
    return;
  }

  const endpoint = String(config.endpoint || "").trim();
  const fallbackEmail = config.fallbackEmail || "westsidelistingservices@gmail.com";
  const timeoutMs = Number(config.timeoutMs) || 25000;
  const get = (name) => form.elements.namedItem(name)?.value || "";
  const clean = (value) => String(value || "").trim();

  const token = () => {
    if (crypto.randomUUID) return crypto.randomUUID();
    const values = new Uint32Array(4);
    crypto.getRandomValues(values);
    return `stw-${Date.now()}-${Array.from(values).join("-")}`;
  };

  const addBeforeMessage = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html.trim();
    messageCol.before(template.content);
  };

  if (!document.getElementById("shynetymeLeadFormStyles")) {
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
      .contact-form.is-submitting button[type="submit"]{pointer-events:none}`;
    document.head.appendChild(style);
  }

  addBeforeMessage(`
    ${document.getElementById("serviceZip") ? "" : `
      <div class="col-md-6">
        <label class="form-label" for="contactZip">ZIP code</label>
        <input class="form-control" id="contactZip" name="zip_code" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="10" placeholder="90034">
      </div>`}
    <div class="col-md-6">
      <label class="form-label" for="preferredContact">Preferred contact</label>
      <select class="form-select" id="preferredContact" name="preferred_contact">
        <option>Email</option><option>Phone call</option><option>Text message</option><option>WhatsApp</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label" for="contactBudget">Approximate budget</label>
      <select class="form-select" id="contactBudget" name="budget">
        <option>Not sure yet</option><option>Under $250</option><option>$250-$500</option>
        <option>$500-$1,000</option><option>$1,000-$2,500</option><option>$2,500+</option>
      </select>
    </div>
    <div class="col-md-6">
      <label class="form-label" for="contactTimeline">Preferred timeline</label>
      <select class="form-select" id="contactTimeline" name="timeline">
        <option>Flexible</option><option>As soon as possible</option><option>Within 2 weeks</option>
        <option>Within 30 days</option><option>Planning for later</option>
      </select>
    </div>`);

  const consent = document.createElement("div");
  consent.className = "col-12";
  consent.innerHTML = `
    <div class="form-check lead-form-consent">
      <input class="form-check-input" id="contactConsent" name="consent" type="checkbox" value="yes" required>
      <label class="form-check-label" for="contactConsent">I agree that ShyneTyme Works may use this information to respond to my request and prepare an estimate. <a href="PRIVACY.md" target="_blank" rel="noopener">Privacy notice</a>.</label>
    </div>`;
  actionCol.before(consent);

  const status = document.createElement("p");
  status.className = "lead-form-status";
  status.setAttribute("role", "status");
  status.setAttribute("aria-live", "polite");
  status.hidden = true;
  actionCol.appendChild(status);

  const fallback = document.createElement("a");
  fallback.className = "lead-form-fallback";
  fallback.textContent = "Email request instead";
  fallback.href = `mailto:${fallbackEmail}`;
  actionCol.appendChild(fallback);

  const hidden = {
    source: "contact-page",
    form_started_at: String(Date.now()),
    form_token: token(),
    page_url: location.href,
    user_agent: navigator.userAgent,
    build_summary: ""
  };

  Object.entries(hidden).forEach(([name, value]) => {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  });

  if (!form.elements.namedItem("zip_code")) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "zip_code";
    form.appendChild(input);
  }

  const honeypot = document.createElement("div");
  honeypot.className = "shynetyme-honeypot";
  honeypot.setAttribute("aria-hidden", "true");
  honeypot.innerHTML = '<label>Website <input name="website" type="text" tabindex="-1" autocomplete="off"></label>';
  form.appendChild(honeypot);

  form.id = "shynetymeLeadForm";
  ["action", "method", "target", "enctype"].forEach((attribute) => form.removeAttribute(attribute));

  const button = form.querySelector('button[type="submit"]');
  const buttonText = button?.textContent || "Send Request";
  let controller = null;

  const show = (type, text) => {
    status.className = `lead-form-status lead-form-status--${type}`;
    status.textContent = text;
    status.hidden = false;
  };

  const busy = (value) => {
    form.classList.toggle("is-submitting", value);
    if (button) {
      button.disabled = value;
      button.textContent = value ? "Sending…" : buttonText;
    }
  };

  const refresh = () => {
    form.elements.namedItem("form_started_at").value = String(Date.now());
    form.elements.namedItem("form_token").value = token();
    form.elements.namedItem("page_url").value = location.href;
    form.elements.namedItem("user_agent").value = navigator.userAgent;
  };

  const syncDetails = () => {
    if (get("service_zip")) form.elements.namedItem("zip_code").value = get("service_zip");

    const details = [];
    [
      ["Service address", "service_address"], ["Service city", "service_city"],
      ["Service state", "service_state"], ["Service ZIP", "service_zip"],
      ["Material delivery", "material_delivery"], ["Appointment timing", "appointment_timing"],
      ["Shipping address", "shipping_address"], ["Material deposit", "material_deposit_acknowledgement"]
    ].forEach(([label, name]) => {
      if (clean(get(name))) details.push(`${label}: ${clean(get(name))}`);
    });

    if (clean(get("catalog_selections"))) {
      details.push(`Catalog selections:\n${clean(get("catalog_selections"))}`);
    }

    const summary = [clean(get("build_summary")), details.join("\n")].filter(Boolean).join("\n\n");
    form.elements.namedItem("build_summary").value = summary;
  };

  const mailto = () => {
    syncDetails();
    const project = clean(get("project_type"));
    const body = [
      `Name: ${clean(get("name"))}`, `Email: ${clean(get("email"))}`,
      `Phone: ${clean(get("phone"))}`, `ZIP: ${clean(get("zip_code"))}`,
      `Preferred contact: ${clean(get("preferred_contact"))}`, `Project type: ${project}`,
      `Budget: ${clean(get("budget"))}`, `Timeline: ${clean(get("timeline"))}`,
      "", clean(get("message")), "", clean(get("build_summary"))
    ].filter(Boolean).join("\n");
    return `mailto:${fallbackEmail}?subject=${encodeURIComponent(`ShyneTyme ${project || "LED"} project request`)}&body=${encodeURIComponent(body)}`;
  };

  try {
    const stored = sessionStorage.getItem("shynetymeLeadDraft") || localStorage.getItem("shynetymeContactDraft");
    const draft = stored ? JSON.parse(stored) : null;
    if (draft?.projectType && form.elements.namedItem("project_type")) {
      form.elements.namedItem("project_type").value = draft.projectType;
    }
    if (draft?.budget && form.elements.namedItem("budget")) {
      form.elements.namedItem("budget").value = draft.budget;
    }
    const summary = draft?.summary || (Array.isArray(draft?.project)
      ? draft.project.map((item) => item.productName || item.name || item.key).filter(Boolean).join(", ")
      : "");
    if (summary) {
      form.elements.namedItem("build_summary").value = String(summary);
      if (!get("message")) {
        form.elements.namedItem("message").value = "I completed a ShyneTyme simulator build and would like the next steps for an estimate.";
      }
      show("info", "Your simulator selections were attached to this request.");
    }
  } catch {
    // Ignore malformed browser storage.
  }

  fallback.addEventListener("click", () => {
    fallback.href = mailto();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    status.hidden = true;
    if (!form.reportValidity()) return;

    if (get("website")) {
      show("success", "Request received.");
      form.reset();
      refresh();
      return;
    }

    fallback.href = mailto();
    if (!endpoint) {
      show("error", "Online submission is not deployed yet. Use “Email request instead” so no project details are lost.");
      return;
    }

    syncDetails();
    const payload = Object.fromEntries(new FormData(form).entries());
    controller?.abort();
    controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    busy(true);
    show("info", "Sending your request securely…");

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "same-origin",
        signal: controller.signal
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || !data.ok) throw new Error(data.message || "The request could not be confirmed.");

      show("success", `Request received. Deke has your project details.${data.leadId ? ` Reference: ${data.leadId}.` : ""}`);
      if (typeof window.gtag === "function") {
        window.gtag("event", "generate_lead", {
          event_category: "contact",
          project_type: get("project_type") || "unknown",
          lead_reference: data.leadId || ""
        });
      }
      form.reset();
      sessionStorage.removeItem("shynetymeLeadDraft");
      localStorage.removeItem("shynetymeContactDraft");
      refresh();
    } catch (error) {
      show("error", error?.name === "AbortError"
        ? "No confirmation was received. Your entries are still here; retry once or use the email fallback."
        : `${error?.message || "The request could not be confirmed."} Your entries are still here; retry or use the email fallback.`);
    } finally {
      clearTimeout(timeout);
      busy(false);
      controller = null;
    }
  });

  refresh();
  window.ShynetymeLeadForm = { initialized: true, form, endpointConfigured: Boolean(endpoint), buildMailto: mailto };
})();
