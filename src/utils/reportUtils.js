const HIDDEN_KEYS = new Set([
  'aParty',
  'targetNumber',
  'Duration (min)',
  'durationSeconds',
]);

const COLUMN_LABELS = {
  DateTime: 'Date-Time',
  dateTime: 'Date-Time',
  'Duration (sec)': 'Duration',
  'Call Duration': 'Duration',
  callDuration: 'Duration',
  'Total Duration (seconds)': 'Total Duration',
  'Average Duration (seconds)': 'Average Duration',
  'Avg Duration (sec)': 'Avg Duration',
  'Max Duration (sec)': 'Max Duration',
  'Min Duration (sec)': 'Min Duration',
  'Total Duration (sec)': 'Total Duration',
  'Max Duration (min)': 'Max Duration',
  'Average Duration (min)': 'Average Duration',
};

const DATE_HINTS = ['date', 'time', 'firstcall', 'lastcall'];
const DURATION_HINTS = ['duration'];
const EXCEL_EPOCH_OFFSET = 25569;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

const normalizeLookup = (value) =>
  String(value ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');

const isBlank = (value) =>
  value === undefined ||
  value === null ||
  (typeof value === 'string' && value.trim() === '');

const normalizeYear = (year) => {
  const parsedYear = Number(year);

  if (String(year).length === 2) {
    return parsedYear >= 70 ? 1900 + parsedYear : 2000 + parsedYear;
  }

  return parsedYear;
};

const buildDate = (year, month, day, hours = 0, minutes = 0, seconds = 0) => {
  const date = new Date(year, month - 1, day, hours, minutes, seconds);

  return Number.isNaN(date.getTime()) ? null : date;
};

const parseTimeParts = (value) => {
  if (isBlank(value) || value === 'NA') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const totalSeconds = Math.round((value % 1) * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return { hours, minutes, seconds };
  }

  const trimmed = String(value).trim();
  const meridianMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);

  if (meridianMatch) {
    let hours = Number(meridianMatch[1]);
    const minutes = Number(meridianMatch[2]);
    const seconds = Number(meridianMatch[3] ?? 0);
    const meridian = meridianMatch[4].toUpperCase();

    if (meridian === 'PM' && hours < 12) {
      hours += 12;
    }

    if (meridian === 'AM' && hours === 12) {
      hours = 0;
    }

    return { hours, minutes, seconds };
  }

  const timeMatch = trimmed.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);

  if (timeMatch) {
    return {
      hours: Number(timeMatch[1]),
      minutes: Number(timeMatch[2]),
      seconds: Number(timeMatch[3] ?? 0),
    };
  }

  return null;
};

export const parseDurationToSeconds = (value) => {
  if (isBlank(value) || value === 'NA') {
    return null;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.round(value));
  }

  const trimmed = String(value).trim();
  const clockParts = trimmed.split(':');

  if (clockParts.length === 2 || clockParts.length === 3) {
    const numbers = clockParts.map((part) => Number(part));

    if (numbers.every((part) => Number.isFinite(part))) {
      if (numbers.length === 2) {
        const [minutes, seconds] = numbers;
        return Math.max(0, minutes * 60 + seconds);
      }

      const [hours, minutes, seconds] = numbers;
      return Math.max(0, hours * 3600 + minutes * 60 + seconds);
    }
  }

  const numericValue = Number(trimmed.replace(/[^0-9.-]/g, ''));
  return Number.isFinite(numericValue) ? Math.max(0, Math.round(numericValue)) : null;
};

export const formatDurationValue = (value) => {
  const totalSeconds = parseDurationToSeconds(value);

  if (totalSeconds === null) {
    return 'NA';
  }

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export const parseDateTimeValue = (value, timeValue) => {
  if (isBlank(value) || value === 'NA') {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    const timeFraction =
      typeof timeValue === 'number' && Number.isFinite(timeValue) ? timeValue % 1 : 0;
    const serialValue = value + timeFraction;
    const timestamp = (serialValue - EXCEL_EPOCH_OFFSET) * MS_PER_DAY;
    const parsedDate = new Date(timestamp);
    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
  }

  const trimmed = String(value).trim();

  if (!trimmed || trimmed.toUpperCase() === 'NA') {
    return null;
  }

  const numericCandidate = Number(trimmed);
  if (Number.isFinite(numericCandidate) && trimmed === String(numericCandidate)) {
    return parseDateTimeValue(numericCandidate, timeValue);
  }

  const yearFirstMatch = trimmed.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (yearFirstMatch) {
    const [, year, month, day, hours = '0', minutes = '0', seconds = '0'] = yearFirstMatch;
    const date = buildDate(
      Number(year),
      Number(month),
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );

    if (date) {
      return date;
    }
  }

  const dayFirstMatch = trimmed.match(
    /^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2}))?)?$/
  );

  if (dayFirstMatch) {
    const [, day, month, year, hours = '0', minutes = '0', seconds = '0'] = dayFirstMatch;
    const date = buildDate(
      normalizeYear(year),
      Number(month),
      Number(day),
      Number(hours),
      Number(minutes),
      Number(seconds)
    );

    if (date) {
      return date;
    }
  }

  const parsedByDate = new Date(trimmed);

  if (!Number.isNaN(parsedByDate.getTime())) {
    return parsedByDate;
  }

  const timeParts = parseTimeParts(timeValue);

  if (timeParts) {
    const dateOnlyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{2,4})$/);

    if (dateOnlyMatch) {
      const [, day, month, year] = dateOnlyMatch;
      return buildDate(
        normalizeYear(year),
        Number(month),
        Number(day),
        timeParts.hours,
        timeParts.minutes,
        timeParts.seconds
      );
    }

    const isoDateOnlyMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);

    if (isoDateOnlyMatch) {
      const [, year, month, day] = isoDateOnlyMatch;
      return buildDate(
        Number(year),
        Number(month),
        Number(day),
        timeParts.hours,
        timeParts.minutes,
        timeParts.seconds
      );
    }
  }

  return null;
};

export const formatDateTimeValue = (value, timeValue) => {
  const parsedDate = parseDateTimeValue(value, timeValue);

  if (!parsedDate) {
    return 'NA';
  }

  const day = String(parsedDate.getDate()).padStart(2, '0');
  const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
  const year = parsedDate.getFullYear();
  const hours = String(parsedDate.getHours()).padStart(2, '0');
  const minutes = String(parsedDate.getMinutes()).padStart(2, '0');
  const seconds = String(parsedDate.getSeconds()).padStart(2, '0');

  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

const isDateColumn = (key) => {
  const normalizedKey = normalizeLookup(key);
  return DATE_HINTS.some((hint) => normalizedKey.includes(hint));
};

const isDurationColumn = (key) => {
  const normalizedKey = normalizeLookup(key);
  return DURATION_HINTS.some((hint) => normalizedKey.includes(hint));
};

const shouldHideColumn = (key) => {
  if (!key) {
    return true;
  }

  const normalizedKey = normalizeLookup(key);

  if (String(key).startsWith('_')) {
    return true;
  }

  if (HIDDEN_KEYS.has(key)) {
    return true;
  }

  return normalizedKey.includes('aparty') || normalizedKey.includes('targetaparty');
};

const getOutputKey = (key) => COLUMN_LABELS[key] ?? key;

const formatCellValue = (key, value, row = {}) => {
  if (isBlank(value) || value === 'NA') {
    return 'NA';
  }

  if (isDateColumn(key)) {
    const formattedDate = formatDateTimeValue(value);
    return formattedDate === 'NA' ? String(value).trim() : formattedDate;
  }

  if (isDurationColumn(key)) {
    const formattedDuration = formatDurationValue(value);
    return formattedDuration === 'NA' ? 'NA' : formattedDuration;
  }

  const metricKey = row.Metric ?? row.Statistic ?? '';
  if (key === 'Value' && /duration/i.test(String(metricKey))) {
    const formattedDuration = formatDurationValue(value);
    return formattedDuration === 'NA' ? value : formattedDuration;
  }

  if (typeof value === 'string') {
    return value.trim() || 'NA';
  }

  return value;
};

export const sanitizeRowForOutput = (row = {}) => {
  const sanitizedRow = {};

  Object.entries(row).forEach(([key, value]) => {
    if (shouldHideColumn(key)) {
      return;
    }

    sanitizedRow[getOutputKey(key)] = formatCellValue(key, value, row);
  });

  return sanitizedRow;
};

export const sanitizeRowsForOutput = (rows = []) => rows.map((row) => sanitizeRowForOutput(row));
