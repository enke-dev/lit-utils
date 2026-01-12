import type { ElementPart } from 'lit';
import { nothing } from 'lit';
import type { DirectiveResult } from 'lit/async-directive.js';
import { AsyncDirective, directive } from 'lit/async-directive.js';

/**
 * @private
 */
export class SlotFilledDirective extends AsyncDirective {
  #element: Element | undefined;
  #attr: string | undefined;
  #slotName: string | undefined;

  #isListening = false;
  #listener = (event: Event) => {
    // check that the event target is a slot in the first place
    const slot = event.target as HTMLSlotElement | null;
    if (slot === null || !(slot instanceof HTMLSlotElement)) {
      return;
    }
    // check for default slots
    if (this.#slotName === '' && slot.hasAttribute('name')) {
      return;
    }
    // check for named slots
    if (this.#slotName !== undefined && slot.name !== this.#slotName) {
      return;
    }

    const elements = slot?.assignedElements({ flatten: true });
    const attr = this.#attr ?? 'data-has-elements';
    this.#element?.toggleAttribute(attr, elements?.length > 0);
  };

  #startListening() {
    if (this.isConnected && !this.#isListening) {
      this.#isListening = true;
      this.#element?.addEventListener('slotchange', this.#listener, true);
    }
  }

  #stopListening() {
    this.#isListening = false;
    this.#element?.removeEventListener('slotchange', this.#listener, true);
  }

  /**
   * @param _attr - The attribute to set on the host element when the slot has elements assigned.
   * @param _slotName - The name of the slot to check. If not provided, all slots will be checked.
   */
  override render(_attr?: string, _slotName?: string) {
    return nothing;
  }

  override update(part: ElementPart, [attr, slotName]: Parameters<this['render']>) {
    this.#attr = attr;
    this.#slotName = slotName;
    this.#element = part.element;
    this.#stopListening();
    this.#startListening();

    return nothing;
  }

  override disconnected() {
    this.#stopListening();
  }

  override reconnected() {
    this.#startListening();
  }
}

/**
 * Checks if a nested slot has elements assigned to it.
 * If so, it sets the specified attribute on the host element, or removes it if not.
 *
 * This allows e.g. for conditional styling based on the given attribute: footer[data-has-elements] { ... }.
 * Note that the `:empty` pseudo-class is not meant to target slots, as these have not direct children, but rather their assigned elements.
 *
 * Under the hood, all (bubbled) `slotchange` events are listened to, and the amount of assigned elements is checked. So if multiple slots are present,
 * all of them are taken into account.
 *
 * To limit the check to a specific (named) slot, provide an optional slot name.
 * To limit the check to the (unnamed) default slot instead, provide an empty string as slot name.
 *
 * @returns A directive that can be used in a template.
 *
 * @example
 * Sets the `data-has-elements` attribute on the `main` element if any of the slots have elements assigned to it.
 *
 * ```html
 * <main ${slotFilled('data-has-elements')}>
 *   <slot></slot>
 *   <slot name="footer"></slot>
 * </main>
 * ```
 *
 * @example
 * Sets the `data-has-elements` attribute on the `main` element if the default (unnamed) slot has elements assigned to it.
 *
 * ```html
 * <main ${slotFilled('data-has-elements', '')}>
 *   <slot></slot>
 *   <slot name="footer"></slot>
 * </main>
 * ```
 *
 * @example
 * Sets the `data-has-social-links` attribute on the `footer` element if the `social` slot has elements assigned to it.
 *
 * ```html
 * <footer ${slotFilled('data-has-social-links', 'social')}>
 *   <slot name="meta"></slot>
 *   <slot name="social"></slot>
 * </footer>
 * ```
 */
export const slotFilled = directive(SlotFilledDirective) as (
  /**
   * The attribute to set on the host element when the slot has elements assigned.
   * @default 'data-has-elements'
   */
  attr?: string,

  /**
   * The name of the slot to check. If not provided, all slots will be observed.
   * To check for the default (unnamed) slot, provide an empty string.
   */
  slotName?: string
) => DirectiveResult<typeof SlotFilledDirective>;
