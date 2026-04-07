import { parseDateTimeValue, parseDurationToSeconds } from '../utils/reportUtils';

const normalizeLookup = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const hasUsableValue = (value) =>
  value !== undefined && value !== null && value !== '' && value !== 'NA';

const resolveNormalizedField = (row, keys) => {
  const normalizedKeys = keys.map((key) => normalizeLookup(key));

  if (
    normalizedKeys.some(
      (key) => key.includes('datetime') || key === 'date' || key === 'calltime' || key === 'calldate'
    ) &&
    hasUsableValue(row._normalizedDateTime)
  ) {
    return row._normalizedDateTime;
  }

  if (normalizedKeys.some((key) => key.includes('duration')) && hasUsableValue(row._durationSeconds)) {
    return row._durationSeconds;
  }

  if (normalizedKeys.some((key) => key.includes('bparty')) && hasUsableValue(row._normalizedBParty)) {
    return row._normalizedBParty;
  }

  if (
    normalizedKeys.some(
      (key) => key.includes('calltype') || key.includes('typeofconnection') || key.includes('connectiontype')
    ) &&
    hasUsableValue(row._normalizedCallType)
  ) {
    return row._normalizedCallType;
  }

  if (
    normalizedKeys.some(
      (key) =>
        key === 'bts' ||
        key.includes('btsid') ||
        key.includes('cellid') ||
        key.includes('firstbts') ||
        key.includes('lastbts')
    ) &&
    hasUsableValue(row._normalizedBTS)
  ) {
    return row._normalizedBTS;
  }

  if (normalizedKeys.some((key) => key.includes('imei')) && hasUsableValue(row._normalizedIMEI)) {
    return row._normalizedIMEI;
  }

  if (normalizedKeys.some((key) => key.includes('imsi')) && hasUsableValue(row._normalizedIMSI)) {
    return row._normalizedIMSI;
  }

  return undefined;
};

export const getField = (row, keys, defaultValue = 'NA') => {
  if (!row || !keys || keys.length === 0) {
    return defaultValue;
  }

  const normalizedValue = resolveNormalizedField(row, keys);
  if (normalizedValue !== undefined) {
    return typeof normalizedValue === 'string' ? normalizedValue.trim() : normalizedValue;
  }

  for (const key of keys) {
    if (hasUsableValue(row[key])) {
      return typeof row[key] === 'string' ? row[key].trim() : row[key];
    }
  }

  return defaultValue;
};

export const getNumericField = (row, keys, defaultValue = 0) => {
  if (!row || !keys || keys.length === 0) {
    return defaultValue;
  }

  const normalizedValue = resolveNormalizedField(row, keys);
  if (typeof normalizedValue === 'number' && Number.isFinite(normalizedValue)) {
    return normalizedValue;
  }

  const value = getField(row, keys, null);
  const parsedDuration = parseDurationToSeconds(value);

  if (parsedDuration !== null) {
    return parsedDuration;
  }

  const parsedNumber = parseFloat(String(value ?? '').replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsedNumber) ? defaultValue : parsedNumber;
};

export const normalizeDateTime = (row) => {
  const dateString = getField(row, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime', 'Date']);
  const parsedDate = parseDateTimeValue(dateString);
  return parsedDate ? parsedDate.toISOString() : 'NA';
};
