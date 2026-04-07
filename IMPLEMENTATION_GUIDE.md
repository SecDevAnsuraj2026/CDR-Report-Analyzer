# User Guide — CDR Report Analyzer

> Developed under **MP Police State Cyber Cell**
> For use by investigators and cyber cell personnel

---

## Table of Contents

1. [What is this tool?](#1-what-is-this-tool)
2. [Before You Start](#2-before-you-start)
3. [Step 1 — Enter Case Details](#3-step-1--enter-case-details)
4. [Step 2 — Upload the CDR File](#4-step-2--upload-the-cdr-file)
5. [Step 3 — Inspect the Sheet View](#5-step-3--inspect-the-sheet-view)
6. [Step 4 — Run a Query](#6-step-4--run-a-query)
7. [Step 5 — Export Results to Excel](#7-step-5--export-results-to-excel)
8. [How Data is Displayed](#8-how-data-is-displayed)
9. [Supported File Formats](#9-supported-file-formats)
10. [Tips for Investigators](#10-tips-for-investigators)
11. [Troubleshooting](#11-troubleshooting)
12. [FAQ](#12-faq)
13. [Team & Contact](#13-team--contact)

---

## 1. What is this tool?

**CDR Report Analyzer** is a web-based tool built for cyber investigators. It helps you quickly analyze Call Detail Records (CDR) from telecom data — without manually scanning thousands of rows.

With this tool you can:

- Upload Excel or CSV CDR files received from telecom operators
- View all records in a clean, readable table
- Run focused queries to detect patterns (frequent contacts, IMEI usage, location towers, etc.)
- Export the filtered results to Excel for use in official reports

> **Your data never leaves your computer.** All processing happens inside your browser. Nothing is uploaded to any server.

---

## 2. Before You Start

Make sure you have:

- A modern browser (Chrome or Edge recommended)
- The CDR file in `.xlsx`, `.xls`, or `.csv` format
- The case number, case name, and target phone number ready

---

## 3. Step 1 — Enter Case Details

When you open the application, you will see the **Landing Page** with three input fields:

| Field | What to enter |
|-------|--------------|
| **Case Number** | The official case/FIR number |
| **Case Name** | Name or short description of the case |
| **Target Number** | The primary mobile number under investigation |

Fill in all three fields before uploading a file. These details are used to label your session and may appear in exported reports.

---

## 4. Step 2 — Upload the CDR File

After entering case details:

1. Click the **File Upload** button
2. Select your `.xlsx`, `.xls`, or `.csv` CDR file from your computer
3. Click **Submit**

The tool will automatically read the first sheet of the file and take you to the Sheet View.

> **Important:** Your file must have column headers in the first row. If the first row contains data instead of headers, the tool may not read the file correctly.

---

## 5. Step 3 — Inspect the Sheet View

After uploading, you will see the **Sheet Page** — a full table showing every row from your uploaded file.

Use this page to:

- Confirm the data loaded correctly
- Check the total number of records
- Review the column names and their values
- Spot any obvious data issues before running queries

**How values appear:**

| Data | How it's shown |
|------|---------------|
| Date and Time | `DD-MM-YYYY HH:MM:SS` |
| Call Duration | `mm:ss` (minutes:seconds) |
| Missing/Invalid values | `NA` |

---

## 6. Step 4 — Run a Query

Go to the **Query Page** using the navigation bar. This is where the analysis happens.

### How to run a query:

1. **Select a query** from the dropdown menu
2. **Fill in parameters** if the query asks for them (e.g. a date range or a specific number)
3. Click **Execute Query**
4. The results appear in the table below

### What the queries can find:

- **Frequent Contacts** — which numbers the target called or received calls from the most
- **Calls in a Time Window** — all calls between two specific dates/times
- **IMEI Analysis** — which devices (IMEI numbers) were used by the target
- **IMSI Analysis** — SIM card tracking across different devices
- **Location/Tower Analysis** — which cell towers were used and when
- **Incoming vs Outgoing** — breakdown of call direction

> If no records match the query, the app shows **"No Data Found"**.

### What you won't see in results:

A Party (the target's own number) columns are hidden from result tables to keep the view clean and focused on the other party's data.

---

## 7. Step 5 — Export Results to Excel

After running a query, you can download the results:

1. Click the **Export / Excel button** on the Query or Sheet page
2. The currently visible filtered rows are packaged into an Excel file
3. The file downloads automatically as **`result.xlsx`**

You can open this file in Microsoft Excel or any compatible spreadsheet application and include it in your official case report.

---

## 8. How Data is Displayed

| Display Rule | Detail |
|--------------|--------|
| Date + Time format | `DD-MM-YYYY HH:MM:SS` |
| Duration format | `mm:ss` |
| Invalid date/time/duration | Shown as `NA` |
| A Party columns | Hidden in query result tables and exports |
| Full data | Visible on the Sheet Page |

---

## 9. Supported File Formats

| Format | Extension | Notes |
|--------|-----------|-------|
| Excel Workbook | `.xlsx` | Recommended |
| Legacy Excel | `.xls` | Supported |
| CSV | `.csv` | Comma-separated |

**The tool reads only the first worksheet** of an Excel file. If your data is on a second or later sheet, move it to the first sheet before uploading.

---

## 10. Tips for Investigators

- **Always check the Sheet View first** before running queries — confirm the data looks correct and all expected columns are present.
- **Use the time window query** to narrow down records to a specific day or hour when an incident occurred.
- **IMEI Analysis** is useful when you suspect a person changed SIM cards — it shows all numbers used on the same device.
- **Location/Tower Analysis** helps place the target at a geographic area at a specific time.
- **Export after every important query** — save the filtered result as evidence before moving to the next query.
- **Large files** (50,000+ rows) may take a few seconds to parse. Wait until the Sheet Page loads fully before running queries.

---

## 11. Troubleshooting

### File does not load after upload

- Check that the file is `.xlsx`, `.xls`, or `.csv`
- Make sure the file is not password-protected or corrupted
- Ensure column headers are in Row 1, not Row 2 or later
- Try opening the file in Excel, saving it again, and re-uploading

### Sheet page shows wrong or garbled data

- The file may have merged cells or special formatting — clean it in Excel before uploading
- Make sure the correct sheet is the first sheet in the workbook

### Query shows "No Data Found" unexpectedly

- Check that your date parameters match the actual date format in the file (`DD-MM-YYYY`)
- Make sure the target number you entered on the landing page matches the format used in the file (with or without country code)

### Export file is empty

- Run a query first, then export — the export only includes rows currently visible
- If the query returned "No Data Found", there is nothing to export

### App is slow or freezes

- Use Chrome or Edge for best performance
- For very large files, try splitting them into smaller batches

---

## 12. FAQ

**Q: Is my CDR data safe? Is it uploaded anywhere?**
No. The application works entirely in your browser. Your data never leaves your computer and is not stored or sent to any server.

**Q: Can I load two files at the same time?**
No. The application supports one file per session. Uploading a new file will replace the current data. Reload the page to start fresh.

**Q: Why are some columns hidden in the query results?**
A Party (target's own number) columns are intentionally hidden in result tables to keep the view focused on the other party. All columns are visible on the Sheet Page.

**Q: Why does duration show as `NA`?**
The duration value in that row is either missing, blank, or in a format the tool cannot read. Check the original file.

**Q: Can I use this on a mobile device?**
The tool works best on a laptop or desktop. It may function on a tablet but is not optimized for small mobile screens.

**Q: What if my file has data on Sheet 2?**
The tool only reads the first sheet. Open your file in Excel, copy the data to Sheet 1, save, and re-upload.

---

## 13. Team & Contact

| Name | Role | Contact |
|------|------|---------|
| Ansu Raj | Cyber Security | ansuraj1998rks@gmail.com |
| Shruti Dubey | Software Developer | shrutidubey1811@gmail.com |
| Komal Lokhande | Software Developer | lokhandekomal116@gmail.com |
| Atul Shrivastava  | Guide| atulshrivastava@gmail.com |

---

*CDR/IPDR Report Analyzer — Developed under MP Police State Cyber Cell*
*GitHub: [https://github.com/hackghosst001/CDR-IPDR-Report-Analyzer](https://github.com/hackghosst001/CDR-IPDR-Report-Analyzer)*
