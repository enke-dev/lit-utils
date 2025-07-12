import type { ConverterFactory } from '../types/converter.types.js';
import { shortDate } from '../utils/date.utils.js';

/**
 * Converts a boolean property to a stringified representation.
 * For example setting boolean WAI-ARIA attributes, which are usually set to `true` or `false` as string, can not be used as boolean attributes directly in Lit.
 * To handle this, you can use the `StringifiedBooleanConverter` provided by this package, which allows you to map a boolean value to its string representation.
 *
 * @link https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-expanded#values
 *
 * @param trueValue - The string representation for `true` (default: 'true').
 * @param falseValue - The string representation for `false` (default: 'false').
 *
 * @example
 * ```typescript
 * class MyDropdown extends LitElement {
 *   @property({
 *     type: Boolean,
 *     reflect: true,
 *     attribute: 'aria-expanded',
 *     converter: StringifiedBooleanConverter('true', 'false'),
 *   })
 *   active = false;
 * }
 * ```
 */
export const StringifiedBooleanConverter: ConverterFactory<boolean, [string?, string?]> = (
  trueValue = 'true',
  falseValue = 'false',
) => ({
  fromAttribute: value => {
    return value === trueValue;
  },
  toAttribute: (value): string | null => {
    return value ? trueValue : falseValue;
  },
});

/**
 * Converts an iso date attribute to a `Date` object.
 * The `short` parameter can be used to convert the date to a short iso date string (cp. `datetime` attribute).
 */
export const DateIsoConverter: ConverterFactory<Date | undefined, [boolean]> = (short = true) => ({
  fromAttribute: value => {
    return value ? new Date(value) : undefined;
  },
  toAttribute: value => {
    if (value && short) return shortDate(value);
    return value?.toISOString();
  },
});
