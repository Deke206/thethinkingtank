# ShyneTyme Google Apps Script lead receiver

This script stores website leads in the **ShyneTyme Leads** Google Sheet and sends owner/customer email notifications.

## Spreadsheet

- Spreadsheet ID: `1dAUOsAzglUq055e0EtFf1mXdzi_CfU748ND_QXGKW5Q`
- Sheet tab: `Leads`
- Owner notification: `westsidelistingservices@gmail.com`

## One-time deployment

1. Open the ShyneTyme Leads spreadsheet.
2. Choose **Extensions → Apps Script**.
3. Replace the default script with `Code.gs` from this folder.
4. In Project Settings, enable the manifest file and replace it with `appsscript.json` if needed.
5. Save the project.
6. Run `doGet` once in the editor and approve the requested Google Sheets and email permissions.
7. Choose **Deploy → New deployment → Web app**.
8. Set **Execute as: Me**.
9. Set access to **Anyone** so public website visitors can submit without signing into Google.
10. Deploy and copy the production URL ending in `/exec`.
11. Paste that URL into `js/contact-lead-config.js` as the `endpoint` value.
12. Open the `/exec` URL directly. It should display “Service is running.”
13. Submit one test lead from the branch preview and verify:
    - a new row appears in `Leads`;
    - the owner receives a notification;
    - the customer receives a confirmation;
    - the website shows a reference beginning with `STW-`.

Do not place OAuth tokens, passwords, or private customer data in this repository.
