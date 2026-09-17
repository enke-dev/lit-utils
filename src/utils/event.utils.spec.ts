import { describe, it } from '@jest/globals';
import { expect } from '@open-wc/testing';
import { ReactiveElement } from 'lit';

import { listenDocument, listenHost, listenOn, listenWindow } from './event.utils.js';

class HostListener extends ReactiveElement {
  calls: Event[] = [];

  @listenHost('click')
  handleClick(event: Event): void {
    this.calls.push(event);
  }
}
customElements.define('test-listen-host', HostListener);

class DocumentListener extends ReactiveElement {
  calls: Event[] = [];

  @listenDocument('click')
  handleClick(event: Event): void {
    this.calls.push(event);
  }
}
customElements.define('test-listen-document', DocumentListener);

class WindowListener extends ReactiveElement {
  calls: Event[] = [];

  @listenWindow('resize')
  handleResize(event: Event): void {
    this.calls.push(event);
  }
}
customElements.define('test-listen-window', WindowListener);

class CustomTargetListener extends ReactiveElement {
  calls: Event[] = [];

  @listenOn(window, 'app-colour-scheme:change')
  handleChange(event: Event): void {
    this.calls.push(event);
  }
}
customElements.define('test-listen-on', CustomTargetListener);

/** Connect an element, returning it and a way to disconnect it again. */
function connect<T extends HTMLElement>(tag: string): T {
  const element = document.createElement(tag) as T;
  document.body.append(element);
  return element;
}

describe('event.utils', () => {
  describe('listenHost', () => {
    it('invokes the decorated method when the host dispatches the event', () => {
      const element = connect<HostListener>('test-listen-host');
      element.dispatchEvent(new Event('click'));
      expect(element.calls).to.have.lengthOf(1);
      element.remove();
    });

    it('stops listening once disconnected', () => {
      const element = connect<HostListener>('test-listen-host');
      element.remove();
      element.dispatchEvent(new Event('click'));
      expect(element.calls).to.have.lengthOf(0);
    });

    it('binds the method to its own instance', () => {
      const first = connect<HostListener>('test-listen-host');
      const second = connect<HostListener>('test-listen-host');
      second.dispatchEvent(new Event('click'));
      expect(first.calls).to.have.lengthOf(0);
      expect(second.calls).to.have.lengthOf(1);
      first.remove();
      second.remove();
    });
  });

  describe('listenDocument', () => {
    it('invokes the decorated method for document events', () => {
      const element = connect<DocumentListener>('test-listen-document');
      document.dispatchEvent(new Event('click'));
      expect(element.calls).to.have.lengthOf(1);
      element.remove();
      document.dispatchEvent(new Event('click'));
      expect(element.calls).to.have.lengthOf(1);
    });
  });

  describe('listenWindow', () => {
    it('invokes the decorated method for window events', () => {
      const element = connect<WindowListener>('test-listen-window');
      window.dispatchEvent(new Event('resize'));
      expect(element.calls).to.have.lengthOf(1);
      element.remove();
      window.dispatchEvent(new Event('resize'));
      expect(element.calls).to.have.lengthOf(1);
    });
  });

  describe('listenOn', () => {
    it('listens on an arbitrary target and event name', () => {
      const element = connect<CustomTargetListener>('test-listen-on');
      window.dispatchEvent(new CustomEvent('app-colour-scheme:change', { detail: 'dark' }));
      expect(element.calls).to.have.lengthOf(1);
      element.remove();
    });
  });
});
