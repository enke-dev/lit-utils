import type { ConverterFactory } from '../types/converter.types.js';
import { shortDate } from '../utils/date.utils.js';

/**
 * Converts an iso date attribute to a `Date` object and vice versa.
 * The `short` parameter can be used to convert the date to a short iso date string (s. `datetime` attribute).
 *
 * @param short - If true, converts to a short iso date string, like `2025-07-12` (default: false).
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   @property({
 *     type: Date,
 *     reflect: true,
 *     attribute: 'my-date',
 *     converter: DateIsoConverter(),
 *   })
 *   myDate = new Date();
 * }
 * ```
 */
export const DateIsoConverter: ConverterFactory<Date | undefined, [boolean?]> = (
  short = false
) => ({
  fromAttribute: value => {
    return value ? new Date(value) : undefined;
  },
  toAttribute: value => {
    if (value && short) {
      return shortDate(value);
    }
    return value?.toISOString();
  },
});
