const SHYNETYME_LEAD_HEADERS = Object.freeze([
  "Lead ID",
  "Submitted At",
  "Status",
  "Source",
  "Name",
  "Email",
  "Phone",
  "ZIP Code",
  "Preferred Contact",
  "Project Type",
  "Budget",
  "Timeline",
  "Message",
  "Build Summary",
  "Page URL",
  "User Agent",
  "Consent",
  "Processing Notes",
  "Submission Token"
]);

/**
 * FIRST ACTION TO RUN MANUALLY IN APPS SCRIPT.
 *
 * This function:
 * 1. Verifies access to the configured Google Sheet.
 * 2. Creates or repairs the Leads tab structure.
 * 3. Adds status validation and hides the duplicate-protection token column.
 * 4. Stores setup metadata in Script Properties.
 * 5. Sends one setup-test email to the owner address.
 *
 * Run this once from the Apps Script editor before deploying the web app.
 */
function firstRunSetup() {
  const setupStartedAt = new Date();
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  spreadsheet.setSpreadsheetTimeZone("America/Los_Angeles");

  let sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) sheet = spreadsheet.insertSheet(CONFIG.sheetName, 0);

  ensureSheetSize_(sheet, 1000, SHYNETYME_LEAD_HEADERS.length);
  sheet.getRange(1, 1, 1, SHYNETYME_LEAD_HEADERS.length)
    .setValues([SHYNETYME_LEAD_HEADERS])
    .setFontWeight("bold")
    .setFontColor("#ffffff")
    .setBackground("#06152f")
    .setHorizontalAlignment("center")
    .setVerticalAlignment("middle")
    .setWrap(true);

  sheet.setFrozenRows(1);
  sheet.setRowHeight(1, 36);
  sheet.setColumnWidth(1, 190);
  sheet.setColumnWidth(2, 160);
  sheet.setColumnWidth(3, 130);
  sheet.setColumnWidth(4, 140);
  sheet.setColumnWidth(5, 170);
  sheet.setColumnWidth(6, 230);
  sheet.setColumnWidth(7, 140);
  sheet.setColumnWidth(8, 100);
  sheet.setColumnWidth(9, 150);
  sheet.setColumnWidth(10, 150);
  sheet.setColumnWidth(11, 120);
  sheet.setColumnWidth(12, 150);
  sheet.setColumnWidth(13, 340);
  sheet.setColumnWidth(14, 380);
  sheet.setColumnWidth(15, 280);
  sheet.setColumnWidth(16, 300);
  sheet.setColumnWidth(17, 90);
  sheet.setColumnWidth(18, 280);
  sheet.setColumnWidth(19, 180);

  const dataRows = Math.max(sheet.getMaxRows() - 1, 1);
  const statusRule = SpreadsheetApp.newDataValidation()
    .requireValueInList([
      "New",
      "Contacted",
      "Estimate Sent",
      "Scheduled",
      "Won",
      "Lost",
      "Spam"
    ], true)
    .setAllowInvalid(false)
    .setHelpText("Choose the current lead status.")
    .build();

  sheet.getRange(2, 3, dataRows, 1).setDataValidation(statusRule);
  sheet.getRange(2, 2, dataRows, 1).setNumberFormat("yyyy-mm-dd hh:mm:ss");
  sheet.getRange(2, 13, dataRows, 6).setWrap(true);

  // Column S stores the one-time submission token used to prevent duplicates.
  if (!sheet.isColumnHiddenByUser(19)) sheet.hideColumns(19);

  const properties = PropertiesService.getScriptProperties();
  properties.setProperties({
    SHYNETYME_SETUP_COMPLETE: "true",
    SHYNETYME_SETUP_AT: setupStartedAt.toISOString(),
    SHYNETYME_SPREADSHEET_ID: CONFIG.spreadsheetId,
    SHYNETYME_SHEET_NAME: CONFIG.sheetName,
    SHYNETYME_OWNER_EMAIL: CONFIG.ownerEmail
  }, true);

  SpreadsheetApp.flush();

  const remainingQuotaBeforeTest = MailApp.getRemainingDailyQuota();
  MailApp.sendEmail({
    to: CONFIG.ownerEmail,
    name: CONFIG.siteName,
    subject: "[ShyneTyme] Google lead receiver setup passed",
    body: [
      "The ShyneTyme Google Apps Script first-run setup completed successfully.",
      "",
      `Spreadsheet: ${spreadsheet.getName()}`,
      `Spreadsheet ID: ${CONFIG.spreadsheetId}`,
      `Lead tab: ${CONFIG.sheetName}`,
      `Setup time: ${setupStartedAt.toISOString()}`,
      `Remaining daily email quota before this test: ${remainingQuotaBeforeTest}`,
      "",
      "Next action: deploy the Apps Script project as a Web app, execute as Me, and copy the production /exec URL into js/contact-lead-config.js."
    ].join("\n")
  });

  const result = {
    ok: true,
    message: "ShyneTyme first-run setup passed. Check the owner inbox for the test email.",
    spreadsheetName: spreadsheet.getName(),
    spreadsheetId: CONFIG.spreadsheetId,
    sheetName: CONFIG.sheetName,
    headerCount: SHYNETYME_LEAD_HEADERS.length,
    setupAt: setupStartedAt.toISOString(),
    remainingDailyEmailQuotaBeforeTest: remainingQuotaBeforeTest
  };

  console.log(JSON.stringify(result, null, 2));
  return result;
}

/**
 * Run any time after firstRunSetup() to verify that the project still points
 * to the correct spreadsheet and contains the expected lead table.
 */
function checkSetupStatus() {
  const spreadsheet = SpreadsheetApp.openById(CONFIG.spreadsheetId);
  const sheet = spreadsheet.getSheetByName(CONFIG.sheetName);
  if (!sheet) throw new Error(`Missing sheet: ${CONFIG.sheetName}`);

  const actualHeaders = sheet
    .getRange(1, 1, 1, SHYNETYME_LEAD_HEADERS.length)
    .getDisplayValues()[0];
  const headerProblems = SHYNETYME_LEAD_HEADERS.filter(
    (expected, index) => actualHeaders[index] !== expected
  );

  const result = {
    ok: headerProblems.length === 0,
    spreadsheetName: spreadsheet.getName(),
    spreadsheetId: spreadsheet.getId(),
    sheetName: sheet.getName(),
    rowCount: sheet.getLastRow(),
    headerProblems: headerProblems,
    setupProperties: PropertiesService.getScriptProperties().getProperties(),
    remainingDailyEmailQuota: MailApp.getRemainingDailyQuota()
  };

  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) throw new Error(`Lead header verification failed: ${headerProblems.join(", ")}`);
  return result;
}

function ensureSheetSize_(sheet, minimumRows, minimumColumns) {
  if (sheet.getMaxRows() < minimumRows) {
    sheet.insertRowsAfter(sheet.getMaxRows(), minimumRows - sheet.getMaxRows());
  }
  if (sheet.getMaxColumns() < minimumColumns) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      minimumColumns - sheet.getMaxColumns()
    );
  }
}
