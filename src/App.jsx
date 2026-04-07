import { useMemo, useState } from 'react';
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './App.css';
import { useData } from './DataContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Sheet from './Sheet';
import QueryResult from './pages/QueryResult';
import UserGuide from './pages/UserGuide';
import About from './pages/About';
import Contact from './pages/Contact';
import { parseDateTimeValue, parseDurationToSeconds } from './utils/reportUtils';

const workflowSteps = [
  'Enter case details to label the investigation workspace.',
  'Upload the CDR workbook and let the parser normalize key fields.',
  'Open the sheet or jump directly into any query module.',
];

const analysisHighlights = [
  {
    title: 'Desktop View',
    description: 'Spreadsheet-style inspection with wider context and detailed record review.',
  },
  {
    title: 'Phone View',
    description: 'Compact cards and stacked actions for quick review during field work.',
  },
  {
    title: 'Query Flow',
    description: 'Frequent contact, BTS, IMEI, IMSI, duration, and time-pattern modules stay linked.',
  },
];

function App() {
  const [caseDetails, setCaseDetails] = useState({
    caseNumber: '',
    caseName: '',
    targetNumber: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const { excelData, setExcelData, setCaseDetails: setCaseContext } = useData();

  const uploadInsights = useMemo(() => {
    const records = excelData?.length ?? 0;

    if (!records) {
      return [
        { label: 'Status', value: 'Waiting for upload' },
        { label: 'Records', value: '0' },
        { label: 'Distinct Numbers', value: '0' },
        { label: 'Distinct BTS', value: '0' },
      ];
    }

    const distinctNumbers = new Set(
      excelData
        .map((row) => String(row?._normalizedBParty ?? '').trim())
        .filter((value) => value && value !== 'NA')
    ).size;

    const distinctBts = new Set(
      excelData
        .map((row) => String(row?._normalizedBTS ?? '').trim())
        .filter((value) => value && value !== 'NA')
    ).size;

    return [
      { label: 'Status', value: 'Dataset ready' },
      { label: 'Records', value: String(records) },
      { label: 'Distinct Numbers', value: String(distinctNumbers) },
      { label: 'Distinct BTS', value: String(distinctBts) },
    ];
  }, [excelData]);

  const handleCaseDetailsChange = (e) => {
    const { name, value } = e.target;
    setCaseDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    console.log('Selected file:', file);

    if (!file.name.match(/\.(xlsx|xls|csv)$/)) {
      setError('Please upload a valid Excel file (.xlsx, .xls, or .csv)');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const workbook = XLSX.read(event.target.result, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);

          if (jsonData.length === 0) {
            setError('Excel file is empty. Please upload a file with data.');
            return;
          }

          const normalizeValue = (value) =>
            value === undefined || value === null || value === '' ? 'NA' : value;

          const normalizeRow = (row) => {
            const pick = (...candidates) => {
              for (const key of candidates) {
                if (row[key] !== undefined && row[key] !== null && row[key] !== '') {
                  return row[key];
                }
              }
              return 'NA';
            };

            const callDate = pick('Call Date', 'Date', 'Date-Time', 'DateTime');
            const callTime = pick('Call Time', 'Time', 'Date-Time', 'DateTime');
            const normalizedDateTime = parseDateTimeValue(callDate, callTime);
            const durationSeconds = parseDurationToSeconds(
              pick('Call Duration', 'Duration', 'Call Duration (sec)', 'Duration (sec)')
            );

            return {
              ...Object.fromEntries(Object.entries(row).map(([key, value]) => [key, normalizeValue(value)])),
              _normalizedDateTime: normalizedDateTime ? normalizedDateTime.toISOString() : 'NA',
              _durationSeconds: durationSeconds ?? null,
              _normalizedBParty: pick('B Party Number', 'B Party', 'bParty', 'BParty', 'b_party'),
              _normalizedCallType: pick('Call Type (In/Out)', 'Call Type', 'callType', 'Type of Connection'),
              _normalizedBTS: pick(
                'BTS',
                'BTS ID',
                'Cell ID',
                'First Cell ID',
                'Last Cell ID',
                'First BTS Location-Address',
                'Last BTS Location-Address'
              ),
              _normalizedIMEI: pick('IMEI', 'imei'),
              _normalizedIMSI: pick('IMSI', 'imsi'),
            };
          };

          const normalizedData = jsonData.map(normalizeRow);
          setExcelData(normalizedData);
          setError('');
        } catch (err) {
          setError('Error parsing Excel file: ' + err.message);
          console.error('Parse error:', err);
        }
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError('Error reading file: ' + err.message);
      console.error('File read error:', err);
    }
  };

  const handleAnalyze = () => {
    if (!caseDetails.caseNumber.trim()) {
      setError('Please enter a Case Number');
      return;
    }
    if (!caseDetails.caseName.trim()) {
      setError('Please enter a Case Name');
      return;
    }
    if (!caseDetails.targetNumber.trim()) {
      setError('Please enter a Target Number');
      return;
    }
    if (!excelData || excelData.length === 0) {
      setError('Please upload an Excel file');
      return;
    }

    setCaseContext(caseDetails);
    navigate('/sheet');
  };

  const isHomePage = location.pathname === '/';

  const homeElement = (
    <div className="landing-wrapper">
      <div className="landing-image">
        <div className="landing-visual-panel">
          <span className="landing-eyebrow">Responsive Workspace</span>
          <h1>Analyze telecom reports with a better desktop and phone workflow.</h1>
          <p>
            The landing page now sets up the case, confirms the upload, and keeps the next steps
            obvious before you move into the sheet and query modules.
          </p>

          <div className="landing-visual-grid">
            {analysisHighlights.map((item) => (
              <article key={item.title} className="landing-visual-card">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="landing-workflow">
            {workflowSteps.map((step, index) => (
              <div key={step} className="landing-workflow-step">
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="form-container">
        <div className="form-box">
          <div className="landing-copy">
            <span className="landing-eyebrow landing-mobile-badge">Case Setup</span>
            <h1>CDR Report Analyzer</h1>
            <p>Upload your Excel file and start analysis from one clean workspace.</p>
          </div>

          <div className="landing-stats-strip">
            {uploadInsights.map((item) => (
              <div key={item.label} className="landing-stat-card">
                <span className="landing-stat-label">{item.label}</span>
                <strong className="landing-stat-value">{item.value}</strong>
              </div>
            ))}
          </div>

          <div className="landing-mobile-panel">
            <h2>Quick Flow</h2>
            <div className="landing-mobile-steps">
              {workflowSteps.map((step, index) => (
                <div key={step} className="landing-mobile-step">
                  <span>{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
          </div>

          <form
            className="landing-form"
            onSubmit={(event) => {
              event.preventDefault();
              handleAnalyze();
            }}
          >
            <div className="mb-3">
              <label htmlFor="caseNumber" className="form-label">
                Case Number
              </label>
              <input
                type="text"
                className="form-control"
                id="caseNumber"
                name="caseNumber"
                value={caseDetails.caseNumber}
                onChange={handleCaseDetailsChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="caseName" className="form-label">
                Case Name
              </label>
              <input
                type="text"
                className="form-control"
                id="caseName"
                name="caseName"
                value={caseDetails.caseName}
                onChange={handleCaseDetailsChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="targetNumber" className="form-label">
                Target Number
              </label>
              <input
                type="text"
                className="form-control"
                id="targetNumber"
                name="targetNumber"
                value={caseDetails.targetNumber}
                onChange={handleCaseDetailsChange}
              />
            </div>
            <div className="mb-3">
              <label htmlFor="fileInput" className="form-label">
                File Upload
              </label>
              <input
                type="file"
                className="form-control"
                id="fileInput"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileUpload}
              />
              <small className="form-text text-muted d-block mt-2">
                Supported formats: .xlsx, .xls, .csv
              </small>
            </div>
            {excelData.length > 0 && (
              <div className="alert alert-success py-2 px-3 mb-3" role="status">
                File uploaded successfully ({excelData.length} records)
              </div>
            )}
            {error && (
              <div className="alert alert-danger py-2 px-3 mb-3" role="alert">
                {error}
              </div>
            )}
            <button className="btn btn-primary w-100" type="submit">
              Submit
            </button>
          </form>

          <div className="landing-feature-rail">
            {analysisHighlights.map((item) => (
              <article key={item.title} className="landing-feature-card">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="main-container">
      <Header />

      <main className={isHomePage ? 'app-main app-main-home' : 'app-main'}>
        <Routes>
          <Route
            path="/"
            element={homeElement}
          />
          <Route path="/sheet" element={<Sheet />} />
          <Route path="/query/:type" element={<QueryResult />} />
          <Route path="/user-guide" element={<UserGuide />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}

export default App;
