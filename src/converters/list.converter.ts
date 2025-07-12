import type { ConverterFactory } from '../types/converter.types.js';

/**
 * The `ListConverter` allows you to define lists of primitive values, such as strings or numbers, as attributes.
 * This is useful for attributes that expect a list of values, like the official `class` attribute, `rel`, `srcset`, or `accept`.
 *
 * @param separator - The string used to separate the list items in the attribute value. Defaults to a comma (`,`).
 * @param type - The type of the items as primitive string or number constructor. Defaults to `String`,
 *
 * @example
 * ```typescript
 * class MyComponent extends LitElement {
 *   @property({
 *     type: Array,
 *     reflect: true,
 *     attribute: 'units',
 *     converter: ListConverter(' ', String),
 *   })
 *   units = ['px', 'em', 'rem'];
 * }
 * ```
 */
export const ListConverter: ConverterFactory<
  ReturnType<StringConstructor | NumberConstructor>[],
  [string?, (StringConstructor | NumberConstructor)?]
> = (separator = ',', type: StringConstructor | NumberConstructor = String) => ({
  fromAttribute: value => {
    if (['', null].includes(value)) return [];
    return value?.split(separator).map(v => type(v)) || [];
  },
  toAttribute: (value): string | null => {
    if (!value.length) return null;
    return value.map(v => `${v}`).join(separator);
  },
});
