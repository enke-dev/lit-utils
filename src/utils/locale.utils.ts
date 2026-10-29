/**
 * Text per plural category; missing categories fall back to `other`.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & { other: string };

// cached per locale, constructing rules is costly
const pluralRules = new Map<string, Intl.PluralRules>();

/**
 * Picks the form fitting a count by the plural rules of a locale.
 *
 * @param count The count; none picks `other`.
 * @param forms The text per plural category.
 * @param locale Defaults to the document's `lang`, then the runtime's locale.
 * @returns The fitting form.
 *
 * @example
 * ```ts
 * plural(count, { one: msg('device'), other: msg('devices') })
 * ```
 */
export function plural(count: number | undefined, forms: PluralForms, locale?: string): string {
  if (count === undefined) {
    return forms.other;
  }
  // an empty `lang` makes the rules throw
  const lang = locale || globalThis.document?.documentElement.lang || undefined;
  const key = lang ?? '';
  let rules = pluralRules.get(key);
  if (rules === undefined) {
    rules = new Intl.PluralRules(lang);
    pluralRules.set(key, rules);
  }
  return forms[rules.select(count)] ?? forms.other;
}
