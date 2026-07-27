const CONFIG = {
  businessEmail: 'westsidelistingservices@gmail.com',
  spreadsheetId: 'PASTE_GOOGLE_SHEET_ID',
  calendarId: 'primary',
  uploadFolderId: '',
  timezone: 'America/Los_Angeles',
  appointmentMinutes: 90
};

function doGet() {
  return json_({ ok: true, service: 'ShyneTyme Works lead intake' });
}

function doPost(e) {
  try {
    const payload = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    const form = payload.form || {};
    validate_(form);

    const leadId = createLeadId_();
    const submittedAt = payload.submittedAt ? new Date(payload.submittedAt) : new Date();
    const projectDraft = payload.projectDraft || {};
    const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
    const leadsSheet = getOrCreateSheet_(spreadsheet, 'Leads', leadHeaders_());

    const appointment = createRequestedAppointment_(leadId, form, projectDraft);
    const row = leadHeaders_().map((header) => leadValue_(header, leadId, submittedAt, form, projectDraft, payload, appointment));
    leadsSheet.appendRow(row);

    appendProducts_(spreadsheet, leadId, projectDraft.products || []);
    sendBusinessEmail_(leadId, form, projectDraft, appointment);
    sendCustomerEmail_(leadId, form, projectDraft, appointment);

    return json_({ ok: true, leadId: leadId });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: error.message });
  }
}

function validate_(form) {
  ['name', 'email', 'phone', 'zip_code', 'project_type', 'message'].forEach((key) => {
    if (!String(form[key] || '').trim()) throw new Error('Missing required field: ' + key);
  });
  if (!/^\S+@\S+\.\S+$/.test(form.email)) throw new Error('Invalid email address');
}

function leadHeaders_() {
  return [
    'Lead ID', 'Submitted', 'Status', 'Name', 'Email', 'Phone', 'Preferred Contact',
    'ZIP Code', 'Budget Range', 'Project Type', 'Source Page', 'Project Message',
    'Builder Type', 'Installation Areas', 'Builder Details JSON', 'Products JSON',
    'Requested Date', 'Requested Time', 'Alternate Time', 'Calendar Event ID'
  ];
}

function leadValue_(header, leadId, submittedAt, form, draft, payload, appointment) {
  const values = {
    'Lead ID': leadId,
    'Submitted': Utilities.formatDate(submittedAt, CONFIG.timezone, 'yyyy-MM-dd HH:mm:ss'),
    'Status': 'New',
    'Name': form.name,
    'Email': form.email,
    'Phone': form.phone,
    'Preferred Contact': form.preferred_contact || '',
    'ZIP Code': form.zip_code || '',
    'Budget Range': form.budget_range || '',
    'Project Type': form.project_type || draft.projectType || '',
    'Source Page': payload.source || '',
    'Project Message': form.message || '',
    'Builder Type': draft.projectType || '',
    'Installation Areas': (draft.installationAreas || []).join(', '),
    'Builder Details JSON': JSON.stringify(draft.builderDetails || {}),
    'Products JSON': JSON.stringify(draft.products || []),
    'Requested Date': form.appointment_date || '',
    'Requested Time': form.appointment_time || '',
    'Alternate Time': form.appointment_alternate || '',
    'Calendar Event ID': appointment.eventId || ''
  };
  return values[header] || '';
}

function appendProducts_(spreadsheet, leadId, products) {
  if (!products.length) return;
  const headers = ['Lead ID', 'Product ID', 'Product Name', 'Quantity', 'Product URL'];
  const sheet = getOrCreateSheet_(spreadsheet, 'Product Selections', headers);
  products.forEach((product) => sheet.appendRow([
    leadId, product.id || '', product.name || String(product), product.quantity || 1, product.url || ''
  ]));
}

function createRequestedAppointment_(leadId, form, draft) {
  if (!form.appointment_date || !form.appointment_time) return {};
  const start = new Date(form.appointment_date + 'T' + form.appointment_time + ':00');
  const end = new Date(start.getTime() + CONFIG.appointmentMinutes * 60000);
  const calendar = CalendarApp.getCalendarById(CONFIG.calendarId);
  const title = '[REQUESTED] ' + leadId + ' — ' + (form.project_type || draft.projectType || 'LED project');
  const description = buildSummary_(leadId, form, draft) + '\n\nAppointment is requested, not confirmed.';
  const event = calendar.createEvent(title, start, end, {
    description: description,
    location: form.zip_code || '',
    guests: form.email,
    sendInvites: false
  });
  event.setColor(CalendarApp.EventColor.GRAY);
  return { eventId: event.getId(), start: start, end: end };
}

function sendBusinessEmail_(leadId, form, draft, appointment) {
  MailApp.sendEmail({
    to: CONFIG.businessEmail,
    replyTo: form.email,
    subject: '[' + leadId + '] New ' + (form.project_type || draft.projectType || 'LED') + ' request',
    htmlBody: '<pre style="font-family:Arial,sans-serif;white-space:pre-wrap">' + escapeHtml_(buildSummary_(leadId, form, draft, appointment)) + '</pre>'
  });
}

function sendCustomerEmail_(leadId, form, draft, appointment) {
  MailApp.sendEmail({
    to: form.email,
    replyTo: CONFIG.businessEmail,
    subject: 'ShyneTyme Works received your request — ' + leadId,
    htmlBody: '<p>Hi ' + escapeHtml_(form.name) + ',</p><p>Your project request was received. Your lead number is <strong>' + leadId + '</strong>.</p><pre style="font-family:Arial,sans-serif;white-space:pre-wrap">' + escapeHtml_(buildSummary_(leadId, form, draft, appointment)) + '</pre><p>An appointment selection is a request until ShyneTyme Works confirms it.</p>'
  });
}

function buildSummary_(leadId, form, draft, appointment) {
  const products = (draft.products || []).map((p) => p.name || String(p)).join(', ') || 'None selected';
  const zones = (draft.installationAreas || []).join(', ') || 'None selected';
  return [
    'Lead: ' + leadId,
    'Customer: ' + form.name,
    'Email: ' + form.email,
    'Phone: ' + form.phone,
    'ZIP: ' + (form.zip_code || ''),
    'Project: ' + (form.project_type || draft.projectType || ''),
    'Installation areas: ' + zones,
    'Products: ' + products,
    'Requested appointment: ' + ((form.appointment_date || '') + ' ' + (form.appointment_time || '')).trim(),
    'Alternate: ' + (form.appointment_alternate || ''),
    '',
    form.message || ''
  ].join('\n');
}

function getOrCreateSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function createLeadId_() {
  const date = Utilities.formatDate(new Date(), CONFIG.timezone, 'yyyyMMdd');
  const token = Utilities.getUuid().slice(0, 6).toUpperCase();
  return 'ST-' + date + '-' + token;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}

function escapeHtml_(value) {
  return String(value || '').replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  })[character]);
}