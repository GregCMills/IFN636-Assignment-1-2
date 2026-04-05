/**
 * Generates a short random alphanumeric ID (9 characters).
 * Intended for client-side temporary IDs only — not a substitute for
 * database-generated ObjectIDs in persistence contexts.
 *
 * @returns {string} A random 9-character base-36 string.
 */
export const generateId = (): string => Math.random().toString(36).substr(2, 9);

/**
 * Groups an array of items into a Record keyed by the result of `keyFn`.
 * Items that share the same key are collected into the same array.
 *
 * @template T
 * @param {T[]}                   array - Source array to partition.
 * @param {(item: T) => string}   keyFn - Function that returns the grouping key for each item.
 * @returns {Record<string, T[]>} Object mapping each key to its matching items.
 *
 * @example
 * groupBy(assets, a => a.typeId)
 * // { 'type-abc': [asset1, asset2], 'type-xyz': [asset3] }
 */
export const groupBy = <T>(
  array: T[],
  keyFn: (item: T) => string
): Record<string, T[]> =>
  array.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

/**
 * Converts an ISO date string (YYYY-MM-DD) to Australian display format (DD-MM-YYYY).
 * Returns an empty string for falsy input and the original string if it is not
 * a valid three-part ISO date.
 *
 * @param {string | undefined} dateString - ISO date string, e.g. "2025-04-30".
 * @returns {string} Reformatted date, e.g. "30-04-2025".
 */
export const formatAusDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length !== 3) return dateString;
  const [year, month, day] = parts;
  return `${day}-${month}-${year}`;
};
