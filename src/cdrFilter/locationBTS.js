import { getField } from './utils';

/**
 * Location BTS Tracking
 * Contains 4 query logics related to BTS (Base Transceiver Station) tracking
 */

/**
 * Query 1: Most Active BTS
 * Counts BTS frequency to identify most commonly used towers
 */
export const getMostActiveBTS = (cdrData) => {
  if (!cdrData || cdrData.length === 0) return [];

  const btsFrequency = {};

  cdrData.forEach(record => {
    const bts = getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First Cell ID', 'Last Cell ID']);
    if (bts && bts !== 'NA') {
      btsFrequency[bts] = (btsFrequency[bts] || 0) + 1;
    }
  });

  return Object.entries(btsFrequency)
    .map(([bts, count]) => ({
      'BTS ID': bts,
      'Usage Count': count,
      'Percentage': ((count / cdrData.length) * 100).toFixed(2) + '%'
    }))
    .sort((a, b) => b['Usage Count'] - a['Usage Count'])
    .slice(0, 50);
};

/**
 * Query 2: BTS Timeline
 * Filters records by date range and returns timeline by BTS
 */
export const getBTSTimeline = (cdrData, startDate, endDate) => {
  if (!cdrData || cdrData.length === 0) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);

  const results = cdrData
    .filter(record => {
      const dateStr = getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime']);
      const recordDate = new Date(dateStr);
      return recordDate >= start && recordDate <= end;
    })
    .map(record => ({
      'Date-Time': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime']),
      'BTS': getField(record, ['BTS', 'BTS ID', 'Cell ID', 'First Cell ID', 'Last Cell ID']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration': getField(record, ['Call Duration', 'Duration', 'Duration (sec)'])
    }))
    .sort((a, b) => new Date(a['Date-Time']) - new Date(b['Date-Time']));

  return results;
};

/**
 * Query 3: BTS Presence & Coverage
 * Returns dates when a specific BTS was used
 */
export const getBTSPresence = (cdrData, btsId) => {
  if (!cdrData || cdrData.length === 0) return [];

  const records = cdrData
    .filter(record => {
      const bts = getField(record, ['BTS', 'BTS ID', 'Cell ID']);
      return bts === btsId;
    })
    .map((record, idx) => ({
      'Index': idx + 1,
      'Date-Time': getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime']),
      'B Party': getField(record, ['B Party', 'B Party Number', 'bParty']),
      'Duration': getField(record, ['Call Duration', 'Duration', 'Duration (sec)']),
      'BTS': btsId
    }));

  return records.slice(0, 100);
};

/**
 * Query 4: BTS Contacts & Activity
 * Count unique B Party contacts at a specific BTS
 */
export const getBTSContacts = (cdrData, btsId) => {
  if (!cdrData || cdrData.length === 0) return [];

  const contacts = {};

  cdrData
    .filter(record => {
      const bts = getField(record, ['BTS', 'BTS ID', 'Cell ID']);
      return bts === btsId;
    })
    .forEach(record => {
      const bParty = getField(record, ['B Party', 'B Party Number', 'bParty']);
      if (bParty && bParty !== 'NA') {
        contacts[bParty] = (contacts[bParty] || 0) + 1;
      }
    });

  return Object.entries(contacts)
    .map(([contact, count]) => ({
      'B Party': contact,
      'Call Count': count,
      'BTS': btsId
    }))
    .sort((a, b) => b['Call Count'] - a['Call Count'])
    .slice(0, 50);
};

export default {
  getMostActiveBTS,
  getBTSTimeline,
  getBTSPresence,
  getBTSContacts
};
