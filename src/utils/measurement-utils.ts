/**
 * Converts inches to centimeters
*/
export const inchesToCentimeters = (inches: number) => Math.round(inches * 2.54);

/**
 * Converts inches to a feet-inch string (like `6' 4"`)
*/
export const inchesToFeetInchString = (inches: number) => `${Math.floor(inches / 12)}' ${inches % 12}"`;

/**
 * Converts centimeters to inches
*/
export const centimetersToInches = (centimeters: number) => Math.round(centimeters / 2.54);
