const CONFIG = Object.freeze({
  spreadsheetId: "1dAUOsAzglUq055e0EtFf1mXdzi_CfU748ND_QXGKW5Q",
  sheetName: "Leads",
  ownerEmail: "westsidelistingservices@gmail.com",
  siteName: "ShyneTyme Works",
  siteUrl: "https://shynetyme.works",
  minimumSubmitMs: 3000,
  maximumFormAgeMs: 7 * 24 * 60 * 60 * 1000,
  maximumMessageLength: 5000
});

function doGet() {
  return HtmlService.createHtmlOutput(
    "<!doctype html><html><body><h1>ShyneTyme lead receiver</h1><p>Service is running.</p></body></html>"
  );
}

function doPost(event) {
  const params = event && event.parameter ? event.parameter : {};
  const token = cleanText_(params.form_token, 160);

  try {
    if (cleanText_(params.website, 200)) {
      return responsePage_({
        type: "shynetyme-lead-result",
        ok: true,
        leadId: createLeadId_(),
        token: token
      });
    }

    const lead = validateLead_(params, token);
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);

    let result;
    try {
      result = saveLead_(lead);
    } finally {
      lock.releaseLock();
    }

    return responsePage_({
      type: "shynetyme-lead-result",
      ok: true,
      leadId: result.leadId,
      token: token
    });
  } catch (error) {
    console.error(error && error.stack ? error.stack : error);
    return responsePage_({
      type: "shynetyme-lead-result",
      ok: false,
      message: publicErrorMessage_(error),
      token: token
    });
  }
}

function validateLead_(params, token) {
  if (!token) throw new Error("INVALID_TOKEN");

  const startedAt = Number(params.form_started_at || 0);
  const elapsed = Date.now() - startedAt;
  if (!Number.isFinite(startedAt) || startedAt <= 0 || elapsed < CONFIG.minimumSubmitMs) {
    throw new Error("SUBMITTED_TOO_QUICKLY");
  }
  if (elapsed > CONFIG.maximumFormAgeMs) throw new Error("FORM_EXPIRED");

  const name = cleanText_(params.name, 120);
  const email = cleanText_(params.email, 254).toLowerCase();
  const message = cleanText_(params.message, CONFIG.maximumMessageLength);
  const projectType = cleanText_(params.project_type, 100);
  const consent = cleanText_(params.consent, 20).toLowerCase();

  if (name.length < 2) throw new Error("INVALID_NAME");
  if (!isValidEmail_(email)) throw new Error("INVALID_EMAIL");
  if (!projectType) throw new Error("INVALID_PROJECT_TYPE");
  if (message.length < 10) throw new Error("INVALID_MESSAGE");
  if (!["yes", "true", "on", "1"].includes(consent)) throw new Error("CONSENT_REQUIRED");

  return {
    token: token,
    name: name,
    email: email,
    phone: cleanText_(params.phone, 60),
    zipCode: cleanText_(params.zip_code, 20),
    preferredContact: cleanText_(params.preferred_contact, 60),
    projectType: projectType,
    budget: cleanText_(params.budget, 80),
    timeline: cleanText_(params.timeline, 80),
    message: message,
    buildSummary: cleanText_(params.build_summary, 12000),
    source: cleanText_(params.source, 80) || "contact-page",
    pageUrl: cleanText_(params.page_url, 500),
    userAgent: cleanText_(params.user_agent, 500),
    consent: "Yes"
  };
}

function saveLead_(lead) {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error("SHEET_NOT_FOUND");

  const duplicate = findLeadByToken_(sheet, lead.token);
  if (duplicate) return { leadId: duplicate, duplicate: true };

  const leadId = createLeadId_();
  const rowNumber = Math.max(sheet.getLastRow() + 1, 2);
  const row = [
    safeCell_(leadId),
    new Date(),
    "New",
    safeCell_(lead.source),
    safeCell_(lead.name),
    safeCell_(lead.email),
    safeCell_(lead.phone),
    safeCell_(lead.zipCode),
    safeCell_(lead.preferredContact),
    safeCell_(lead.projectType),
    safeCell_(lead.budget),
    safeCell_(lead.timeline),
    safeCell_(lead.message),
    safeCell_(lead.buildSummary),
    safeCell_(lead.pageUrl),
    safeCell_(lead.userAgent),
    safeCell_(lead.consent),
    "Lead stored; notifications pending.",
    safeCell_(lead.token)
  ];

  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  sheet.getRange(rowNumber, 2).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  sheet.getRange(rowNumber, 13, 1, 6).setWrap(true);
  SpreadsheetApp.flush();

  const notes = [];
  try {
    sendOwnerNotification_(leadId, lead);
    notes.push("Owner notification sent.");
  } catch (error) {
    console.error("Owner notification failed", error);
    notes.push("Owner notification failed; lead remains stored.");
  }

  try {
    sendCustomerConfirmation_(leadId, lead);
    notes.push("Customer confirmation sent.");
  } catch (error) {
    console.error("Customer confirmation failed", error);
    notes.push("Customer confirmation failed; lead remains stored.");
  }

  sheet.getRange(rowNumber, 18).setValue(notes.join(" "));
  return { leadId: leadId, duplicate: false };
}

function findLeadByToken_(sheet, token) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return "";

  const match = sheet
    .getRange(2, 19, lastRow - 1, 1)
    .createTextFinder(token)
    .matchEntireCell(true)
    .findNext();

  return match ? String(sheet.getRange(match.getRow(), 1).getDisplayValue()) : "";
}

function sendOwnerNotification_(leadId, lead) {
  const subject = `[${leadId}] New ${lead.projectType} request — ${lead.name}`;
  const plainBody = [
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
    `Page: ${lead.pageUrl}`
  ].filter(Boolean).join("\n");

  const htmlBody = `
    <h2>New ShyneTyme project request</h2>
    <p><strong>Reference:</strong> ${escapeHtml_(leadId)}</p>
    <p><strong>Name:</strong> ${escapeHtml_(lead.name)}<br>
    <strong>Email:</strong> ${escapeHtml_(lead.email)}<br>
    <strong>Phone:</strong> ${escapeHtml_(lead.phone || "Not supplied")}<br>
    <strong>ZIP:</strong> ${escapeHtml_(lead.zipCode || "Not supplied")}<br>
    <strong>Preferred contact:</strong> ${escapeHtml_(lead.preferredContact || "Not supplied")}<br>
    <strong>Project:</strong> ${escapeHtml_(lead.projectType)}<br>
    <strong>Budget:</strong> ${escapeHtml_(lead.budget || "Not supplied")}<br>
    <strong>Timeline:</strong> ${escapeHtml_(lead.timeline || "Not supplied")}</p>
    <h3>Message</h3><p>${escapeHtml_(lead.message).replace(/\n/g, "<br>")}</p>
    ${lead.buildSummary ? `<h3>Build summary</h3><p>${escapeHtml_(lead.buildSummary).replace(/\n/g, "<br>")}</p>` : ""}
    <p><small>Source: ${escapeHtml_(lead.source)}<br>Page: ${escapeHtml_(lead.pageUrl)}</small></p>`;

  MailApp.sendEmail({
    to: CONFIG.ownerEmail,
    replyTo: lead.email,
    name: CONFIG.siteName,
    subject: subject,
    body: plainBody,
    htmlBody: htmlBody
  });
}

function sendCustomerConfirmation_(leadId, lead) {
  const subject = `${CONFIG.siteName} received your project request — ${leadId}`;
  const body = [
    `Hi ${lead.name},`,
    "",
    `Your ${lead.projectType} project request was received.`,
    `Reference: ${leadId}`,
    "",
    "Deke will review the project details and respond using your preferred contact method.",
    "",
    `— ${CONFIG.siteName}`,
    CONFIG.siteUrl
  ].join("\n");

  const htmlBody = `
    <p>Hi ${escapeHtml_(lead.name)},</p>
    <p>Your <strong>${escapeHtml_(lead.projectType)}</strong> project request was received.</p>
    <p><strong>Reference:</strong> ${escapeHtml_(leadId)}</p>
    <p>Deke will review the project details and respond using your preferred contact method.</p>
    <p>— ${escapeHtml_(CONFIG.siteName)}<br><a href="${CONFIG.siteUrl}">${CONFIG.siteUrl}</a></p>`;

  MailApp.sendEmail({
    to: lead.email,
    replyTo: CONFIG.ownerEmail,
    name: CONFIG.siteName,
    subject: subject,
    body: body,
    htmlBody: htmlBody
  });
}

function responsePage_(payload) {
  const json = JSON.stringify(payload).replace(/</g, "\\u003c");
  const html = `<!doctype html><html><head><meta charset="utf-8"></head><body><script>
    (function () {
      var payload = ${json};
      window.parent.postMessage(payload, "*");
    }());
  </script></body></html>`;

  return HtmlService
    .createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function createLeadId_() {
  const stamp = Utilities.formatDate(new Date(), "America/Los_Angeles", "yyyyMMdd-HHmmss");
  const suffix = Utilities.getUuid().replace(/-/g, "").slice(0, 4).toUpperCase();
  return `STW-${stamp}-${suffix}`;
}

function cleanText_(value, maximumLength) {
  return String(value || "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .trim()
    .slice(0, maximumLength);
}

function safeCell_(value) {
  const text = String(value || "");
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function isValidEmail_(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml_(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function publicErrorMessage_(error) {
  const code = String(error && error.message ? error.message : error);
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
  return messages[code] || "The request could not be completed. Your entries remain on the page; retry or use the email fallback.";
}
