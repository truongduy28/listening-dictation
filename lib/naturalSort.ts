// Natural alphanumeric sorting (e.g. "Track 2" < "Track 10")

/**
 * Compares two strings using natural numeric collation.
 * Handles uppercase/lowercase, leading zeros, Unicode/Vietnamese, and is stable.
 */
export function naturalCompare(a: string, b: string): number {
  if (a === b) return 0;
  if (!a) return -1;
  if (!b) return 1;

  return a.localeCompare(b, undefined, {
    numeric: true,
    sensitivity: "base",
  });
}

/**
 * Sorts an array of items by a string property using natural collation.
 */
export function naturalSort<T>(items: T[], keyExtractor: (item: T) => string): T[] {
  return [...items].sort((a, b) => naturalCompare(keyExtractor(a), keyExtractor(b)));
}
