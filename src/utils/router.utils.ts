import 'urlpattern-polyfill';

import type { Routes } from '@lit-labs/router';
import type { URLPattern } from 'urlpattern-polyfill';

/**
 * Defines how to handle query parameters when navigating.
 * Can either be merged with existing query parameters or replace them entirely.
 */
export type SearchParamsHandling = 'preserve' | 'replace';
let searchParamsHandling: SearchParamsHandling = 'replace';

export function setSearchParamsHandling(strategy: SearchParamsHandling) {
  searchParamsHandling = strategy;
}

/**
 * Internal function to apply search parameters according to the given strategy.
 */
export function handleSearchParams(path: string, strategy = searchParamsHandling): string {
  // replace strategy does not need to do anything
  if (strategy === 'replace') return path;

  // merging search query parameters
  const params = new URLSearchParams(location.search);
  const url = new URL(path, location.origin);
  url.searchParams.forEach((value, key) => params.set(key, value));
  return `${url.pathname}?${params}`;
}

/**
 * Primitive route matcher. May cause issues.
 * Should receive some love.
 */
export function matchRoute(currentPath: string, route: string, exact: boolean): boolean;
export function matchRoute(currentPath: string, route: URLPattern): boolean;
export function matchRoute(
  currentPath: string,
  route: string | URLPattern,
  exact?: boolean,
): boolean {
  // string based matching
  if (typeof route === 'string') {
    if (exact) {
      return currentPath === route;
    }
    // TODO: this will match partial slugs (e.g. `/foo` will match `/fooooo`),
    //  and it's not comparing the query string properly
    return currentPath.startsWith(route);
  }

  // handle patterns
  return route.test(new URL(currentPath, location.origin));
}

/**
 * Connects a router instance to the history API.
 * This allows us to reliably check for active routes, or to listen to path changes.
 *
 * It is usually called once the routes are registered.
 *
 * @example
 * ```ts
 * class RootComponent extends LitElement {
 *   readonly #router = new Router(this, [ ... ]);
 *
 *   constructor() {
 *     super();
 *
 *     // bind history to router
 *     connectHistory(this.#router);
 *   }
 *
 *   override render() {
 *     return html`
 *       <main>${this.#router.outlet()}</main>
 *     `;
 *   }
 *   ...
 * }
 * ```
 */
export function connectHistory(router: Routes) {
  // as we implement convenience functions to navigate, we're not using the
  // popstate event to navigate, but introduce a custom event to do so
  window.addEventListener(ROUTER_NAVIGATE_EVENT, ({ detail }) => {
    // tell the router to navigate to the new path
    router.goto(detail.path);
  });
}

/**
 * Conveniently navigates to a new path.
 */
export function goto(path: string): void {
  const next = handleSearchParams(path);
  const detail = { path: next } satisfies RouterNavigateEventPayload;
  history.pushState(detail, '', next);
  window.dispatchEvent(new CustomEvent(ROUTER_NAVIGATE_EVENT, { detail }));
}

/**
 * Convenience function to redirect to a new path, replacing
 * the current history entry.
 *
 * > For usage in routes enter hook, `false` is returned to prevent
 * > the default action of the event.
 *
 * @example
 * ```ts
 * enter: () => {
 *   if (!isAuthenticated()) {
 *     return redirect('/login');
 *   }
 *   ...
 * }
 * ```
 */
export function redirect(to: string, redirectQuery?: string, redirectParam = 'redirect'): false {
  // prepare a url and add redirect query if provided
  const url = new URL(handleSearchParams(to), location.origin);
  if (redirectQuery) {
    url.searchParams.set(redirectParam, redirectQuery);
  }
  // redirect by dispatching our custom event
  const path = `${url.pathname}${url.search}${url.hash}`;
  const detail = { path } satisfies RouterNavigateEventPayload;
  history.replaceState(detail, '', path);
  window.dispatchEvent(new CustomEvent(ROUTER_NAVIGATE_EVENT, { detail }));
  // for convenience, return false for usage as route enter hook
  return false;
}

// our custom event to navigate to a new path
export const ROUTER_NAVIGATE_EVENT = 'router:navigate' as const;
export interface RouterNavigateEventPayload {
  path: string;
}

declare global {
  interface WindowEventMap {
    [ROUTER_NAVIGATE_EVENT]: CustomEvent<RouterNavigateEventPayload>;
  }
}
