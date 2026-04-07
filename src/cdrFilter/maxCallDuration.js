import { getField, getNumericField } from './utils';

/**
 * Max Call Duration
 * Logic for finding and analyzing longest duration calls
 */

/**
 * Gets the longest call duration records
 * @param {Array} cdrData - Array of CDR records
 * @param {Number} limit - Maximum number of records to return
 * @returns {Array} - Call records sorted by duration (longest first)
 */
export const getMaxCallDuration = (cdrData, limit = 50) => {
  if (!cdrData || cdrData.length === 0) return [];

  const results = cdrData
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration (sec)': getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0),
      'Duration (min)': (getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0) / 60).toFixed(2),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection']),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First BTS Location-Address', 'Last BTS Location-Address']),
      'IMEI': getField(record, ['IMEI', 'imei'])
    }))
    .sort((a, b) => b['Duration (sec)'] - a['Duration (sec)'])
    .slice(0, limit);

  return results;
};

/**
 * Filters calls by minimum duration threshold
 * @param {Array} cdrData - Array of CDR records
 * @param {Number} minDuration - Minimum duration in seconds
 * @returns {Array} - Filtered call records
 */
export const filterCallsByMinDuration = (cdrData, minDuration) => {
  if (!cdrData || cdrData.length === 0) return [];

  return cdrData
    .filter(record => {
      const duration = parseInt(record['Duration'] || record['duration'] || '0') || 0;
      return duration >= minDuration;
    })
    .map(record => ({
      'DateTime': record['Date-Time'] || record['datetime'] || 'N/A',
      'B Party': record['B Party'] || record['bParty'] || 'N/A',
      'Duration (sec)': parseInt(record['Duration'] || record['duration'] || '0') || 0,
      'Duration (min)': (parseInt(record['Duration'] || record['duration'] || '0') / 60).toFixed(2),
      'Call Type': record['Call Type'] || record['callType'] || 'N/A'
    }))
    .sort((a, b) => b['Duration (sec)'] - a['Duration (sec)']);
};

/**
 * Gets statistics on call duration
 * @param {Array} cdrData - Array of CDR records
 * @returns {Array} - Statistics object with min, max, average, median
 */
export const getCallDurationStatistics = (cdrData) => {
  if (!cdrData || cdrData.length === 0) {
    return [{
      'Statistic': 'No data available',
      'Value': '0'
    }];
  }

  const durations = cdrData
    .map(r => parseInt(r['Duration'] || r['duration'] || '0') || 0)
    .filter(d => d > 0)
    .sort((a, b) => a - b);

  if (durations.length === 0) {
    return [{
      'Statistic': 'No valid durations found',
      'Value': '0'
    }];
  }

  const total = durations.reduce((a, b) => a + b, 0);
  const avg = Math.round(total / durations.length);
  const median = durations[Math.floor(durations.length / 2)];
  const min = durations[0];
  const max = durations[durations.length - 1];

  return [
    { 'Statistic': 'Total Calls', 'Value': cdrData.length },
    { 'Statistic': 'Calls with Duration', 'Value': durations.length },
    { 'Statistic': 'Min Duration (sec)', 'Value': min },
    { 'Statistic': 'Max Duration (sec)', 'Value': max },
    { 'Statistic': 'Max Duration (min)', 'Value': (max / 60).toFixed(2) },
    { 'Statistic': 'Average Duration (sec)', 'Value': avg },
    { 'Statistic': 'Average Duration (min)', 'Value': (avg / 60).toFixed(2) },
    { 'Statistic': 'Median Duration (sec)', 'Value': median },
    { 'Statistic': 'Total Duration (sec)', 'Value': total },
    { 'Statistic': 'Total Duration (hours)', 'Value': (total / 3600).toFixed(2) }
  ];
};

export default {
  getMaxCallDuration,
  filterCallsByMinDuration,
  getCallDurationStatistics
};
