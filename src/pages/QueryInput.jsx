import { useState } from 'react';

function QueryInput({ onInputsChange, queryType }) {
  const [inputs, setInputs] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newInputs = {
      ...inputs,
      [name]: value,
    };
    setInputs(newInputs);
    onInputsChange?.(newInputs);
  };

  const renderInputs = () => {
    switch (queryType) {
      case 'frequent-contact':
        return (
          <div className="alert alert-info">
            <p>No parameters needed for Frequent Contact Analysis.</p>
            <small>This query analyzes all B Party entries and counts frequency</small>
          </div>
        );

      case 'location-bts':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Mode</label>
              <select
                className="form-select"
                name="locationMode"
                value={inputs.locationMode || 'most-active'}
                onChange={handleInputChange}
              >
                <option value="most-active">Most Active BTS</option>
                <option value="timeline">BTS Timeline (date range)</option>
                <option value="presence">BTS Presence (specific BTS ID)</option>
                <option value="contacts">BTS Contacts (specific BTS ID)</option>
              </select>
            </div>
            {(inputs.locationMode === 'timeline' || !inputs.locationMode) && (
              <>
                <div className="mb-3">
                  <label className="form-label">Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="startDate"
                    value={inputs.startDate || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="endDate"
                    value={inputs.endDate || ''}
                    onChange={handleInputChange}
                  />
                </div>
              </>
            )}
            <div className="mb-3">
              <label className="form-label">BTS ID (for presence/contacts)</label>
              <input
                type="text"
                className="form-control"
                name="btsId"
                placeholder="e.g., BTS001"
                value={inputs.btsId || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case 'imei-tracking':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Mode</label>
              <select
                className="form-select"
                name="imeiMode"
                value={inputs.imeiMode || 'sim-usage'}
                onChange={handleInputChange}
              >
                <option value="sim-usage">SIM usage per IMEI</option>
                <option value="device-location">Device BTS location</option>
                <option value="usage-duration">Device duration by date</option>
                <option value="call-summary">Call type summary</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">IMEI Number *</label>
              <input
                type="text"
                className="form-control"
                name="imei"
                placeholder="e.g., 356938035643809"
                value={inputs.imei || ''}
                onChange={handleInputChange}
                required
              />
              <small className="form-text text-muted">Device IMEI to track</small>
            </div>
            <div className="mb-3">
              <label className="form-label">Date (optional)</label>
              <input
                type="date"
                className="form-control"
                name="date"
                value={inputs.date || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case 'imsi-analysis':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Mode</label>
              <select
                className="form-select"
                name="imsiMode"
                value={inputs.imsiMode || 'sim-history'}
                onChange={handleInputChange}
              >
                <option value="sim-history">SIM history</option>
                <option value="timeline">Timeline analysis</option>
                <option value="operator-map">Operator mapping</option>
                <option value="activity-pattern">Activity pattern</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">IMSI Number *</label>
              <input
                type="text"
                className="form-control"
                name="imsi"
                placeholder="e.g., 310410567890123"
                value={inputs.imsi || ''}
                onChange={handleInputChange}
                required
              />
              <small className="form-text text-muted">SIM IMSI to analyze</small>
            </div>
          </>
        );

      case 'max-duration':
        return (
          <div className="alert alert-info">
            <p>No parameters needed for Maximum Call Duration.</p>
            <small>This query finds the longest duration call records</small>
          </div>
        );

      case 'time-pattern':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Start Time (Hour: 0-23)</label>
              <input
                type="number"
                className="form-control"
                name="startHour"
                min="0"
                max="23"
                placeholder="0"
                value={inputs.startHour || ''}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">End Time (Hour: 0-23)</label>
              <input
                type="number"
                className="form-control"
                name="endHour"
                min="0"
                max="23"
                placeholder="23"
                value={inputs.endHour || ''}
                onChange={handleInputChange}
              />
            </div>
          </>
        );

      case 'duration-filter':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Minimum Duration (seconds) *</label>
              <input
                type="number"
                className="form-control"
                name="minDuration"
                min="0"
                placeholder="e.g., 60"
                value={inputs.minDuration || ''}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Call Type</label>
              <select
                className="form-select"
                name="callType"
                value={inputs.callType || ''}
                onChange={handleInputChange}
              >
                <option value="">-- Select or leave blank --</option>
                <option value="Incoming">Incoming</option>
                <option value="Outgoing">Outgoing</option>
                <option value="Missed">Missed</option>
              </select>
            </div>
          </>
        );

      default:
        return <p className="text-muted">Select a query type first</p>;
    }
  };

  return (
    <div className="query-input-form">
      <h5>Query Parameters</h5>
      {renderInputs()}
    </div>
  );
}

export default QueryInput;
