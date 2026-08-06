const CONFIG = Object.freeze({
  minimumSubmitMs: 3000,
  maximumFormAgeMs: 7 * 24 * 60 * 60 * 1000,
  maximumRequestBytes: 64 * 1024,
  maximumMessageLength: 5000,
  maximumBuildSummaryLength: 12000
});

const schemaStatements = Object.freeze([
  `CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lead_id TEXT NOT NULL UNIQUE,
    submitted_at TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    source TEXT NOT NULL DEFAULT 'contact-page',
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL DEFAULT '',
    zip_code TEXT NOT NULL DEFAULT '',
    preferred_contact TEXT NOT NULL DEFAULT '',
    project_type TEXT NOT NULL,
    budget TEXT NOT NULL DEFAULT '',
    timeline TEXT NOT NULL DEFAULT '',
    message TEXT NOT NULL,
    build_summary TEXT NOT NULL DEFAULT '',
    page_url TEXT NOT NULL DEFAULT '',
    user_agent TEXT NOT NULL DEFAULT '',
    consent TEXT NOT NULL,
    submission_token TEXT NOT NULL UNIQUE,
    owner_notification_status TEXT NOT NULL DEFAULT 'not_configured',
    processing_notes TEXT NOT NULL DEFAULT ''
  )`,
  "CREATE INDEX IF NOT EXISTS idx_leads_submitted_at ON leads(submitted_at DESC)",
  "CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status)",
  "CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email)"
]);

export default {
  async fetch(request, env, ctx) {
    const requestUrl = new URL(request.url);

    if (!requestUrl.pathname.startsWith("/api/leads")) {
      return jsonResponse({ ok: false, message: "Not found." }, 404, request);
    }

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: responseHeaders(request)
      });
    }

    if (request.method === "GET") {
      return handleHealthCheck(request, env);
    }

    if (request.method !== "POST") {
      return jsonResponse({ ok: false, message: "Method not allowed." }, 405, request, {
        Allow: "GET, POST, OPTIONS"
      });
    }

    return handleLeadSubmission(request, env, ctx);
  }
};

async function handleHealthCheck(request, env) {
  try {
    await ensureSchema(env);
    await env.DB.prepare("SELECT 1 AS ok").first();
    return jsonResponse({
      ok: true,
      service: "ShyneTyme lead receiver",
      storage: true
    }, 200, request);
  } catch (error) {
    console.error(JSON.stringify({
      event: "health_check_failed",
      error: errorMessage(error)
    }));

    return jsonResponse({
      ok: false,
      service: "ShyneTyme lead receiver",
      storage: false
    }, 503, request);
  }
}

async function handleLeadSubmission(request, env, ctx) {
  const origin = request.headers.get("Origin");
  if (!isAllowedOrigin(origin, env)) {
    return jsonResponse({
      type: "shynetyme-lead-result",
      ok: false,
      message: "This submission origin is not allowed."
    }, 403, request);
  }

  const declaredLength = Number(request.headers.get("Content-Length") || 0);
  if (declaredLength > CONFIG.maximumRequestBytes) {
    return jsonResponse({
      type: "shynetyme-lead-result",
      ok: false,
      message: "The request is too large."
    }, 413, request);
  }

  let payload;
  try {
    payload = await readPayload(request);
  } catch (error) {
    return jsonResponse({
      type: "shynetyme-lead-result",
      ok: false,
      message: errorMessage(error) === "REQUEST_TOO_LARGE"
        ? "The request is too large."
        : "The submitted form could not be read."
    }, errorMessage(error) === "REQUEST_TOO_LARGE" ? 413 : 400, request);
  }

  const token = cleanText(payload.form_token, 160);

  try {
    if (cleanText(payload.website, 200)) {
      return jsonResponse({
        type: "shynetyme-lead-result",
        ok: true,
        leadId: createLeadId(),
        token
      }, 200, request);
    }

    const lead = validateLead(payload, token);
    await ensureSchema(env);

    const existingLead = await findLeadByToken(env, lead.token);
    if (existingLead) {
      return jsonResponse({
        type: "shynetyme-lead-result",
        ok: true,
        leadId: existingLead,
        token: lead.token,
        duplicate: true
      }, 200, request);
    }

    const leadId = createLeadId();
    const submittedAt = new Date().toISOString();

    const insertResult = await env.DB.prepare(
      `INSERT OR IGNORE INTO leads (
        lead_id,
        submitted_at,
        status,
        source,
        name,
        email,
        phone,
        zip_code,
        preferred_contact,
        project_type,
        budget,
        timeline,
        message,
        build_summary,
        page_url,
        user_agent,
        consent,
        submission_token,
        owner_notification_status,
        processing_notes
      ) VALUES (?, ?, 'New', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Yes', ?, ?, ?)`
    ).bind(
      leadId,
      submittedAt,
      lead.source,
      lead.name,
      lead.email,
      lead.phone,
      lead.zipCode,
      lead.preferredContact,
      lead.projectType,
      lead.budget,
      lead.timeline,
      lead.message,
      lead.buildSummary,
      lead.pageUrl,
      lead.userAgent,
      lead.token,
      env.NOTIFY_OWNER ? "pending" : "not_configured",
      env.NOTIFY_OWNER
        ? "Lead stored; owner notification queued."
        : "Lead stored; owner email binding is not configured."
    ).run();

    let confirmedLeadId = leadId;
    const rowsChanged = Number(insertResult?.meta?.changes || 0);
    if (rowsChanged === 0) {
      confirmedLeadId = await findLeadByToken(env, lead.token);
      if (!confirmedLeadId) throw new Error("LEAD_INSERT_FAILED");
    }

    if (env.NOTIFY_OWNER && rowsChanged > 0) {
      ctx.waitUntil(sendOwnerNotification(env, confirmedLeadId, lead));
    }

    console.log(JSON.stringify({
      event: "lead_stored",
      leadId: confirmedLeadId,
      source: lead.source,
      projectType: lead.projectType,
      duplicate: rowsChanged === 0
    }));

    return jsonResponse({
      type: "shynetyme-lead-result",
      ok: true,
      leadId: confirmedLeadId,
      token: lead.token,
      duplicate: rowsChanged === 0
    }, 201, request);
  } catch (error) {
    console.error(JSON.stringify({
      event: "lead_submission_failed",
      code: errorMessage(error)
    }));

    return jsonResponse({
      type: "shynetyme-lead-result",
      ok: false,
      message: publicErrorMessage(error),
      token
    }, validationStatus(error), request);
  }
}

async function readPayload(request) {
  const contentType = request.headers.get("Content-Type") || "";
  const rawBody = await request.text();

  if (new TextEncoder().encode(rawBody).byteLength > CONFIG.maximumRequestBytes) {
    throw new Error("REQUEST_TOO_LARGE");
  }

  if (contentType.includes("application/json")) {
    return rawBody ? JSON.parse(rawBody) : {};
  }

  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(rawBody));
  }

  throw new Error("UNSUPPORTED_CONTENT_TYPE");
}

function validateLead(payload, token) {
  if (!token) throw new Error("INVALID_TOKEN");

  const startedAt = Number(payload.form_started_at || 0);
  const elapsed = Date.now() - startedAt;

  if (!Number.isFinite(startedAt) || startedAt <= 0 || elapsed < CONFIG.minimumSubmitMs) {
    throw new Error("SUBMITTED_TOO_QUICKLY");
  }
  if (elapsed > CONFIG.maximumFormAgeMs) throw new Error("FORM_EXPIRED");

  const name = cleanText(payload.name, 120);
  const email = cleanText(payload.email, 254).toLowerCase();
  const projectType = cleanText(payload.project_type, 100);
  const message = cleanText(payload.message, CONFIG.maximumMessageLength);
  const consent = cleanText(payload.consent, 20).toLowerCase();

  if (name.length < 2) throw new Error("INVALID_NAME");
  if (!isValidEmail(email)) throw new Error("INVALID_EMAIL");
  if (!projectType) throw new Error("INVALID_PROJECT_TYPE");
  if (message.length < 10) throw new Error("INVALID_MESSAGE");
  if (!["yes", "true", "on", "1"].includes(consent)) throw new Error("CONSENT_REQUIRED");

  return {
    token,
    name,
    email,
    phone: cleanText(payload.phone, 60),
    zipCode: cleanText(payload.zip_code, 20),
    preferredContact: cleanText(payload.preferred_contact, 60),
    projectType,
    budget: cleanText(payload.budget, 80),
    timeline: cleanText(payload.timeline, 80),
    message,
    buildSummary: cleanText(payload.build_summary, CONFIG.maximumBuildSummaryLength),
    source: cleanText(payload.source, 80) || "contact-page",
    pageUrl: cleanText(payload.page_url, 500),
    userAgent: cleanText(payload.user_agent, 500)
  };
}

async function ensureSchema(env) {
  if (!env.DB) throw new Error("D1_BINDING_MISSING");
  await env.DB.batch(schemaStatements.map((sql) => env.DB.prepare(sql)));
}

async function findLeadByToken(env, token) {
  const result = await env.DB.prepare(
    "SELECT lead_id FROM leads WHERE submission_token = ? LIMIT 1"
  ).bind(token).first();

  return result?.lead_id ? String(result.lead_id) : "";
}

async function sendOwnerNotification(env, leadId, lead) {
  const ownerEmail = cleanText(env.OWNER_EMAIL, 254);
  const fromEmail = cleanText(env.FROM_EMAIL, 254);

  if (!ownerEmail || !fromEmail) {
    await markNotificationResult(
      env,
      leadId,
      "configuration_missing",
      "Owner notification binding exists, but OWNER_EMAIL or FROM_EMAIL is missing."
    );
    return;
  }

  const subject = `[${leadId}] New ${lead.projectType} request — ${lead.name}`;
  const text = [
    `Reference: ${leadId}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
    `Phone: ${lead.phone || "Not supplied"}`,
    `ZIP: ${lead.zipCode || "Not supplied"}`,
    `Preferred contact: ${lead.preferredContact || "Not supplied"}`,
    `Project type: ${lead.projectType}`,
    `Budget: ${lead.budget || "Not supplied"}`,
    `Timeline: ${lead.timeline || "Not supplied"}`,
    "",
    lead.message,
    lead.buildSummary ? `\nBuild summary:\n${lead.buildSummary}` : "",
    `\nSource: ${lead.source}`,
    `Page: ${lead.pageUrl || "Not supplied"}`
  ].filter(Boolean).join("\n");

  const html = `
    <h2>New ShyneTyme project request</h2>
    <p><strong>Reference:</strong> ${escapeHtml(leadId)}</p>
    <p>
      <strong>Name:</strong> ${escapeHtml(lead.name)}<br>
      <strong>Email:</strong> ${escapeHtml(lead.email)}<br>
      <strong>Phone:</strong> ${escapeHtml(lead.phone || "Not supplied")}<br>
      <strong>ZIP:</strong> ${escapeHtml(lead.zipCode || "Not supplied")}<br>
      <strong>Preferred contact:</strong> ${escapeHtml(lead.preferredContact || "Not supplied")}<br>
      <strong>Project:</strong> ${escapeHtml(lead.projectType)}<br>
      <strong>Budget:</strong> ${escapeHtml(lead.budget || "Not supplied")}<br>
      <strong>Timeline:</strong> ${escapeHtml(lead.timeline || "Not supplied")}
    </p>
    <h3>Message</h3>
    <p>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>
    ${lead.buildSummary
      ? `<h3>Build summary</h3><p>${escapeHtml(lead.buildSummary).replace(/\n/g, "<br>")}</p>`
      : ""}
    <p><small>Source: ${escapeHtml(lead.source)}<br>Page: ${escapeHtml(lead.pageUrl || "Not supplied")}</small></p>`;

  try {
    const result = await env.NOTIFY_OWNER.send({
      to: ownerEmail,
      from: { email: fromEmail, name: "ShyneTyme Works" },
      replyTo: lead.email,
      subject,
      text,
      html
    });

    await markNotificationResult(
      env,
      leadId,
      "sent",
      `Owner notification sent${result?.messageId ? ` (${result.messageId})` : ""}.`
    );
  } catch (error) {
    console.error(JSON.stringify({
      event: "owner_notification_failed",
      leadId,
      error: errorMessage(error)
    }));

    await markNotificationResult(
      env,
      leadId,
      "failed",
      "Owner notification failed; lead remains stored."
    );
  }
}

async function markNotificationResult(env, leadId, status, note) {
  await env.DB.prepare(
    `UPDATE leads
     SET owner_notification_status = ?,
         processing_notes = ?
     WHERE lead_id = ?`
  ).bind(status, note, leadId).run();
}

function isAllowedOrigin(origin, env) {
  if (!origin) return true;
  const allowed = String(env.ALLOWED_ORIGINS || "https://shynetyme.works")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowed.includes(origin);
}

function responseHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "no-referrer",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Accept",
    "Vary": "Origin"
  };

  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function jsonResponse(payload, status, request, extraHeaders = {}) {
  return Response.json(payload, {
    status,
    headers: {
      ...responseHeaders(request),
      ...extraHeaders
    }
  });
}

function createLeadId() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Los_Angeles",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23"
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.filter((part) => part.type !== "literal").map((part) => [part.type, part.value])
  );
  const stamp = `${values.year}${values.month}${values.day}-${values.hour}${values.minute}${values.second}`;
  const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase();
  return `STW-${stamp}-${suffix}`;
}

function cleanText(value, maximumLength) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maximumLength);
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function errorMessage(error) {
  return String(error?.message || error || "UNKNOWN_ERROR");
}

function validationStatus(error) {
  const code = errorMessage(error);
  return [
    "INVALID_TOKEN",
    "SUBMITTED_TOO_QUICKLY",
    "FORM_EXPIRED",
    "INVALID_NAME",
    "INVALID_EMAIL",
    "INVALID_PROJECT_TYPE",
    "INVALID_MESSAGE",
    "CONSENT_REQUIRED"
  ].includes(code) ? 400 : 500;
}

function publicErrorMessage(error) {
  const code = errorMessage(error);
  const messages = {
    INVALID_TOKEN: "The request could not be verified. Refresh the page and try again.",
    SUBMITTED_TOO_QUICKLY: "Please review the form and try again in a moment.",
    FORM_EXPIRED: "This form was open too long. Refresh the page and submit again.",
    INVALID_NAME: "Enter your name and try again.",
    INVALID_EMAIL: "Enter a valid email address and try again.",
    INVALID_PROJECT_TYPE: "Choose a project type and try again.",
    INVALID_MESSAGE: "Add a little more project detail and try again.",
    CONSENT_REQUIRED: "Consent is required before the request can be submitted."
  };

  return messages[code] ||
    "The request could not be completed. Your entries remain on the page; retry or use the email fallback.";
}
