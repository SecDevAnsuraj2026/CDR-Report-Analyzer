import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import './Sheet.css';
import ReusableTable from './components/ReusableTable';
import { useData } from './DataContext';
import { buildRowKey } from './utils/rowKey';
import { sanitizeRowsForOutput } from './utils/reportUtils';

function Sheet() {
  const navigate = useNavigate();
  const { caseDetails, excelData, highlightKeys, setHighlightKeys } = useData();

  const [selectedQuery, setSelectedQuery] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKey, setSelectedRowKey] = useState(null);
  const displayData = useMemo(() => excelData ?? [], [excelData]);
  const preparedRows = useMemo(() => sanitizeRowsForOutput(displayData), [displayData]);

  const preparedDataset = useMemo(
    () =>
      preparedRows.map((preparedRow, index) => ({
        preparedRow,
        sourceRow: displayData[index],
        rowKey: buildRowKey(displayData[index], index),
      })),
    [displayData, preparedRows]
  );

  const columns = useMemo(() => {
    if (preparedRows.length > 0) {
      return Object.keys(preparedRows[0]);
    }
    return [];
  }, [preparedRows]);

  const compactColumns = useMemo(() => {
    const preferredColumns = [
      'Date-Time',
      'B Party Number',
      'B Party',
      'Call Type (In/Out)',
      'Call Type',
      'Duration',
      'IMEI',
      'IMSI',
      'BTS',
      'Cell ID',
      'First Cell ID',
      'Last Cell ID',
    ];

    const prioritized = preferredColumns.filter((column) => columns.includes(column));
    const remaining = columns.filter((column) => !prioritized.includes(column));
    return [...prioritized, ...remaining].slice(0, Math.min(columns.length, 8));
  }, [columns]);

  const mobileColumns = useMemo(() => compactColumns.slice(0, Math.min(compactColumns.length, 4)), [compactColumns]);

  const filteredPreviewRows = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    if (!normalizedSearch) {
      return preparedDataset;
    }

    return preparedDataset.filter(({ preparedRow }) =>
      Object.values(preparedRow).some((value) =>
        String(value ?? '')
          .toLowerCase()
          .includes(normalizedSearch)
      )
    );
  }, [preparedDataset, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredPreviewRows.length / rowsPerPage));
  const paginatedRows = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredPreviewRows.slice(startIndex, startIndex + rowsPerPage);
  }, [currentPage, filteredPreviewRows, rowsPerPage]);

  const selectedRow =
    filteredPreviewRows.find(({ rowKey }) => rowKey === selectedRowKey) ?? null;

  useEffect(() => {
    if (!excelData || excelData.length === 0) {
      navigate('/');
    }
  }, [excelData, navigate]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (filteredPreviewRows.length === 0) {
      setSelectedRowKey(null);
      return;
    }

    const selectedStillVisible = filteredPreviewRows.some(({ rowKey }) => rowKey === selectedRowKey);
    if (!selectedStillVisible) {
      setSelectedRowKey(filteredPreviewRows[0].rowKey);
    }
  }, [filteredPreviewRows, selectedRowKey]);

  useEffect(() => {
    if (highlightKeys.size === 0 || filteredPreviewRows.length === 0) {
      return;
    }

    const matchingHighlightedRow = filteredPreviewRows.find(({ rowKey }) => highlightKeys.has(rowKey));
    if (matchingHighlightedRow && selectedRowKey !== matchingHighlightedRow.rowKey) {
      setSelectedRowKey(matchingHighlightedRow.rowKey);
    }
  }, [filteredPreviewRows, highlightKeys, selectedRowKey]);

  const queryOptions = [
    { id: 'frequent-contact', label: 'Frequent Contact Analysis' },
    { id: 'location-bts', label: 'Location Movement Tracking' },
    { id: 'imei-tracking', label: 'IMEI Tracking' },
    { id: 'imsi-analysis', label: 'IMSI Analysis' },
    { id: 'max-duration', label: 'Maximum Call Duration' },
    { id: 'time-pattern', label: 'Time Pattern Analysis' },
    { id: 'duration-filter', label: 'Duration Filter' },
  ];

  const handleQuerySelect = (queryType) => {
    setSelectedQuery(queryType);
    navigate(`/query/${queryType}`);
  };

  const handleExportExcel = () => {
    try {
      if (preparedRows.length === 0) {
        alert('No Data Found');
        return;
      }

      const ws = XLSX.utils.json_to_sheet(preparedRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Result');
      XLSX.writeFile(wb, 'result.xlsx');
    } catch (err) {
      console.error('Export error:', err);
      alert('Error exporting file');
    }
  };

  const handleClearHighlights = () => {
    setHighlightKeys(new Set());
  };

  const handleRowSelect = (rowKey) => {
    setSelectedRowKey(rowKey);
    const nextHighlights = new Set(highlightKeys);
    nextHighlights.add(rowKey);
    setHighlightKeys(nextHighlights);
  };

  if (!excelData) {
    return <div className="alert alert-warning">No data available. Please upload a file first.</div>;
  }

  const firstVisibleRow = filteredPreviewRows.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1;
  const lastVisibleRow = filteredPreviewRows.length === 0
    ? 0
    : Math.min(currentPage * rowsPerPage, filteredPreviewRows.length);

  return (
    <div className="sheet-container">
      <div className="sheet-header">
        <div className="case-info">
          <h2>Analysis Dashboard</h2>
          <div className="case-details-display">
            <span><strong>Case #:</strong> {caseDetails?.caseNumber}</span>
            <span><strong>Case Name:</strong> {caseDetails?.caseName}</span>
            <span><strong>Target #:</strong> {caseDetails?.targetNumber}</span>
            <span><strong>Records:</strong> {excelData.length}</span>
          </div>
        </div>
        <div className="sheet-actions">
          <button onClick={handleExportExcel} className="btn btn-success btn-sm me-2">
            Export Excel
          </button>
          <button onClick={handleClearHighlights} className="btn btn-outline-warning btn-sm">
            Clear Highlights
          </button>
        </div>
      </div>

      <div className="query-selector">
        <label htmlFor="queryDropdown" className="form-label fw-bold">
          Select Query:
        </label>
        <select
          id="queryDropdown"
          className="form-select"
          value={selectedQuery}
          onChange={(e) => handleQuerySelect(e.target.value)}
        >
          <option value="">-- Select a query to analyze --</option>
          {queryOptions.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>

        <div className="query-shortcuts">
          {queryOptions.map((option) => (
            <button
              key={option.id}
              type="button"
              className={`query-shortcut ${selectedQuery === option.id ? 'is-active' : ''}`}
              onClick={() => handleQuerySelect(option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="data-table-section">
        <div className="sheet-table-heading">
          <div>
            <h3 className="table-title">Workbook View</h3>
            <p className="sheet-table-subtitle">
              Scan the compact rows below, then open the full record details on the right.
            </p>
          </div>
          <div className="sheet-inline-stats">
            <span className="sheet-stat-pill">Visible: {filteredPreviewRows.length}</span>
            <span className="sheet-stat-pill">Columns: {columns.length}</span>
            <span className="sheet-stat-pill">Highlighted: {highlightKeys.size}</span>
          </div>
        </div>

        <div className="sheet-toolbar">
          <div className="sheet-toolbar-search">
            <label htmlFor="sheetSearch" className="form-label fw-bold mb-1">
              Quick Search
            </label>
            <input
              id="sheetSearch"
              type="search"
              className="form-control"
              placeholder="Search number, IMEI, IMSI, BTS, date..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <div className="sheet-toolbar-controls">
            <div className="sheet-page-size">
              <label htmlFor="rowsPerPage" className="form-label fw-bold mb-1">
                Rows Per Page
              </label>
              <select
                id="rowsPerPage"
                className="form-select"
                value={rowsPerPage}
                onChange={(event) => setRowsPerPage(Number(event.target.value))}
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            <div className="sheet-visible-range">
              <span className="sheet-range-label">Showing</span>
              <strong>{firstVisibleRow}-{lastVisibleRow}</strong>
              <span className="sheet-range-label">of {filteredPreviewRows.length}</span>
            </div>
          </div>
        </div>

        {displayData.length === 0 ? (
          <div className="alert alert-info mb-0">No Data Found</div>
        ) : (
          <div className="sheet-workspace">
            <div className="sheet-grid-card">
              <div className="sheet-desktop-view">
                <div className="sheet-grid-wrap">
                  <table className="sheet-grid-table">
                    <thead>
                      <tr>
                        <th className="sheet-grid-index">#</th>
                        {compactColumns.map((column) => (
                          <th key={column}>{column}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginatedRows.length === 0 ? (
                        <tr>
                          <td colSpan={compactColumns.length + 1}>
                            <div className="alert alert-info mb-0">
                              No rows match the current search.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRows.map(({ preparedRow, rowKey }, index) => {
                          const absoluteIndex = (currentPage - 1) * rowsPerPage + index + 1;
                          const isHighlighted = highlightKeys.has(rowKey);
                          const isSelected = selectedRowKey === rowKey;

                          return (
                            <tr
                              key={rowKey}
                              className={[
                                isHighlighted ? 'is-highlighted' : '',
                                isSelected ? 'is-selected' : '',
                              ].join(' ').trim()}
                              onClick={() => handleRowSelect(rowKey)}
                            >
                              <td className="sheet-grid-index">{absoluteIndex}</td>
                              {compactColumns.map((column) => (
                                <td key={column} title={String(preparedRow[column] ?? 'NA')}>
                                  {String(preparedRow[column] ?? 'NA')}
                                </td>
                              ))}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="sheet-mobile-view">
                {paginatedRows.length === 0 ? (
                  <div className="alert alert-info mb-0">
                    No rows match the current search.
                  </div>
                ) : (
                  <div className="sheet-mobile-card-list">
                    {paginatedRows.map(({ preparedRow, rowKey }, index) => {
                      const absoluteIndex = (currentPage - 1) * rowsPerPage + index + 1;
                      const isHighlighted = highlightKeys.has(rowKey);
                      const isSelected = selectedRowKey === rowKey;

                      return (
                        <article
                          key={rowKey}
                          className={`sheet-mobile-card${isSelected ? ' is-selected' : ''}${isHighlighted ? ' is-highlighted' : ''}`}
                          onClick={() => handleRowSelect(rowKey)}
                        >
                          <div className="sheet-mobile-card-header">
                            <div>
                              <span className="sheet-mobile-card-index">Row {absoluteIndex}</span>
                              <h4>{String(preparedRow[mobileColumns[0]] ?? 'Record')}</h4>
                            </div>
                            <button type="button" className="btn btn-outline-primary btn-sm">
                              View
                            </button>
                          </div>

                          <div className="sheet-mobile-card-grid">
                            {mobileColumns.slice(1).map((column) => (
                              <div key={column} className="sheet-mobile-field">
                                <span>{column}</span>
                                <strong>{String(preparedRow[column] ?? 'NA')}</strong>
                              </div>
                            ))}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="sheet-pagination">
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  Previous
                </button>
                <span className="sheet-page-indicator">
                  Page {totalPages === 0 ? 0 : currentPage} of {totalPages}
                </span>
                <button
                  type="button"
                  className="btn btn-outline-primary btn-sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                >
                  Next
                </button>
              </div>
            </div>

            <aside className="sheet-details-panel">
              <div className="sheet-details-header">
                <h4>Selected Record</h4>
                <p>One record at a time, with all fields visible.</p>
              </div>

              {selectedRow ? (
                <>
                  <div className="sheet-details-meta">
                    <span className="sheet-detail-badge">
                      Row {filteredPreviewRows.findIndex(({ rowKey }) => rowKey === selectedRow.rowKey) + 1}
                    </span>
                    {highlightKeys.has(selectedRow.rowKey) && (
                      <span className="sheet-detail-badge sheet-detail-badge-highlight">
                        Highlighted
                      </span>
                    )}
                  </div>

                  <div className="sheet-details-grid">
                    {Object.entries(selectedRow.preparedRow).map(([key, value]) => (
                      <div key={key} className="sheet-detail-card">
                        <span className="sheet-detail-label">{key}</span>
                        <span className="sheet-detail-value">{String(value ?? 'NA')}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="alert alert-info mb-0">
                  Select a row from the sheet to inspect the complete record.
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}

export default Sheet;
