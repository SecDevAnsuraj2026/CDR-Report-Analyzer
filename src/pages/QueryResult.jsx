import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import * as XLSX from 'xlsx';
import '../Sheet.css';
import ReusableTable from '../components/ReusableTable';
import QueryInput from './QueryInput';
import { useData } from '../DataContext';
import { buildRowKey } from '../utils/rowKey';
import { getField, getNumericField } from '../cdrFilter/utils';
import { parseDateTimeValue, sanitizeRowsForOutput } from '../utils/reportUtils';
import * as frequentContact from '../cdrFilter/frequentContact';
import * as locationBTS from '../cdrFilter/locationBTS';
import * as imeiTracking from '../cdrFilter/imeiTracking';
import * as imsiAnalysis from '../cdrFilter/imsiAnalysis';
import * as maxCallDuration from '../cdrFilter/maxCallDuration';
import * as timePattern from '../cdrFilter/timePattern';
import * as durationFilter from '../cdrFilter/durationFilter';

function QueryResult() {
  const { type } = useParams();
  const navigate = useNavigate();
  const { excelData = [], setHighlightKeys } = useData();

  const [queryResults, setQueryResults] = useState(null);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const queryTypeMap = {
    'frequent-contact': 'Frequent Contact Analysis',
    'location-bts': 'Location Movement Tracking',
    'imei-tracking': 'IMEI Tracking',
    'imsi-analysis': 'IMSI Analysis',
    'max-duration': 'Maximum Call Duration',
    'time-pattern': 'Time Pattern Analysis',
    'duration-filter': 'Duration Filter',
  };

  const dataset = excelData;
  const filteredRows = useMemo(() => sanitizeRowsForOutput(queryResults ?? []), [queryResults]);

  const executeQuery = () => {
    if (!dataset || dataset.length === 0) {
      setError('No dataset available');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let results = null;

      switch (type) {
        case 'frequent-contact':
          results = frequentContact.analyzeFrequentContact(dataset);
          break;

        case 'location-bts':
          switch (inputs.locationMode) {
            case 'timeline':
              if (!inputs.startDate || !inputs.endDate) {
                setError('Please select start and end date for timeline');
                setLoading(false);
                return;
              }
              results = locationBTS.getBTSTimeline(dataset, inputs.startDate, inputs.endDate);
              break;
            case 'presence':
              if (!inputs.btsId) {
                setError('Please enter BTS ID for presence');
                setLoading(false);
                return;
              }
              results = locationBTS.getBTSPresence(dataset, inputs.btsId);
              break;
            case 'contacts':
              if (!inputs.btsId) {
                setError('Please enter BTS ID for contacts');
                setLoading(false);
                return;
              }
              results = locationBTS.getBTSContacts(dataset, inputs.btsId);
              break;
            default:
              results = locationBTS.getMostActiveBTS(dataset);
              break;
          }
          break;

        case 'imei-tracking':
          if (!inputs.imei) {
            setError('Please enter an IMEI number');
            setLoading(false);
            return;
          }
          switch (inputs.imeiMode) {
            case 'device-location':
              results = imeiTracking.getIMEILocation(dataset, inputs.imei);
              break;
            case 'usage-duration':
              results = imeiTracking.getIMEIDuration(dataset, inputs.imei);
              if (inputs.date) {
                results = results.filter((row) => row.DateTime && row.DateTime.startsWith(inputs.date));
              }
              break;
            case 'call-summary':
              results = imeiTracking.getIMEICallSummary(dataset, inputs.imei);
              break;
            default:
              results = imeiTracking.getIMEISimUsage(dataset, inputs.imei);
              break;
          }
          break;

        case 'imsi-analysis':
          if (!inputs.imsi) {
            setError('Please enter an IMSI number');
            setLoading(false);
            return;
          }
          switch (inputs.imsiMode) {
            case 'timeline':
              results = imsiAnalysis.getIMSITimelineAnalysis(dataset, inputs.imsi);
              break;
            case 'operator-map':
              results = imsiAnalysis.getIMSIOperatorMapping(dataset, inputs.imsi);
              break;
            case 'activity-pattern':
              results = imsiAnalysis.getIMSIActivityPattern(dataset, inputs.imsi);
              break;
            default:
              results = imsiAnalysis.getIMSISIMHistory(dataset, inputs.imsi);
              break;
          }
          break;

        case 'max-duration':
          results = maxCallDuration.getMaxCallDuration(dataset);
          break;

        case 'time-pattern':
          if (!inputs.startHour && inputs.startHour !== 0) {
            setError('Please enter start hour (0-23)');
            setLoading(false);
            return;
          }
          results = timePattern.analyzeTimePattern(dataset, inputs);
          break;

        case 'duration-filter':
          if (!inputs.minDuration && inputs.minDuration !== 0) {
            setError('Please enter minimum duration');
            setLoading(false);
            return;
          }
          results = durationFilter.filterByDurationRange(
            dataset,
            parseInt(inputs.minDuration, 10),
            inputs.callType
          );
          break;

        default:
          setError('Unknown query type');
      }

      if (!results || (Array.isArray(results) && results.length === 0)) {
        setQueryResults([]);
        if (setHighlightKeys) {
          setHighlightKeys(new Set());
        }
      } else {
        setQueryResults(results);
        if (setHighlightKeys) {
          setHighlightKeys(new Set());
        }
      }
    } catch (err) {
      console.error('Query execution error:', err);
      setError('Error executing query: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getRelatedRowKeys = (resultRow) => {
    const keys = new Set();

    switch (type) {
      case 'frequent-contact': {
        const targetBParty = resultRow['B Party'] || resultRow['B Party Number'] || '';
        dataset.forEach((row) => {
          const bParty = getField(row, ['B Party', 'B Party Number', 'bParty', 'b_party'], '');
          if (String(bParty).trim() === String(targetBParty).trim()) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      case 'location-bts': {
        const bts = resultRow.BTS || resultRow['BTS ID'] || resultRow['BTS Id'] || '';
        const dateTime = resultRow['Date-Time'] || resultRow.DateTime || '';
        const parsedResultDate = parseDateTimeValue(dateTime);

        dataset.forEach((row) => {
          const rowBTS = getField(row, ['BTS', 'BTS ID', 'Cell ID', 'First Cell ID', 'Last Cell ID'], '');
          const rowTime = getField(row, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime'], '');
          const parsedRowDate = parseDateTimeValue(rowTime);

          const btsMatches = bts && String(rowBTS).trim() === String(bts).trim();
          const timeMatches =
            parsedResultDate && parsedRowDate
              ? parsedResultDate.toISOString() === parsedRowDate.toISOString()
              : true;

          if (btsMatches || (!bts && dateTime && timeMatches)) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      case 'imei-tracking': {
        const imei = resultRow.IMEI || resultRow.imei || '';
        dataset.forEach((row) => {
          const rowIMEI = getField(row, ['IMEI', 'imei'], '');
          if (String(rowIMEI).trim() === String(imei).trim()) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      case 'imsi-analysis': {
        const imsi = resultRow.IMSI || resultRow.imsi || '';
        dataset.forEach((row) => {
          const rowIMSI = getField(row, ['IMSI', 'imsi'], '');
          if (String(rowIMSI).trim() === String(imsi).trim()) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      case 'max-duration': {
        const targetDuration = resultRow['Duration (sec)'] || resultRow.Duration || 0;
        const targetBParty = resultRow['B Party'] || resultRow.BParty || resultRow['B Party Number'] || '';
        dataset.forEach((row) => {
          const rowDuration = getNumericField(row, ['Call Duration', 'Duration', 'Duration (sec)'], 0);
          const rowBParty = getField(row, ['B Party', 'B Party Number', 'bParty'], '');
          if (String(targetBParty).trim() && String(rowBParty).trim() === String(targetBParty).trim()) {
            keys.add(buildRowKey(row));
          } else if (rowDuration === Number(targetDuration)) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      case 'time-pattern': {
        const slot = resultRow['Time Slot'] || '';
        if (!slot) break;

        const [start, end] = slot.split(' ').shift().split('-');
        const from = parseInt(start, 10);
        const to = parseInt(end, 10);

        dataset.forEach((row) => {
          const rowTime = getField(row, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime'], '');
          const parsedDate = parseDateTimeValue(rowTime);
          if (parsedDate) {
            const hour = parsedDate.getHours();
            if (hour >= from && hour < to) {
              keys.add(buildRowKey(row));
            }
          }
        });
        break;
      }

      case 'duration-filter': {
        const minDuration = parseInt(resultRow['Duration (sec)'] || resultRow.Duration || '0', 10);
        const callType = resultRow['Call Type'] || '';
        dataset.forEach((row) => {
          const rowDuration = getNumericField(row, ['Call Duration', 'Duration', 'Duration (sec)'], 0);
          const rowCallType = getField(row, ['Call Type', 'callType', 'Type of Connection'], '');
          if (rowDuration >= minDuration && (!callType || String(rowCallType).trim() === String(callType).trim())) {
            keys.add(buildRowKey(row));
          }
        });
        break;
      }

      default:
        break;
    }

    return keys;
  };

  const handleInputsChange = (newInputs) => {
    setInputs(newInputs);
  };

  const handleExportQueryResults = () => {
    if (filteredRows.length === 0) {
      alert('No Data Found');
      return;
    }

    try {
      const ws = XLSX.utils.json_to_sheet(filteredRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Result');
      XLSX.writeFile(wb, 'result.xlsx');
    } catch (err) {
      console.error('Export error:', err);
      alert('Error exporting query results');
    }
  };

  if (!dataset || dataset.length === 0) {
    return (
      <div className="text-center mt-5">
        <div className="alert alert-warning">
          <p>No dataset available. Please go back and upload a file.</p>
          <button className="btn btn-primary" onClick={() => navigate('/')}>
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="query-result-container">
      <div className="row">
        <div className="col-md-3 mb-4">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">Query Parameters</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <h6>Query Type:</h6>
                <p className="fw-bold text-success">{queryTypeMap[type]}</p>
              </div>

              <QueryInput queryType={type} onInputsChange={handleInputsChange} />

              <button className="btn btn-success w-100 mt-3" onClick={executeQuery} disabled={loading}>
                {loading ? 'Executing...' : 'Execute Query'}
              </button>

              <button className="btn btn-secondary w-100 mt-2" onClick={() => navigate('/sheet')}>
                Back to Sheet
              </button>
            </div>
          </div>
        </div>

        <div className="col-md-9 mb-4">
          <div className="card">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0">
                Query Results
                {filteredRows.length > 0 && ` (${filteredRows.length} records)`}
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              {!queryResults && !error && <div className="alert alert-info">Click "Execute Query" to run the analysis</div>}

              {queryResults && queryResults.length === 0 && <div className="alert alert-info">No Data Found</div>}

              {queryResults && queryResults.length > 0 && (
                <div className="alert alert-secondary mt-2">
                  Click a row to highlight related records in the main sheet.
                </div>
              )}

              {queryResults && queryResults.length > 0 && (
                <>
                  <div className="result-stats mb-3">
                    <span className="badge bg-primary me-2">Records: {filteredRows.length}</span>
                    {filteredRows.length > 0 && (
                      <span className="badge bg-success">Columns: {Object.keys(filteredRows[0]).length}</span>
                    )}
                  </div>

                  <div className="mb-3">
                    <button className="btn btn-outline-success btn-sm" onClick={handleExportQueryResults}>
                      Export Results to Excel
                    </button>
                    <button className="btn btn-outline-primary btn-sm ms-2" onClick={() => navigate('/sheet')}>
                      View Highlighted Rows in Sheet
                    </button>
                  </div>

                  <ReusableTable
                    data={queryResults}
                    maxRows={50}
                    rowKeyFn={buildRowKey}
                    onRowClick={(row) => {
                      const keys = getRelatedRowKeys(row);
                      if (setHighlightKeys) setHighlightKeys(keys);
                      navigate('/sheet');
                    }}
                  />

                  {queryResults.length > 50 && (
                    <p className="text-muted mt-3 small">
                      Showing first 50 of {filteredRows.length} records
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QueryResult;
