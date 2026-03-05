import { expect } from '@open-wc/testing';
import sinon from 'sinon';

import { goto, handleSearchParams, redirect } from './router.utils.js';

describe('router.utils', () => {
  describe('handleSearchParams', () => {
    let prev: string;

    beforeEach(() => {
      prev = location.href;
      const url = new URL(prev);
      url.search = '?foo=bar';
      history.replaceState(null, '', url);
    });

    afterEach(() => {
      history.replaceState(null, '', prev);
    });

    it('replaces the search params of the current URL', () => {
      // GIVEN a path with search params
      const path = '/foo.html?bar=123&baz=1';
      const fromPath = handleSearchParams(path, 'replace');
      const fromURL = handleSearchParams(new URL(path, location.href), 'replace');

      // THEN existing search params are replaced
      expect(fromPath).to.equal('/foo.html?bar=123&baz=1');
      expect(fromURL).to.equal('/foo.html?bar=123&baz=1');
    });

    it('merges the search params of the current URL', () => {
      // GIVEN a path with search params
      const path = '/foo.html?bar=123&baz=1';
      const fromPath = handleSearchParams(path, 'preserve');
      const fromURL = handleSearchParams(new URL(path, location.href), 'preserve');

      // THEN existing search params are merged
      expect(fromPath).to.equal('/foo.html?foo=bar&bar=123&baz=1');
      expect(fromURL).to.equal('/foo.html?foo=bar&bar=123&baz=1');
    });

    it('overrides existing search params on merge', () => {
      const path = '/foo.html?foo=foo&bar=123';
      const fromPath = handleSearchParams(path, 'preserve');
      const fromURL = handleSearchParams(new URL(path, location.href), 'preserve');

      // THEN search params are merged, existing ones overridden
      expect(fromURL).to.equal('/foo.html?foo=foo&bar=123');
      expect(fromPath).to.equal('/foo.html?foo=foo&bar=123');
    });
  });

  describe('goto', () => {
    it('dispatches events', async () => {
      // mock history pushState and window.dispatchEvent
      const pushState = sinon.spy(history, 'pushState');
      const dispatchEvent = sinon.spy(window, 'dispatchEvent');

      // WHEN goto is called
      goto('/foo');

      // THEN pushState and dispatchEvent are called
      expect(pushState.calledOnce).to.be.true;
      expect(pushState.firstCall.firstArg).to.deep.equal({ path: '/foo' });
      expect(dispatchEvent.calledOnceWith(sinon.match.instanceOf(CustomEvent))).to.be.true;
      expect(dispatchEvent.firstCall.firstArg.detail).to.deep.equal({ path: '/foo' });

      // restore mocks
      pushState.restore();
      dispatchEvent.restore();
    });
  });

  describe('redirect', () => {
    it('returns false', () => {
      // WHEN redirect is called
      const result = redirect('/foo');

      // THEN false is returned
      expect(result).to.be.false;
    });

    it('dispatches events', async () => {
      // mock history pushState and window.dispatchEvent
      const replaceState = sinon.spy(history, 'replaceState');
      const dispatchEvent = sinon.spy(window, 'dispatchEvent');

      // WHEN redirect is called
      redirect('/foo');

      // THEN replaceState and dispatchEvent are called
      expect(replaceState.calledOnce).to.be.true;
      expect(replaceState.firstCall.firstArg).to.deep.equal({ path: '/foo' });
      expect(dispatchEvent.calledOnceWith(sinon.match.instanceOf(CustomEvent))).to.be.true;
      expect(dispatchEvent.firstCall.firstArg.detail).to.deep.equal({ path: '/foo' });

      // restore mocks
      replaceState.restore();
      dispatchEvent.restore();
    });
  });
});
