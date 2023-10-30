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

// eslint-disable-next-line prefer-regex-literals
const YEAR_REGEX = new RegExp('\\d\\d\\d\\d');
const getYear = (dirtyDateString?: string) => {
  const match = dirtyDateString?.match(YEAR_REGEX);
  const year = match?.[0];
  return Number(year) ?? null;
};

// 0 means January, 1 means 1st day of month
const createDateFromYear = (year: number) => new Date(year, 0, 1);

// As per discussion with Damon, we are only storing YEAR, and avoiding to store `date` and `month` values
// completely because of irregular date formats from OpenLibraray API.
export const createPublishDateForOpenLibrary = (publish_date: string): Date | null => {
  const year = getYear(publish_date);
  return year ? createDateFromYear(year) : null;
};
