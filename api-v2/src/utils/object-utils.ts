/**
 * For the given object obj, return a new object with only the specified properties.
 * @param obj An object
 * @param properties An array of string property names to extract from the object
 * @returns A new object that only contains the specified properties (with values of undefined for
 *          any properties that do not exist onthe given object)
 */
export const pick = (obj: object, properties: string[]) => {
  const newObj = {};
  properties.forEach((property) => (newObj[property] = obj[property]));
  return newObj;
};
