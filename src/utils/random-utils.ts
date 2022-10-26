/**
 * Returns a random integer between min and max (inclusive).
 * @param min
 * @param max
 * @returns A random integer.
 */
export function randomIntInclusive(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

export function randomBoolean() {
  return Math.random() < 0.5;
}
