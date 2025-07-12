/**
 * Formats a given date to a short date string which is used e.g. in datetime element attributes.
 *
 * @param date - The date to format. Defaults to the current date.
 *
 * @example
 * ```ts
 * shortDate(new Date(2025, 6, 12)) // => '2025-07-12'
 * ```
 */
export function shortDate(date = new Date()): string | undefined {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split('T')[0];
}
