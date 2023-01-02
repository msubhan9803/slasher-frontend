import { DateTime } from 'luxon';
/**
 * Given a Date, return a new UTC Date with the same YYYY-MM-DD, but with time set to 00:00:00.000.
 * This method maintains the original YYYY-MM-DD, even though the time zone is changing.
 * @param date
 */
export const toUtcStartOfDay = (date: Date) => DateTime.now().setZone('utc').set({
  year: date.getFullYear(),
  month: date.getMonth() + 1, // js dates are 0-indexed
  day: date.getUTCDate(),
  hour: 0,
  minute: 0,
  second: 0,
  millisecond: 0,
}).toJSDate();

/**
 * Given a Date, return a new UTC Date with the same YYYY-MM-DD, but with time set to 23:59:59.000.
 * This method maintains the original YYYY-MM-DD, even though the time zone is changing.
 * @param date
 */
export const toUtcEndOfDay = (date: Date) => DateTime.now().setZone('utc').set({
  year: date.getFullYear(),
  month: date.getMonth() + 1, // js dates are 0-indexed
  day: date.getUTCDate(),
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 0,
}).toJSDate();

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
