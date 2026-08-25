import type { ConverterFactory } from '../types/converter.types.js';

/**
 * The `TupleListConverter` allows you to define lists of primitive tuple values, as attributes.
 * This is useful for attributes that expect a list of tuple values, like multiple coordinates or dimensions.
 *
 * @param listSeparator - The string used to separate the list items in the attribute value. Defaults to a comma (`,`).
 * @param tupleSeparator - The string used to separate the tuple items in the attribute value. Defaults to a space (` `).
 * @param types - The type of the tuple items as primitive constructors. Defaults to `[Number,Number]`.
 *
 * @example
 * ```typescript
 * @customElement('my-component')
 * class MyComponent extends LitElement {
 *   @property({
 *     type: Array,
 *     reflect: true,
 *     attribute: 'dimensions',
 *     converter: TupleListConverter(',', 'x', [Number, Number]),
 *   })
 *   dimensions = [[1920, 1080], [1280, 720]];
 * }
 * ```
 * ```html
 * <my-component dimensions="1920x1080,1280x720"></my-component>
 * ```
 */
export const TupleListConverter: ConverterFactory<
  (string | number | undefined)[][],
  [string?, string?, ((value: string) => string | number)[]?]
> = (
  listSeparator = ',',
  tupleSeparator = ' ',
  types: ((value: string) => string | number)[] = [Number, Number]
) => ({
  fromAttribute: value => {
    if (['', null].includes(value)) {
      return [];
    }
    return (
      value
        ?.split(listSeparator)
        .map(v => v.split(tupleSeparator).map((item, index) => types[index]?.(item))) ?? []
    );
  },
  toAttribute: (value): string | null => {
    if (!value?.length) {
      return null;
    }
    return value.map(v => v.join(tupleSeparator)).join(listSeparator);
  },
});
