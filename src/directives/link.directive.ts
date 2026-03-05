import type { ElementPart } from 'lit';
import { nothing } from 'lit';
import type { DirectiveResult } from 'lit/async-directive.js';
import { AsyncDirective, directive } from 'lit/async-directive.js';

import { goto } from '../utils/router.utils.js';

export interface LinkDirectiveOptions {
  /**
   * Customizes the ARIA role set on non-anchor elements.
   * For anchors, the role is not set. All other elements get a `role="link"` by default.
   * If you e.g. have a custom button component, you might want to set this to `button` instead.
   */
  role?: string;

  /**
   * Skips preventing the default event on click and the custom event dispatching for the router.
   * Instead, the native behavior of the element is preserved.
   */
  native?: boolean;

  /**
   * Adds a backlink to the element.
   * The given string will be used as query parameter key, with the current path as value.
   */
  addBacklink?: string;
}

/**
 * @private
 */
export class LinkDirective extends AsyncDirective {
  #element: Element | undefined;
  #link: string | undefined;
  #role: string | undefined;
  #native: boolean | undefined;
  #addBacklink: string | undefined;

  #handleClick = ((event: Event) => {
    event.preventDefault();
    if (this.#link !== undefined) {
      goto(this.#prepareLink(this.#link));
    }
  }).bind(this);

  // adds the backlink query parameter to the given path if the option is set
  #prepareLink(link: string): string {
    // no backlink, no problem
    if (this.#addBacklink === undefined) {
      return link;
    }

    // prepare a url with backlink
    const url = new URL(link, location.origin);
    const current = `${location.pathname}${location.search}`;
    url.searchParams.set(this.#addBacklink, current);

    // make sure the backlink doesn't point to itself, that would be awkward
    if (url.pathname === location.pathname) {
      return link;
    }

    // return just the path
    return `${url.pathname}${url.search}`;
  }

  // set the link to the element
  #updateLinkValue(element: Element | undefined) {
    if (this.#link === undefined) {
      return;
    }
    const link = this.#prepareLink(this.#link);

    // update the href attribute if the element is an anchor
    if (element instanceof HTMLAnchorElement) {
      element?.setAttribute('href', link);
    }
    // set aria role for buttons (and all others)
    else {
      element?.setAttribute('data-href', link);
      element?.setAttribute('role', this.#role ?? 'link');
    }

    // update the click handler
    if (this.#native) {
      element?.removeEventListener('click', this.#handleClick, { capture: true });
    } else {
      element?.addEventListener('click', this.#handleClick, { capture: true });
    }
  }

  // as the inferred types are not properly visible in the docs, make
  // sure to explicitly describe the parameters at the `directive` call
  override render(_link?: string, _options?: Partial<LinkDirectiveOptions>) {
    return nothing;
  }

  override update(part: ElementPart, [link, options]: Parameters<this['render']>) {
    const linkChanged = link !== this.#link;
    const roleChanged = options?.role !== this.#role;
    const nativeChanged = options?.native !== this.#native;
    if (linkChanged && this.#link !== undefined) {
      // The link passed to the directive has changed;
      // unset the previous link's value
      this.#updateLinkValue(undefined);
    }
    if (linkChanged || roleChanged || nativeChanged || this.#element !== this.#element) {
      // We either got a new link or this is the first render;
      // store the link and element, update the link value
      this.#link = link;
      this.#role = options?.role;
      this.#native = options?.native ?? false;
      this.#addBacklink = options?.addBacklink;
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
 * Link an anchor to a route path
 *
 * ```html
 * <a ${link('/home')}>Home</a>
 * ```
 *
 * @example
 * Link a button to a route path
 *
 * ```html
 * <button ${link('?menu-visible=1')}>Home</button>
 * ```
 *
 * @example
 * Link to a resource without preventing native behavior
 *
 * ```html
 * <a ${link('https://example.com/login', { native: true })}>Login</a>
 * ```
 *
 * @example
 * Link a custom element to a route path with a custom role
 *
 * ```html
 * <custom-button ${link('/login', { role: 'button' })}>Home</custom-button>
 * ```
 *
 * @example
 * Link to a route path with a backlink to the current page
 *
 * ```html
 * <a ${link('/login', { addBacklink: 'back' })}>Login</a>
 * <!-- Navigating to /login will result in the URL /login?back=/current/path -->
 * ```
 */
export const link = directive(LinkDirective) as (
  /**
   * The link path to navigate to.
   */
  link: string,

  /**
   * Additional options for the link directive.
   */
  options?: Partial<LinkDirectiveOptions>
) => DirectiveResult<typeof LinkDirective>;
