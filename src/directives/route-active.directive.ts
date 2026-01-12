import { noChange } from 'lit';
import type { DirectiveResult } from 'lit/async-directive.js';
import {
  AsyncDirective,
  directive,
  ElementPart,
  Part,
  PartInfo,
  PartType,
} from 'lit/async-directive.js';

/**
 * @private
 */
export class RouteActiveDirective extends AsyncDirective {
  // use the location path as default - this should
  // may be retrieved from the router somehow...
  #currentPath = window.location.pathname;
  #route?: string;
  #isRouteActive = false;

  readonly #element?: Element;

  #matchRoute(): boolean {
    if (this.#route === undefined) {
      return false;
    }

    // pattern matching using a URLPattern
    const route = new URLPattern(this.#route, window.location.origin);
    const url = new URL(this.#currentPath, window.location.origin);

    return route.test(url);
  }

  // as the inferred types are not properly visible in the docs, make
  // sure to explicitly describe the parameters at the `directive` call
  render(_route: string, _toggleClass?: string) {
    return noChange;
  }

  override update(part: Part, [route, toggleClass = 'active']: [string, string | undefined]) {
    this.#route = route;
    this.#currentPath = window.location.pathname;

    const isRouteActive = this.#matchRoute();
    const hasRouteChanged = isRouteActive !== this.#isRouteActive;

    if (part.type === PartType.ELEMENT && this.#element !== undefined && this.isConnected) {
      this.#element.classList.toggle(toggleClass, isRouteActive);
    }

    if (hasRouteChanged) {
      this.#isRouteActive = isRouteActive;
      return this.#isRouteActive;
    }

    return noChange;
  }

  constructor(partInfo: PartInfo) {
    super(partInfo);

    // check usage
    if (
      partInfo.type !== PartType.PROPERTY &&
      partInfo.type !== PartType.BOOLEAN_ATTRIBUTE &&
      partInfo.type !== PartType.ELEMENT
    ) {
      throw new Error(
        'The `routerActive` directive must be used with a boolean result attribute / property, or directly on the element itself to toggle a class.'
      );
    }

    // store a reference to the element
    if (partInfo.type === PartType.ELEMENT) {
      this.#element = (partInfo as ElementPart).element;
    }
  }
}

/**
 * Reactive directive to check for the current route being active.
 * Can be used directly on an element to toggle a css class or with a boolean attribute or property.
 *
 * @example
 * Either toggle a CSS class on the element, ...
 *
 * ```html
 * <a href="/home" ${routeActive('/home', 'active')}>Home</a>
 * ```
 *
 * @example
 * Or set a boolean attribute or property with the result of the directive.
 *
 * ```html
 * <button href="/home" ?disabled="${routeActive('/home')}">Home</button>
 * ```
 */
export const routeActive = directive(RouteActiveDirective) as (
  /**
   * The route path to match against the current location.
   */
  route: string,

  /**
   * The CSS class to toggle on the element when the route is active.
   * @default 'active'
   */
  toggleClass?: string
) => DirectiveResult<typeof RouteActiveDirective>;
