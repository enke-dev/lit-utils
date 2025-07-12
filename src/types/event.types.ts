/**
 * Allows setting the `target` property of a generic DOM event to a specific type of HTMLElement.
 * Most of the time the typed `EventTarget` hinders to properly access the targetted element.
 *
 * If the generics are not passed, the defaults are `HTMLElement` and `Event`.
 *
 * @example
 * ```ts
 * button.addEventListener('click', (event: EventWithTarget<HTMLButtonElement>) => {
 *   event.target.disabled = true;
 * });
 * ```
 */
export type EventWithTarget<T extends HTMLElement = HTMLElement, E extends Event = Event> = E & {
  target: T;
};

/**
 * Allows setting the `currentTarget` property of a generic DOM event to a specific type of HTMLElement.
 * This is useful when you want to ensure that the `currentTarget` is of a specific type.
 *
 * If the generics are not passed, the defaults are `HTMLElement` and `Event`.
 *
 * @example
 * ```ts
 * div.addEventListener('click', (event: EventWithCurrentTarget<HTMLButtonElement>) => {
 *   event.currentTarget.disabled = true;
 * });
 * ```
 */
export type EventWithCurrentTarget<
  T extends HTMLElement = HTMLElement,
  E extends Event = Event,
> = E & {
  currentTarget: T;
};

/**
 * Allows setting the `relatedTarget` property of a generic DOM event to a specific type of HTMLElement.
 * This is useful for events like `focus`, `blur`, or `pointerover` where you want to access the related element.
 *
 * If the generics are not passed, the defaults are `HTMLElement` and `Event`.
 *
 * @example
 * ```ts
 * form.addEventListener('focus', (event: EventWithRelatedTarget<HTMLInputElement>) => {
 *   console.log(event.relatedTarget); // Access the related target element
 * });
 * ```
 */
export type EventWithRelatedTarget<
  T extends HTMLElement = HTMLElement,
  E extends Event = Event,
> = E & {
  relatedTarget: T;
};
