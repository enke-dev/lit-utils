import type { ReactiveElement } from 'lit';

/** Where a listener is attached, either directly or derived from the element. */
type ListenTarget = EventTarget | ((instance: ReactiveElement) => EventTarget);

/**
 * Attach a listener for as long as the element is connected.
 *
 * The decorated method is bound per instance and stored under a private symbol,
 * so several decorated methods on one class, and several instances of it, do not
 * share or overwrite each other's handlers.
 *
 * Type safety for `name` comes from the public decorators below, each narrowing
 * it to the event map of its own target. This stays untyped on purpose.
 */
function listen(
  to: ListenTarget,
  name: string,
  listener: EventListener,
  element: ReactiveElement,
  options?: AddEventListenerOptions
): void {
  const handlerKey = Symbol('listenHandler');
  const originalConnectedCallback = element.connectedCallback;
  const originalDisconnectedCallback = element.disconnectedCallback;

  element.connectedCallback = function (this: ReactiveElement) {
    originalConnectedCallback.call(this);
    const handler = listener.bind(this);
    (this as unknown as Record<symbol, EventListener>)[handlerKey] = handler;
    const target = typeof to === 'function' ? to(this) : to;
    target.addEventListener(name, handler, options);
  };

  element.disconnectedCallback = function (this: ReactiveElement) {
    originalDisconnectedCallback.call(this);
    const handler = (this as unknown as Record<symbol, EventListener>)[handlerKey];
    if (handler) {
      const target = typeof to === 'function' ? to(this) : to;
      target.removeEventListener(name, handler, options);
    }
  };
}

/**
 * Decorator factory for listeners on targets the typed decorators do not cover:
 * a custom event on `window`, a media query list, an element found at runtime.
 *
 * @param to the target to listen on, or a function receiving the element
 * @param name the event name
 * @param options optional event listener options
 *
 * @example
 * ```ts
 * const listenColorSchemeChange = () => listenOn(window, 'app-color-scheme:change');
 *
 * class MyComponent extends LitElement {
 *   ⁠@listenColorSchemeChange()
 *   protected handleColorSchemeChange(event: CustomEvent<ColorScheme>) {}
 * }
 * ```
 */
export function listenOn(
  to: ListenTarget,
  name: string,
  options?: AddEventListenerOptions
): MethodDecorator {
  return function (target, _propertyKey, descriptor) {
    listen(to, name, descriptor.value as EventListener, target as ReactiveElement, options);
  };
}

/**
 * Decorator to listen to host element events within a lit component.
 * Adds the listener when the component connects and removes it when it disconnects.
 *
 * @param name the host element event to listen for, e.g. `focusout` or `transitionend`
 * @param options optional event listener options, e.g. `{ passive: true }`
 *
 * @example
 * ```ts
 * class MyComponent extends LitElement {
 *   ⁠@listenHost('transitionend', { passive: true })
 *   handleTransitionEnd(event: TransitionEvent) {}
 * }
 * ```
 */
export function listenHost(
  name: keyof HTMLElementEventMap,
  options?: AddEventListenerOptions
): MethodDecorator {
  return listenOn(instance => instance, name, options);
}

/**
 * Decorator to listen to document events within a lit component.
 * Adds the listener when the component connects and removes it when it disconnects.
 *
 * @param name the document event to listen for, e.g. `click` or `keydown`
 * @param options optional event listener options, e.g. `{ passive: true }`
 *
 * @example
 * ```ts
 * class MyComponent extends LitElement {
 *   ⁠@listenDocument('keydown')
 *   handleKeydown(event: KeyboardEvent) {}
 * }
 * ```
 */
export function listenDocument(
  name: keyof DocumentEventMap,
  options?: AddEventListenerOptions
): MethodDecorator {
  return listenOn(document, name, options);
}

/**
 * Decorator to listen to window events within a lit component.
 * Adds the listener when the component connects and removes it when it disconnects.
 *
 * @param name the window event to listen for, e.g. `resize` or `offline`
 * @param options optional event listener options, e.g. `{ passive: true }`
 *
 * @example
 * ```ts
 * class MyComponent extends LitElement {
 *   ⁠@listenWindow('resize', { passive: true })
 *   handleResize(event: UIEvent) {}
 * }
 * ```
 */
export function listenWindow(
  name: keyof WindowEventMap,
  options?: AddEventListenerOptions
): MethodDecorator {
  return listenOn(window, name, options);
}
