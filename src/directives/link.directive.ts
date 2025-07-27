import type { ElementPart } from 'lit';
import { nothing } from 'lit';
import { AsyncDirective, directive } from 'lit/async-directive.js';

import { goto } from '../utils/router.utils.js';

/**
 * @private
 */
export class LinkDirective extends AsyncDirective {
  #element: Element | undefined;
  #link: string | undefined;
  #role: string | undefined;

  // set the link to the element
  #updateLinkValue(element: Element | undefined) {
    if (this.#link === undefined) return;

    // update the href attribute if the element is an anchor
    if (element instanceof HTMLAnchorElement) {
      element?.setAttribute('href', this.#link);
    }
    // set aria role for buttons (and all others)
    else {
      element?.setAttribute('data-href', this.#link);
      element?.setAttribute('role', this.#role ?? 'link');
    }

    // update the click handler
    element?.addEventListener(
      'click',
      event => {
        event.preventDefault();
        if (this.#link !== undefined) goto(this.#link);
      },
      { capture: true },
    );
  }

  override render(_link?: string, _role?: string) {
    return nothing;
  }

  override update(part: ElementPart, [link, role]: Parameters<this['render']>) {
    const linkChanged = link !== this.#link;
    const roleChanged = role !== this.#role;
    if (linkChanged && this.#link !== undefined) {
      // The link passed to the directive has changed;
      // unset the previous link's value
      this.#updateLinkValue(undefined);
    }
    if (linkChanged || roleChanged || this.#element !== this.#element) {
      // We either got a new link or this is the first render;
      // store the link and element, update the link value
      this.#link = link;
      this.#role = role;
      this.#element = part.element;
      this.#updateLinkValue(this.#element);
    }
    return nothing;
  }

  override disconnected() {
    // Only clear the box if our element is still the one in it (i.e. another
    // directive instance hasn't rendered its element to it before us); that
    // only happens in the event of the directive being cleared (not via manual
    // disconnection)
    if (this.#element === this.#element) {
      this.#updateLinkValue(undefined);
    }
  }

  override reconnected() {
    // If we were manually disconnected, we can safely put our element back in
    // the box, since no rendering could have occurred to change its state
    this.#updateLinkValue(this.#element);
  }
}

/**
 * Links an element to a given path.
 * If the element is an anchor, it will set the `href` attribute, otherwise it will set a `data-href` attribute and a `role="link"` attribute.
 * It will also add a click handler to the element that will navigate to the given path, then.
 *
 * @example
 * ```html
 * <a ${link('/home')}>Home</a>
 * ```
 *
 * @example
 * ```html
 * <button ${link('?menu-visible=1')}>Home</button>
 * ```
 *
 * @example
 * ```html
 * <custom-button ${link('/login', 'button')}>Home</custom-button>
 * ```
 */
export const link = directive(LinkDirective);
