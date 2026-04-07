import { getField, getNumericField } from './utils';

/**
 * IMEI Tracking
 * Contains 4 query logics related to IMEI (International Mobile Equipment Identity) tracking
 */

/**
 * Query 1: IMEI SIM/Number Usage
 * Tracks all numbers used with a specific IMEI device
 */
export const getIMEISimUsage = (cdrData, imei) => {
  if (!cdrData || cdrData.length === 0) return [];

  const records = cdrData
    .filter(record => {
      const recordIMEI = getField(record, ['IMEI', 'imei']);
      return String(recordIMEI) === String(imei);
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration': getField(record, ['Call Duration', 'Duration', 'Duration (sec)']),
      'IMSI': getField(record, ['IMSI', 'imsi']),
      'IMEI': imei
    }));

  return records.slice(0, 100);
};

/**
 * Query 2: IMEI Location History
 * Shows BTS locations where IMEI was used
 */
export const getIMEILocation = (cdrData, imei) => {
  if (!cdrData || cdrData.length === 0) return [];

  const locations = {};

  cdrData
    .filter(record => {
      const recordIMEI = getField(record, ['IMEI', 'imei']);
      return String(recordIMEI) === String(imei);
    })
    .forEach(record => {
      const bts = getField(record, ['BTS', 'BTS ID', 'Cell ID']);
      if (bts && bts !== 'NA') {
        locations[bts] = (locations[bts] || 0) + 1;
      }
    });

  return Object.entries(locations)
    .map(([bts, count]) => ({
      'BTS Location': bts,
      'Usage Count': count,
      'IMEI': imei
    }))
    .sort((a, b) => b['Usage Count'] - a['Usage Count']);
};

/**
 * Query 3: IMEI Duration Analysis
 * Analyzes call durations for specific IMEI
 */
export const getIMEIDuration = (cdrData, imei) => {
  if (!cdrData || cdrData.length === 0) return [];

  const durationData = cdrData
    .filter(record => {
      const recordIMEI = getField(record, ['IMEI', 'imei']);
      return String(recordIMEI) === String(imei);
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration (sec)': getNumericField(record, ['Call Duration', 'Duration', 'Duration (sec)'], 0),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection'])
    }))
    .sort((a, b) => b['Duration (sec)'] - a['Duration (sec)']);

  // Add statistics
  if (durationData.length > 0) {
    const durations = durationData.map(d => d['Duration (sec)']);
    const total = durations.reduce((a, b) => a + b, 0);
    const avg = Math.round(total / durations.length);
    const max = Math.max(...durations);
    const min = Math.min(...durations);

    // Add a summary row at the beginning
    durationData.unshift({
      'DateTime': '*** SUMMARY ***',
      'Summary': 'Total Calls: ' + durations.length,
      'B Party': 'Avg Duration: ' + avg + 's',
      'Duration (sec)': total,
      'Call Type': 'Max: ' + max + 's, Min: ' + min + 's'
    });
  }

  return durationData;
};

/**
 * Query 4: IMEI Call Summary
 * Summary statistics for IMEI device
 */
export const getIMEICallSummary = (cdrData, imei) => {
  if (!cdrData || cdrData.length === 0) return [];

  const imeiRecords = cdrData.filter(record => {
    const recordIMEI = getField(record, ['IMEI', 'imei']);
    return String(recordIMEI) === String(imei);
  });

  if (imeiRecords.length === 0) {
    return [{
      'Metric': 'No calls found for this IMEI',
      'Value': '0'
    }];
  }

  // Calculate unique contacts
  const uniqueContacts = new Set(imeiRecords.map(r => getField(r, ['B Party', 'B Party Number', 'bParty', 'BParty'])));
  
  // Calculate total duration
  const totalDuration = imeiRecords.reduce((sum, r) => {
    return sum + getNumericField(r, ['Call Duration', 'Duration', 'Duration (sec)'], 0);
  }, 0);

  // Calculate call types
  const callTypes = {};
  imeiRecords.forEach(r => {
    const type = getField(r, ['Call Type', 'callType', 'Type of Connection'], 'Unknown');
    callTypes[type] = (callTypes[type] || 0) + 1;
  });

  return [
    { 'Metric': 'IMEI', 'Value': imei },
    { 'Metric': 'Total Calls', 'Value': imeiRecords.length },
    { 'Metric': 'Unique Contacts', 'Value': uniqueContacts.size },
    { 'Metric': 'Total Duration (seconds)', 'Value': totalDuration },
    { 'Metric': 'Average Duration (seconds)', 'Value': Math.round(totalDuration / imeiRecords.length) },
    ...Object.entries(callTypes).map(([type, count]) => ({
      'Metric': 'Calls - ' + type,
      'Value': count
    }))
  ];
};

export default {
  getIMEISimUsage,
  getIMEILocation,
  getIMEIDuration,
  getIMEICallSummary
};
