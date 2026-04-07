const analysisSections = [
  {
    title: '1. Frequent Contact Analysis - [ Frequent Contact Analysis]',
    aim: 'Identify the most frequently contacted numbers to determine close connections between Party A and Party B.',
    input: ['B Party (automatically taken from dataset)'],
    howItWorks: [
      'Scans the B Party column',
      'Counts frequency of each number',
      'Groups data by B Party',
      'Sorts results based on frequency',
    ],
    output: ['B Party Number', 'Frequency (number of calls)'],
    action: 'Clicking a B Party number highlights all related records in the main sheet. Option to export results as PDF.',
  },
  {
    title: '2. Location Movement Tracking (BTS Analysis) - [Location Movement Tracking]',
    aim: 'Track the movement of a suspect using BTS (Base Transceiver Station) or location data.',
    input: ['BTS Tower ID / Cell ID / LAC', 'Date-Time'],
    howItWorks: [
      'Filters records based on selected user (A Party)',
      'Sorts data by Date-Time',
      'Extracts BTS location for each call',
      'Identifies movement between towers',
    ],
    keyFeatures: [
      'Most active BTS (highest frequency)',
      'BTS visited within a time duration',
      'Date-wise BTS presence',
      'Contacts made at a specific BTS',
    ],
    output: ['Date-Time-wise location history', 'Tower ID / Location', 'Movement path (Location -> Location)'],
    action: 'Click a record to view full details in the main sheet.',
  },
  {
    title: '3. IMEI + Location Tracking - [ IMEI Tracking]',
    aim: 'Track a device\'s movement and activity using IMEI number.',
    input: ['IMEI', 'Date'],
    howItWorks: [
      'Filters records using IMEI',
      'Extracts BTS/IP location',
      'Sorts data chronologically',
    ],
    keyFeatures: [
      'SIMs mapped to one IMEI',
      'Device location tracking',
      'Date-wise usage duration',
      'Incoming & outgoing call summary',
    ],
    output: ['IMEI details', 'Location timeline', 'Movement path'],
    action: 'Click to view records for specific locations.',
  },
  {
    title: '4. IMSI Analysis (SIM-Based Tracking) - IMSI Analysis',
    aim: 'Analyze SIM usage and detect multiple device associations.',
    input: ['IMSI'],
    howItWorks: [
      'Groups data by IMSI',
      'Maps IMEI devices linked to SIM',
      'Tracks usage patterns',
    ],
    keyFeatures: [
      'Number of devices per SIM',
      'SIM location tracking',
      'Usage duration on specific dates',
      'Call count (incoming/outgoing)',
    ],
    output: ['IMSI details', 'Associated IMEI list', 'Call activity summary'],
    action: 'Click to view device list or detailed records.',
  },
  {
    title: '5. Maximum Call Duration - [ Maximum Call duration]',
    aim: 'Identify the longest call made in the dataset.',
    input: ['Duration column (automatically processed)'],
    howItWorks: [
      'Sorts call duration in descending order',
      'Selects highest duration record',
    ],
    output: ['B Party Number', 'Duration', 'Date-Time', 'First BTS', 'Last BTS'],
    action: 'Click to open full record in main sheet. Highlighted view available. Export option (PDF).',
  },
  {
    title: '6. Time Pattern Analysis - [ Time Pattern Analysis]',
    aim: 'Detect suspicious calling behavior based on time patterns.',
    input: ['Date-Time range'],
    howItWorks: [
      'Extracts hour from timestamp',
      'Groups calls into time slots (e.g., 00:00-06:00)',
      'Counts number of calls per slot',
    ],
    output: ['Time Slot', 'Number of calls', 'Highlighted unusual activity'],
    action: 'Click a time slot to view filtered records. Export results if required.',
  },
  {
    title: '7. Duration-Based Query - [ Duration Filter]',
    aim: 'Filter calls based on duration and call type.',
    input: ['Duration threshold (X seconds)', 'Call Type (Incoming / Outgoing / Missed)'],
    howItWorks: [
      'Applies duration filter (> X)',
      'Applies call type filter',
    ],
    output: ['Filtered call records'],
  },
];

const renderList = (items) => (
  <ul className="guide-list mb-0">
    {items.map((item) => (
      <li key={item}>{item}</li>
    ))}
  </ul>
);

function UserGuide() {
  return (
    <div className="content-page guide-page">
      <div className="page-card guide-card">
        <section className="guide-hero">
          <span className="guide-kicker">User Guide</span>
          <h1 className="guide-title">CDR Report Analyzer</h1>
          <p className="guide-intro">
            The CDR Report Analyzer is designed to help users analyze large volumes of telecom data
            efficiently. This tool provides structured query modules that allow users to extract
            meaningful insights such as communication patterns, device tracking, location movement,
            and suspicious activities.
          </p>
          <p className="guide-intro mb-0">
            This guide explains how to use each feature of the system.
          </p>
        </section>

        <section className="guide-section">
          <h2>Enter Case Details</h2>
          <p>
            When you open the application, you will see the Landing Page containing three primary
            input fields. You must fill in all three fields before proceeding to the file upload.
            These details label your session and are included in exported reports.
          </p>

          <div className="guide-subcard">
            <h3>Case Information Table</h3>
            <div className="guide-mini-grid">
              <div>
                <strong>Case Number:</strong>
                <p className="mb-0">Enter the official case or FIR number.</p>
              </div>
              <div>
                <strong>Case Name:</strong>
                <p className="mb-0">Provide a name or a short description of the investigation.</p>
              </div>
              <div>
                <strong>Target Number:</strong>
                <p className="mb-0">Enter the primary mobile number currently under investigation.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>Upload the CDR File</h2>
          <p>Once the case details are entered, follow these steps to import your data:</p>
          <ol className="guide-list guide-steps">
            <li>Click the File Upload button.</li>
            <li>Select your CDR file from your computer. Supported formats include: `.xlsx`, `.xls`, or `.csv`.</li>
            <li>Click the Submit button.</li>
          </ol>
          <p>
            The tool will automatically process the first sheet of the file and redirect you to the
            Sheet View.
          </p>
          <div className="guide-note">
            <strong>Note:</strong> Ensure your file has column headers in the first row. If the
            first row contains raw data instead of headers, the tool may fail to parse the
            information correctly.
          </div>
        </section>

        <section className="guide-section">
          <h2>Inspect the Sheet View</h2>
          <p>
            The Sheet Page displays a comprehensive table containing every row from your uploaded
            file. This view allows you to:
          </p>
          {renderList([
            'Confirm the data loaded successfully.',
            'Verify the total number of records processed.',
            'Review column names and their associated values.',
            'Identify any data inconsistencies before performing analysis.',
          ])}

          <div className="guide-subcard mt-4">
            <h3>Data Display Standards</h3>
            <div className="guide-mini-grid">
              <div>
                <strong>Date and Time:</strong>
                <p className="mb-0">Formatted as DD-MM-YYYY HH:MM:SS.</p>
              </div>
              <div>
                <strong>Call Duration:</strong>
                <p className="mb-0">Formatted as mm:ss (minutes:seconds).</p>
              </div>
              <div>
                <strong>Missing/Invalid Values:</strong>
                <p className="mb-0">Displayed as NA.</p>
              </div>
            </div>
          </div>
        </section>

        <section className="guide-section">
          <h2>Run a Query</h2>
          <p>
            Navigate to the Query Page using the top navigation bar. This section is the core of the
            analysis process.
          </p>

          <div className="guide-subcard">
            <h3>Execution Steps</h3>
            <ol className="guide-list guide-steps">
              <li>Select a Query: Choose a specific analysis type from the dropdown menu.</li>
              <li>Define Parameters: If prompted, enter specific details such as date ranges or specific phone numbers.</li>
              <li>Execute: Click the Execute Query button.</li>
              <li>Review: Results will populate in the table located below the controls.</li>
            </ol>
          </div>

          <div className="guide-subcard">
            <h3>Available Analysis Types</h3>
            {renderList([
              'Frequent Contacts: Identifies numbers with the highest call volume (Incoming/Outgoing).',
              'Time Window Analysis: Filters calls between two specific timestamps.',
              'IMEI Analysis: Tracks handset hardware used by the target.',
              'IMSI Analysis: Identifies SIM card transitions across different devices.',
              'Tower Analysis: Maps the location and cell towers utilized.',
              'Call Direction: Provides a breakdown of Incoming vs. Outgoing traffic.',
            ])}
          </div>

          <div className="guide-note">
            <strong>Note:</strong> If no records match your filters, the application will display
            &nbsp;"No Data Found." To maintain a clean interface, the "A Party" (the target&apos;s own
            number) is hidden from the results table.
          </div>
        </section>

        {analysisSections.map((section) => (
          <section className="guide-section" key={section.title}>
            <h2>{section.title}</h2>

            <div className="guide-detail-grid">
              <div className="guide-detail-card">
                <h3>Aim</h3>
                <p className="mb-0">{section.aim}</p>
              </div>

              <div className="guide-detail-card">
                <h3>Input</h3>
                {renderList(section.input)}
              </div>

              <div className="guide-detail-card">
                <h3>How It Works</h3>
                {renderList(section.howItWorks)}
              </div>

              {section.keyFeatures && (
                <div className="guide-detail-card">
                  <h3>Key Features</h3>
                  {renderList(section.keyFeatures)}
                </div>
              )}

              <div className="guide-detail-card">
                <h3>Output</h3>
                {renderList(section.output)}
              </div>

              {section.action && (
                <div className="guide-detail-card">
                  <h3>Action</h3>
                  <p className="mb-0">{section.action}</p>
                </div>
              )}
            </div>
          </section>
        ))}

        <section className="guide-section">
          <h2>Export Results to Excel</h2>
          <p>You can save your findings at any time from either the Query or Sheet pages.</p>
          <ol className="guide-list guide-steps">
            <li>Click the Export / Excel button.</li>
            <li>The system will package the currently visible (filtered) rows.</li>
            <li>The file will download automatically as `result.xlsx`.</li>
          </ol>
          <p className="mb-0">
            This file is fully compatible with Microsoft Excel and can be attached to official case
            reports.
          </p>
        </section>
      </div>
    </div>
  );
}

export default UserGuide;
