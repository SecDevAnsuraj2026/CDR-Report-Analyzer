# Implementation Guide — CDR Report Analyzer

> Developed under **MP Police State Cyber Cell**
> Developer Team: Ansu Raj · Shruti Dubey · Komal Lokhande
> Guide: Atul Srivatab (SI, MP Police)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Prerequisites](#3-prerequisites)
4. [Project Setup](#4-project-setup)
5. [Project Structure](#5-project-structure)
6. [Application Flow](#6-application-flow)
7. [Landing Page — Case & File Input](#7-landing-page--case--file-input)
8. [Sheet View — Data Inspection](#8-sheet-view--data-inspection)
9. [Query Engine](#9-query-engine)
10. [Export to Excel](#10-export-to-excel)
11. [Data Formatting Rules](#11-data-formatting-rules)
12. [State Management with React Context](#12-state-management-with-react-context)
13. [Routing](#13-routing)
14. [Build & Deployment](#14-build--deployment)
15. [Contributing](#15-contributing)

---

## 1. Project Overview

**CDR Report Analyzer** is a fully browser-based React + Vite application for law enforcement investigators. It allows them to:

- Upload Excel/CSV CDR files
- Inspect the raw records in a sheet view
- Run predefined analytical queries (e.g. frequent contacts, IMEI tracking, location patterns)
- Export filtered results to Excel

All data processing happens entirely in the browser — nothing is sent to any server.

---

## 2. Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | ^19.2.4 | UI framework |
| Vite | ^8.0.1 | Build tool and dev server |
| React Router DOM | ^7.13.2 | Client-side page routing |
| Bootstrap | ^5.3.8 | UI components and layout |
| SheetJS (`xlsx`) | ^0.18.5 | Excel/CSV parsing and export |
| React Context API | Built-in | Global state management |

---

## 3. Prerequisites

Ensure the following are installed before setup:

| Tool | Minimum Version |
|------|----------------|
| Node.js | >= 18 |
| npm | >= 9 |
| Git | >= 2 |

Check your versions:

```bash
node --version
npm --version
git --version
```

---

## 4. Project Setup

### Clone the repository

```bash
git clone https://github.com/hackghosst001/CDR-Report-Analyzer
cd CDR-Report-Analyzer
```

### Install all dependencies

```bash
npm install
```

This installs React, Vite, Bootstrap, React Router DOM, and SheetJS as defined in `package.json`.

### Start the development server

```bash
npm run dev
```

App runs at: `http://localhost:5173`

### Build for production

```bash
npm run build
```

Output goes to the `/dist` folder.

### Preview the production build locally

```bash
npm run preview
# or
npm start
```

---

## 5. Project Structure

```
report-analyzer/
├─ dist/                                  # Vite production build output
├─ node_modules/                          # Installed npm dependencies
├─ public/                                # Public static files
├─ src/                                   # Main application source
│  ├─ assets/                             # App assets folder (currently empty)
│  ├─ cdrFilter/                          # Core CDR/IPDR analysis logic
│  │  ├─ durationFilter.js                # Filters records by duration and call type
│  │  ├─ frequentContact.js               # Finds most frequently contacted B-party numbers
│  │  ├─ imeiTracking.js                  # IMEI-based analysis and summaries
│  │  ├─ imsiAnalysis.js                  # IMSI/SIM-based analysis
│  │  ├─ locationBTS.js                   # BTS/location movement and tower analysis
│  │  ├─ maxCallDuration.js               # Longest call and duration statistics
│  │  ├─ timePattern.js                   # Time-slot/activity pattern analysis
│  │  └─ utils.js                         # Shared field-reading and normalization helpers
│  ├─ components/                         # Reusable UI components
│  ├─ pages/                              # Route-based pages/screens
│  ├─ utils/                              # Shared utility functions
│  │  ├─ reportUtils.js                   # Date, duration, formatting, output sanitizing
│  │  └─ rowKey.js                        # Builds stable row keys for highlighting
│  ├─ App.css                             # Main app layout and page styling
│  ├─ App.jsx                             # Main app component, upload flow, routes
│  ├─ DataContext.jsx                     # Shared state for case details/data/highlights
│  ├─ index.css                           # Global base styles
│  ├─ main.jsx                            # React entry point
│  ├─ Sheet.css                           # Dashboard/table/query styling
│  └─ Sheet.jsx                           # Main analysis dashboard with full dataset
├─ .gitignore                             # Git ignore rules
├─ eslint.config.js                       # ESLint configuration
├─ IMPLEMENTATION_GUIDE.md                # Implementation notes/documentation For User
├─ index.html                             # Root HTML for Vite
├─ package-lock.json                      # Exact npm dependency lockfile
├─ package.json                           # Project metadata, scripts, dependencies
├─ README.md                              # Project overview For Developer
└─ vite.config.js                         # Vite bundler configuration

```

---

## 6. Application Flow

```
Landing Page
  ↓ (user enters case details + uploads file)
SheetJS parses Excel/CSV → JSON rows
  ↓
React Context stores rows globally
  ↓
Sheet Page (inspect all rows)
  ↓ (user picks a query)
Query Engine filters/groups data
  ↓
Result Table (compact view, A Party hidden)
  ↓ (optional)
Export → result.xlsx downloaded via SheetJS
```

---

## 7. Landing Page — Case & File Input

The landing page collects three mandatory inputs before any data is processed:

| Field | Description |
|-------|-------------|
| Case Number | Unique identifier for the investigation case |
| Case Name | Human-readable name of the case |
| Target Number | The primary phone number under analysis |

After filling these, the investigator uploads an `.xlsx`, `.xls`, or `.csv` file and clicks **Submit**.

**What happens on Submit:**
1. SheetJS reads the file using `FileReader` as a binary string
2. It opens the **first worksheet** of the workbook
3. Converts it to a JSON array using `sheet_to_json`
4. Data is normalized and stored in React Context
5. User is automatically navigated to the Sheet Page

---

## 8. Sheet View — Data Inspection

The Sheet Page displays all uploaded rows in a scrollable table so investigators can verify the data before running queries.

- All original columns are visible here
- Date-time values are formatted as `DD-MM-YYYY HH:MM:SS`
- Duration values are formatted as `mm:ss`
- Invalid or missing date/duration values appear as `NA`

---

## 9. Query Engine

The Query Page provides a dropdown of predefined analytical queries designed for telecom forensics, such as:

- Frequent contacts of the target number
- Calls during a specific time window
- IMEI/IMSI usage tracking
- Location tower analysis
- Incoming vs outgoing call breakdown

**Steps to run a query:**
1. Select a query from the dropdown
2. Fill in any required parameters (e.g. date range, a specific number)
3. Click **Execute Query**
4. Results appear in a compact result table

> **Note:** Result tables hide A Party columns to keep the view focused on the relevant outgoing/incoming data.

If no rows match the selected query, the app shows `No Data Found`.

---

## 10. Export to Excel

After running a query or viewing the full sheet, investigators can export the currently displayed rows:

1. Click the **Excel export button**
2. SheetJS packages the filtered rows into an `.xlsx` workbook
3. The file downloads automatically as `result.xlsx`

The export respects the active filters — only the currently visible rows are included in the download.

---

## 11. Data Formatting Rules

These rules apply consistently across all views and exports:

| Data Type | Display Format | If Invalid/Missing |
|-----------|---------------|--------------------|
| Date + Time | `DD-MM-YYYY HH:MM:SS` | `NA` |
| Duration | `mm:ss` | `NA` |
| A Party columns | Hidden in result tables and exports | — |

---

## 12. State Management with React Context

The application uses React Context API to share case metadata and CDR rows across all pages without prop drilling.

The context stores:
- `caseNumber`, `caseName`, `targetNumber` — entered on the landing page
- `sheetData` — the full array of parsed rows from the uploaded file
- `filteredData` — rows after a query is applied

All pages read from and write to this shared context via a custom hook.

---

## 13. Routing

React Router DOM v7 manages navigation between the three main pages:

| Route | Page | Purpose |
|-------|------|---------|
| `/` | LandingPage | Case info + file upload |
| `/sheet` | SheetPage | Raw data inspection |
| `/query` | QueryPage | Query selection + results |

Navigation is triggered programmatically after each step (e.g. after a successful file upload → auto-navigate to `/sheet`).

---

## 14. Build & Deployment

### Local Production Build

```bash
npm run build
npm run preview
```

### Deploy to GitHub Pages

1. Install gh-pages:

```bash
npm install --save-dev gh-pages
```

2. Add to `package.json`:

```json
"homepage": "https://github.com/hackghosst001/CDR-Report-Analyzer",
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d dist"
}
```

3. Update `vite.config.js`:

```js
export default {
  base: '/CDR-Report-Analyzer/',
}
```

4. Run:

```bash
npm run deploy
```

---

## 15. Contributing

1. Fork the repository
2. Create a feature branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit with a clear message using this convention:

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature or query |
| `fix:` | Bug fix |
| `docs:` | Documentation update |
| `style:` | UI or formatting change |
| `refactor:` | Code restructure, no behavior change |
| `chore:` | Config, build, or dependency update |

4. Push and open a Pull Request on GitHub

---

*Developed under MP Police State Cyber Cell.*
*Guide contact: Atul Shrivastava — atulshrivastava@gmail.com*
