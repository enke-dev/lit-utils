/**
 * @jest-environment node
 */
import { describe, expect, it } from '@jest/globals';

import { listenDocument, listenHost, listenOn, listenWindow } from './event.utils.js';

// the node environment has neither a window nor a document, like server-side rendering
describe('event.utils without a browser', () => {
  it('has no browser globals to begin with', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('creates the decorators, as it happens when a module with them is imported', () => {
    expect(() => listenDocument('click')).not.toThrow();
    expect(() => listenWindow('resize')).not.toThrow();
    expect(() => listenHost('click')).not.toThrow();
    expect(() => listenOn(() => globalThis as unknown as EventTarget, 'custom')).not.toThrow();
  });
});
