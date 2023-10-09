import { DateTime, Info } from 'luxon';
import { generateRange } from './array-utils';

interface MonthObject {
  value: number,
  label: string
}

/**
 * Generates a month list
*/
export const generateMonthOptions = (): MonthObject[] => {
  const monthNumbers = Info.months('numeric').map((monthNumber: string) => parseInt(monthNumber, 10));
  const monthNames = Info.months('long'); // Using luxon for eventual month name locale awareness
  return monthNumbers.map(
    (monthNumber) => ({ value: monthNumber, label: monthNames[monthNumber - 1] }),
  );
};

/**
 * Generates a day list
*/
export const generateDayOptions = (
  startRange: number,
  endRange: number,
  year: number = DateTime.now().year,
  month: number = DateTime.now().month,
) => {
  let totalDays = endRange;
  if (year || month) {
    const dateTime = DateTime.local(year, month);

    if (month === 2 && dateTime.isInLeapYear) {
      totalDays = 29;
    } else {
      totalDays = dateTime.daysInMonth;
    }
  }
  const dayList = generateRange(startRange, totalDays);
  return dayList;
};

/**
 * Generates a 18 years above list
*/
export const generate18OrOlderYearList = () => {
  const currentYear = new Date().getFullYear();
  const endYear = currentYear - 18;
  const startYear = currentYear - 100;
  return generateRange(endYear, startYear);
};

/**
 * Given a Date, return a new UTC Date with the same YYYY-MM-DD, but with time set to 00:00:00.000.
 * This method maintains the original YYYY-MM-DD, even though the time zone is changing.
 * @param date
 */
export const toUtcStartOfDay = (date: Date) => DateTime.now().setZone('utc').set({
  year: date.getFullYear(),
  month: date.getMonth() + 1, // js dates are 0-indexed
  day: date.getDate(),
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
  day: date.getDate(),
  hour: 23,
  minute: 59,
  second: 59,
  millisecond: 0,
}).toJSDate();

export const getYearFromString = (dateString: string): number | null => {
  // eslint-disable-next-line prefer-regex-literals
  const yearPattern = new RegExp('\\d{4}');
  const match = dateString.match(yearPattern);
  if (match) {
    return Number(match[0]);
  }
  return null;
};
