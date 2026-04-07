import { getField } from '../cdrFilter/utils';
import { parseDateTimeValue } from './reportUtils';

export const buildRowKey = (row) => {
  const bParty = getField(row, ['B Party', 'B Party Number', 'B_Party', 'bParty', 'bparty', 'b']);
  const dateTime = getField(row, ['dateTime', 'Date-Time', 'DateTime', 'Call Date', 'Call DateTime', 'Date'], '');
  const parsedDate = parseDateTimeValue(dateTime);
  const normalizedDate = parsedDate ? parsedDate.toISOString() : String(dateTime ?? '').trim();

  return `${String(bParty ?? '').trim()}||${normalizedDate}`;
};
