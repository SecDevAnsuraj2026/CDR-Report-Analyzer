import { getField } from './utils';

/**
 * IMSI Analysis
 * Contains 4 query logics related to IMSI (International Mobile Subscriber Identity) and SIM card usage
 */

/**
 * Query 1: IMSI/SIM card history
 * Tracks all SIM cards (IMSI) usage with associated details
 */
export const getIMSISIMHistory = (cdrData, imsi) => {
  if (!cdrData || cdrData.length === 0) return [];

  const records = cdrData
    .filter(record => {
      const recordIMSI = getField(record, ['IMSI', 'imsi']);
      return String(recordIMSI) === String(imsi);
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration': getField(record, ['Call Duration', 'Duration', 'Duration (sec)'], '0'),
      'IMEI': getField(record, ['IMEI', 'imei']),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID']),
      'IMSI': imsi
    }));

  return records.slice(0, 100);
};

/**
 * Query 2: IMSI Timeline Analysis
 * Provides timeline of SIM card usage patterns
 */
export const getIMSITimelineAnalysis = (cdrData, imsi) => {
  if (!cdrData || cdrData.length === 0) return [];

  const records = cdrData
    .filter(record => {
      const recordIMSI = getField(record, ['IMSI', 'imsi']);
      return String(recordIMSI) === String(imsi);
    })
    .map(record => ({
      'DateTime': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']),
      'Call Type': getField(record, ['Call Type', 'callType', 'Type of Connection']),
      'Duration': getField(record, ['Call Duration', 'Duration', 'Duration (sec)'], '0'),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'IMEI Used': getField(record, ['IMEI', 'imei'])
    }))
    .sort((a, b) => new Date(a['DateTime']) - new Date(b['DateTime']));

  return records.slice(0, 100);
};

/**
 * Query 3: IMSI to Operator Mapping
 * Maps IMSI to network operators and carriers
 */
export const getIMSIOperatorMapping = (cdrData, imsi) => {
  if (!cdrData || cdrData.length === 0) return [];

  // IMSI format: first 3 digits = country code, next 2 digits = operator code
  const imsiStr = String(imsi);
  const countryCode = imsiStr.substring(0, 3);
  const operatorCode = imsiStr.substring(3, 5);

  // Common operator codes (simplified mapping)
  const operatorMap = {
    '01': 'Operator 1 (Primary)',
    '02': 'Operator 2 (Secondary)',
    '03': 'Operator 3 (Tertiary)',
    '04': 'Operator 4 (Regional)',
    '05': 'Operator 5 (Mobile)',
  };

  const records = cdrData
    .filter(record => {
      const recordIMSI = record['IMSI'] || record['imsi'] || 'Unknown';
      return recordIMSI === imsi;
    });

  if (records.length === 0) {
    return [{
      'IMSI': imsi,
      'Country Code': countryCode,
      'Operator Code': operatorCode,
      'Operator': operatorMap[operatorCode] || 'Unknown Operator',
      'Call Count': 0
    }];
  }

  return [{
    'IMSI': imsi,
    'Country Code': countryCode,
    'Operator Code': operatorCode,
    'Operator': operatorMap[operatorCode] || 'Unknown Operator',
    'Call Count': records.length,
    'First Call': records[0]['Date-Time'] || 'N/A',
    'Last Call': records[records.length - 1]['Date-Time'] || 'N/A'
  }];
};

/**
 * Query 4: IMSI Activity Pattern
 * Analyzes activity patterns for each SIM/IMSI
 */
export const getIMSIActivityPattern = (cdrData, imsi) => {
  if (!cdrData || cdrData.length === 0) return [];

  const imsiRecords = cdrData.filter(record => {
    const recordIMSI = record['IMSI'] || record['imsi'] || 'Unknown';
    return recordIMSI === imsi;
  });

  if (imsiRecords.length === 0) {
    return [{
      'Metric': 'No activity found for this IMSI',
      'Value': '0'
    }];
  }

  // Calculate unique contacts
  const uniqueContacts = new Set(imsiRecords.map(r => r['B Party'] || r['bParty'] || 'Unknown'));
  
  // Calculate total duration
  const totalDuration = imsiRecords.reduce((sum, r) => {
    return sum + (parseInt(r['Duration'] || r['duration'] || '0') || 0);
  }, 0);

  // Calculate call types
  const callTypes = {};
  imsiRecords.forEach(r => {
    const type = r['Call Type'] || r['callType'] || 'Unknown';
    callTypes[type] = (callTypes[type] || 0) + 1;
  });

  // Calculate unique devices
  const uniqueDevices = new Set(imsiRecords.map(r => r['IMEI'] || r['imei'] || 'Unknown'));

  return [
    { 'Metric': 'IMSI', 'Value': imsi },
    { 'Metric': 'Total Calls', 'Value': imsiRecords.length },
    { 'Metric': 'Unique Contacts', 'Value': uniqueContacts.size },
    { 'Metric': 'Devices Used', 'Value': uniqueDevices.size },
    { 'Metric': 'Total Duration (seconds)', 'Value': totalDuration },
    { 'Metric': 'Average Duration (seconds)', 'Value': Math.round(totalDuration / imsiRecords.length) },
    ...Object.entries(callTypes).map(([type, count]) => ({
      'Metric': 'Calls - ' + type,
      'Value': count
    }))
  ];
};

export default {
  getIMSISIMHistory,
  getIMSITimelineAnalysis,
  getIMSIOperatorMapping,
  getIMSIActivityPattern
};
