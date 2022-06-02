import { Info } from 'luxon';
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
export const generateDayOptions = (startRange: number, endRange: number) => {
  const dayList = generateRange(startRange, endRange);
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
