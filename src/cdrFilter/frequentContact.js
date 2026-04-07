import { getField } from './utils';

/**
 * Frequent Contact Analysis
 * Analyzes B Party frequency to identify frequently contacted numbers
 */

/**
 * Analyzes frequent contacts from CDR data
 * @param {Array} cdrData - Array of CDR records
 * @param {Object} options - Query options (threshold, limit, etc.)
 * @returns {Array} - Sorted array of frequent contacts with count
 */
export const analyzeFrequentContact = (cdrData, options = {}) => {
  if (!cdrData || cdrData.length === 0) {
    return [];
  }

  const threshold = options.threshold || 0;
  const limit = options.limit || 100;

  // Count frequency of each B Party
  const contactFrequency = {};

  cdrData.forEach(record => {
    const bParty = getField(record, ['B Party Number', 'B Party', 'BParty', 'bParty', 'b_party']);
    if (bParty && bParty !== 'NA') {
      contactFrequency[bParty] = (contactFrequency[bParty] || 0) + 1;
    }
  });

  // Convert to array and sort by frequency (descending)
  const results = Object.entries(contactFrequency)
    .map(([bParty, count]) => ({
      'B Party': bParty,
      'Frequency': count,
      'Percentage': ((count / cdrData.length) * 100).toFixed(2) + '%'
    }))
    .filter(item => item.Frequency >= threshold)
    .sort((a, b) => b.Frequency - a.Frequency)
    .slice(0, limit);

  return results;
};

/**
 * Filters contacts by frequency threshold
 * @param {Array} contacts - Array of contact objects
 * @param {Number} threshold - Minimum frequency threshold
 * @returns {Array} - Filtered contacts meeting threshold
 */
export const filterContactsByThreshold = (contacts, threshold) => {
  if (!contacts) return [];
  
  return contacts.filter(contact => contact.Frequency >= threshold);
};

export default {
  analyzeFrequentContact,
  filterContactsByThreshold
};
