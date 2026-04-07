import { useMemo } from 'react';
import { sanitizeRowsForOutput } from '../utils/reportUtils';

function ReusableTable({
  data,
  highlightedRows = new Set(),
  highlightKeys = new Set(),
  rowKeyFn,
  onRowClick,
  maxRows = null,
}) {
  const safeData = useMemo(() => data ?? [], [data]);
  const preparedRows = useMemo(() => sanitizeRowsForOutput(safeData), [safeData]);

  const columns = useMemo(() => {
    if (preparedRows.length > 0) {
      return Object.keys(preparedRows[0]);
    }
    return [];
  }, [preparedRows]);

  if (preparedRows.length === 0 || columns.length === 0) {
    return <div className="alert alert-info mb-0">No Data Found</div>;
  }

  const visibleSourceRows = maxRows ? safeData.slice(0, maxRows) : safeData;
  const visiblePreparedRows = maxRows ? preparedRows.slice(0, maxRows) : preparedRows;

  return (
    <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
      <table className="table table-striped table-hover table-sm">
        <thead className="table-dark">
          <tr>
            {columns.map((col, idx) => (
              <th key={idx} style={{ minWidth: '100px', fontSize: '0.875rem' }}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visiblePreparedRows.map((preparedRow, rowIdx) => {
            const sourceRow = visibleSourceRows[rowIdx];
            const rowKey = rowKeyFn ? rowKeyFn(sourceRow, rowIdx) : rowIdx;
            const isHighlighted = highlightKeys.has(rowKey) || highlightedRows.has(rowIdx);

            return (
              <tr
                key={rowIdx}
                className={isHighlighted ? 'table-warning' : ''}
                style={{ cursor: onRowClick ? 'pointer' : 'default', fontSize: '0.875rem' }}
                onClick={() => onRowClick && onRowClick(sourceRow, rowKey, rowIdx)}
              >
                {columns.map((col, colIdx) => (
                  <td key={colIdx}>
                    {preparedRow[col] !== null && preparedRow[col] !== undefined
                      ? String(preparedRow[col]).substring(0, 100)
                      : '-'}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default ReusableTable;

