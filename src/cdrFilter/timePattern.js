import { getField } from './utils';

/**
 * Time Pattern Analysis
 * Logic for analyzing time-based patterns in CDR/IPDR data
 */

/**
 * Analyzes call patterns by time of day
 * Groups into slots: 00-06, 06-12, 12-18, 18-24
 * @param {Array} cdrData - Array of CDR records
 * @returns {Array} - Pattern data grouped by time slot
 */
export const analyzeTimePattern = (cdrData, options = {}) => {
  if (!cdrData || cdrData.length === 0) return [];

  const startHour = parseInt(options.startHour) || 0;
  const endHour = parseInt(options.endHour) || 23;

  // Define time slots
  const slots = [
    { name: '00-06 (Night)', start: 0, end: 6 },
    { name: '06-12 (Morning)', start: 6, end: 12 },
    { name: '12-18 (Afternoon)', start: 12, end: 18 },
    { name: '18-24 (Evening)', start: 18, end: 24 }
  ];

  // Initialize counters
  const slotCounts = {};
  slots.forEach(slot => {
    slotCounts[slot.name] = 0;
  });

  // Count calls per slot
  cdrData.forEach(record => {
    const dateStr = getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']);
    
    try {
      const date = new Date(dateStr);
      const hour = date.getHours();

      // Check if hour is in the filter range
      if (hour >= startHour && hour <= endHour) {
        // Find matching slot
        const slot = slots.find(s => hour >= s.start && hour < s.end);
        if (slot) {
          slotCounts[slot.name] += 1;
        }
      }
    } catch {
      // Skip records with invalid dates
    }
  });

  // Convert to result format
  const results = slots.map(slot => ({
    'Time Slot': slot.name,
    'Call Count': slotCounts[slot.name],
    'Percentage': cdrData.length > 0 
      ? ((slotCounts[slot.name] / cdrData.length) * 100).toFixed(2) + '%'
      : '0%'
  }));

  return results;
};

/**
 * Analyzes call patterns by day of week
 * @param {Array} cdrData - Array of CDR records
 * @returns {Array} - Pattern data grouped by day of week
 */
export const analyzeDayOfWeekPattern = (cdrData) => {
  if (!cdrData || cdrData.length === 0) return [];

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayCounts = {};

  days.forEach(day => {
    dayCounts[day] = 0;
  });

  cdrData.forEach(record => {
    const dateStr = getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']);
    
    try {
      const date = new Date(dateStr);
      const dayName = days[date.getDay()];
      dayCounts[dayName] += 1;
    } catch {
      // Ignore invalid dates
    }
  });

  return days.map(day => ({
    'Day': day,
    'Call Count': dayCounts[day],
    'Percentage': cdrData.length > 0 
      ? ((dayCounts[day] / cdrData.length) * 100).toFixed(2) + '%'
      : '0%'
  }));
};

/**
 * Analyzes call patterns by date range
 * @param {Array} cdrData - Array of CDR records
 * @param {Date} startDate - Start date for analysis
 * @param {Date} endDate - End date for analysis
 * @returns {Array} - Pattern data for date range
 */
export const analyzeDateRangePattern = (cdrData, startDate, endDate) => {
  if (!cdrData || cdrData.length === 0) return [];

  const start = new Date(startDate);
  const end = new Date(endDate);
  const dateCounts = {};

  cdrData.forEach(record => {
    const dateStr = getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']);
    
    try {
      const recordDate = new Date(dateStr);
      
      if (recordDate >= start && recordDate <= end) {
        const dateKey = recordDate.toISOString().split('T')[0];
        dateCounts[dateKey] = (dateCounts[dateKey] || 0) + 1;
      }
    } catch {
      // Ignore invalid dates
    }
  });

  return Object.entries(dateCounts)
    .map(([date, count]) => ({
      'Date': date,
      'Call Count': count
    }))
    .sort((a, b) => new Date(a.Date) - new Date(b.Date));
};

/**
 * Gets peak activity times (busiest hours)
 * @param {Array} cdrData - Array of CDR records
 * @returns {Array} - Peak activity times with frequency
 */
export const getPeakActivityTimes = (cdrData) => {
  if (!cdrData || cdrData.length === 0) return [];

  const hourCounts = {};

  for (let i = 0; i < 24; i++) {
    hourCounts[i] = 0;
  }

  cdrData.forEach(record => {
    const dateStr = getField(record, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call Time']);
    
    try {
      const date = new Date(dateStr);
      const hour = date.getHours();
      hourCounts[hour] += 1;
    } catch {
      // Ignore invalid dates
    }
  });

  const results = Object.entries(hourCounts)
    .map(([hour, count]) => ({
      'Hour': parseInt(hour) + ':00 - ' + (parseInt(hour) + 1) + ':00',
      'Call Count': count,
      'Percentage': cdrData.length > 0 
        ? ((count / cdrData.length) * 100).toFixed(2) + '%'
        : '0%'
    }))
    .sort((a, b) => b['Call Count'] - a['Call Count']);

  return results;
};

export default {
  analyzeTimePattern,
  analyzeDayOfWeekPattern,
  analyzeDateRangePattern,
  getPeakActivityTimes
};
