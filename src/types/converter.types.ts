import type { ComplexAttributeConverter } from 'lit';

/**
 * A helper type to be used to create a converter factory.
 * This is used internally to create converters that can be used with the `@property` decorator.
 * It allows you to define a converter that takes parameters and returns a `ComplexAttributeConverter`.
 *
 * For examples, have a look at the `src/converters` directory.
 */
export type ConverterFactory<T, P extends unknown[]> = (
  ...params: P
) => Required<ComplexAttributeConverter<T>>;
