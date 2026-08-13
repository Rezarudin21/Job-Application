# Job-Application
Chrome extension that automatically tracks JobStreet job applications and saves company, position, job ID, application status, and job URL to Google Sheets.
This Extensions are still limited in Jobstreet (Indonesia)

## Installation & Setup

### 1. Create a Google Sheet

Create a new Google Spreadsheet and create a sheet named:

`Applications`

The sheet will contain:

| Date | Company | Position | Status | URL |
|---|---|---|---|---|

### 2. Set Up Google Apps Script

In your Google Sheet, go to:

**Extensions → Apps Script**

Paste the Google Apps Script code from this repository.

Run:

`setupSheet()`

This will create the headers, format the sheet, and add the Status dropdown:

- Applied
- Interview
- Rejected
- Offer

> Do not run `doPost()` manually. It is triggered automatically by HTTP POST requests from the extension.

### 3. Deploy the Apps Script

In Apps Script, select:

**Deploy → New deployment → Web app**

Configure:

- **Execute as:** Me
- **Who has access:** An option that allows the extension to access the Web App

Click **Deploy** and copy the Web App URL.

It should look like:

`https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec`

### 4. Download the Extension

The extension will automatically track your applications and save the job details to Google Sheets.
