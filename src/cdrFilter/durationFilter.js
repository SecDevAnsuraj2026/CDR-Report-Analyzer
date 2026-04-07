import { getField, getNumericField } from './utils';

/**
 * Duration Filter
 * Filter CDR/IPDR records based on duration and call type
 */

/**
 * Filters records by duration range
 * @param {Array} cdrData - Array of CDR records
 * @param {Number} minDuration - Minimum duration in seconds
 * @param {String} callType - Optional call type filter
 * @returns {Array} - Filtered records within duration range and call type
 */
export const filterByDurationRange = (cdrData, minDuration, callType = null) => {
  if (!cdrData || cdrData.length === 0) return [];

  return cdrData
    .filter(record => {
      const duration = getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0);
      const type = getField(record, ['Call Type', 'callType', 'Type of Connection'], 'Unknown');
      
      const durationMatch = duration >= minDuration;
      const typeMatch = !callType || String(type).trim() === String(callType).trim();
      
      return durationMatch && typeMatch;
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration (sec)': getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0),
      'Duration (min)': (getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0) / 60).toFixed(2),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection'], 'N/A'),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First BTS Location-Address', 'Last BTS Location-Address'], 'Unknown'),
      'IMEI': getField(record, ['IMEI', 'imei'], 'Unknown')
    }))
    .sort((a, b) => b['Duration (sec)'] - a['Duration (sec)']);
};

/**
 * Filters records by call type
 * @param {Array} cdrData - Array of CDR records
 * @param {String} callType - Type of call (Incoming, Outgoing, Missed, etc.)
 * @returns {Array} - Filtered records matching call type
 */
export const filterByCallType = (cdrData, callType) => {
  if (!cdrData || cdrData.length === 0) return [];

  return cdrData
    .filter(record => {
      const type = getField(record, ['Call Type', 'callType', 'Type of Connection'], 'Unknown');
      return String(type).trim() === String(callType).trim();
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration (sec)': getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection'], 'N/A'),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First BTS Location-Address', 'Last BTS Location-Address'], 'Unknown')
    }));
};

/**
 * Combines duration and call type filters
 * @param {Array} cdrData - Array of CDR records
 * @param {Object} filterCriteria - Object with minDuration, maxDuration, callType
 * @returns {Array} - Filtered records matching all criteria
 */
export const applyDurationAndTypeFilter = (cdrData, filterCriteria) => {
  if (!cdrData || cdrData.length === 0) return [];

  const minDuration = filterCriteria.minDuration || 0;
  const maxDuration = filterCriteria.maxDuration || Infinity;
  const callType = filterCriteria.callType || null;

  return cdrData
    .filter(record => {
      const duration = getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0);
      const type = getField(record, ['Call Type', 'callType', 'Type of Connection'], 'Unknown');
      
      const durationMatch = duration >= minDuration && duration <= maxDuration;
      const typeMatch = !callType || String(type).trim() === String(callType).trim();
      
      return durationMatch && typeMatch;
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration (sec)': getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection'], 'N/A'),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First BTS Location-Address', 'Last BTS Location-Address'], 'Unknown')
    }))
    .sort((a, b) => b['Duration (sec)'] - a['Duration (sec)']);
};

/**
 * Gets statistics on call duration by type
 * @param {Array} cdrData - Array of CDR records
 * @returns {Array} - Statistics organized by call type
 */
export const getDurationStatisticsByType = (cdrData) => {
  if (!cdrData || cdrData.length === 0) {
    return [{
      'Call Type': 'No data available',
      'Count': 0,
      'Avg Duration': 0,
      'Max Duration': 0,
      'Min Duration': 0
    }];
  }

  const typeStats = {};

  // Group by call type
  cdrData.forEach(record => {
    const type = record['Call Type'] || record['callType'] || 'Unknown';
    const duration = parseInt(record['Duration'] || record['duration'] || '0') || 0;

    if (!typeStats[type]) {
      typeStats[type] = {
        count: 0,
        totalDuration: 0,
        maxDuration: 0,
        minDuration: Infinity,
        durations: []
      };
    }

    typeStats[type].count += 1;
    typeStats[type].totalDuration += duration;
    typeStats[type].maxDuration = Math.max(typeStats[type].maxDuration, duration);
    typeStats[type].minDuration = Math.min(typeStats[type].minDuration, duration);
    typeStats[type].durations.push(duration);
  });

  // Calculate statistics
  return Object.entries(typeStats)
    .map(([type, stats]) => ({
      'Call Type': type,
      'Count': stats.count,
      'Avg Duration (sec)': Math.round(stats.totalDuration / stats.count),
      'Max Duration (sec)': stats.maxDuration,
      'Min Duration (sec)': stats.minDuration === Infinity ? 0 : stats.minDuration,
      'Total Duration (sec)': stats.totalDuration,
      'Percentage': ((stats.count / cdrData.length) * 100).toFixed(2) + '%'
    }))
    .sort((a, b) => b.Count - a.Count);
};

export default {
  filterByDurationRange,
  filterByCallType,
  applyDurationAndTypeFilter,
  getDurationStatisticsByType
};
