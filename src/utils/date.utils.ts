/**
 * Formats a given date to a short date string which is used e.g. in datetime element attributes.
 *
 * @param date The date to format. Defaults to the current date.
 * @return A string in the format 'YYYY-MM-DD'.
 *
 * @example
 * ```ts
 * shortDate(new Date(2025, 6, 12)) // '2025-07-12'
 * ```
 */
export function shortDate(date = new Date()): string | undefined {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  if (isNaN(date.getTime())) return undefined;
  return date.toISOString().split('T')[0];
}

/**
 * Calculates the week number for a given date.
 *
 * @param date the date to calculate the week number for
 * @returns the week number
 *
 * @see https://stackoverflow.com/a/6117889/1146207
 * @example
 * ```ts
 * getWeekNumber(new Date('2023-01-01')) // => 52
 * ```
 */
export function getWeekNumber(date: Date): number {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const utcDay = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - utcDay);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  return Math.ceil(((+utcDate - +yearStart) / 86400000 + 1) / 7);
}
