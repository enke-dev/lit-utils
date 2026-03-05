import type { Routes } from '@lit-labs/router';
import { expect, nextFrame } from '@open-wc/testing';
import sinon from 'sinon';

import {
  connectHistory,
  goto,
  handleSearchParams,
  redirect,
  ROUTER_NAVIGATE_COMMAND,
  ROUTER_NAVIGATE_EVENT,
} from './router.utils.js';

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
    it('dispatches a navigate command', () => {
      const pushState = sinon.spy(history, 'pushState');
      const dispatchEvent = sinon.spy(window, 'dispatchEvent');

      // WHEN goto is called
      goto('/foo');

      // THEN pushState is called and the navigate command is dispatched
      expect(pushState.calledOnce).to.be.true;
      expect(pushState.firstCall.firstArg).to.deep.equal({ path: '/foo' });
      expect(dispatchEvent.calledOnceWith(sinon.match.instanceOf(CustomEvent))).to.be.true;
      expect(dispatchEvent.firstCall.firstArg.type).to.equal(ROUTER_NAVIGATE_COMMAND);
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

    it('dispatches a navigate command', () => {
      const replaceState = sinon.spy(history, 'replaceState');
      const dispatchEvent = sinon.spy(window, 'dispatchEvent');

      // WHEN redirect is called
      redirect('/foo');

      // THEN replaceState is called and the navigate command is dispatched
      expect(replaceState.calledOnce).to.be.true;
      expect(replaceState.firstCall.firstArg).to.deep.equal({ path: '/foo' });
      expect(dispatchEvent.calledOnceWith(sinon.match.instanceOf(CustomEvent))).to.be.true;
      expect(dispatchEvent.firstCall.firstArg.type).to.equal(ROUTER_NAVIGATE_COMMAND);
      expect(dispatchEvent.firstCall.firstArg.detail).to.deep.equal({ path: '/foo' });

      // restore mocks
      replaceState.restore();
      dispatchEvent.restore();
    });
  });

  describe('connectHistory', () => {
    let previousHref: string;
    let disconnect: () => void;

    beforeEach(() => {
      previousHref = location.href;
    });

    afterEach(() => {
      disconnect?.();
      history.replaceState(null, '', previousHref);
    });

    it('forwards navigate commands to router.goto', async () => {
      const router = { goto: sinon.stub().resolves() };
      disconnect = connectHistory(router as unknown as Routes);

      goto('/foo');
      await nextFrame();

      expect(router.goto.calledOnce).to.be.true;
      expect(router.goto.firstCall.firstArg).to.equal('/foo');
    });

    it('stops forwarding events after cleanup', async () => {
      const router = { goto: sinon.stub().resolves() };
      disconnect = connectHistory(router as unknown as Routes);
      disconnect();

      goto('/foo');
      await nextFrame();

      expect(router.goto.called).to.be.false;
    });

    it('dispatches a navigate event after router.goto settles', async () => {
      const router = { goto: sinon.stub().resolves() };
      disconnect = connectHistory(router as unknown as Routes);
      const navigateListener = sinon.stub();
      window.addEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);

      goto('/foo');
      await nextFrame();

      expect(navigateListener.calledOnce).to.be.true;
      expect(navigateListener.firstCall.firstArg.detail).to.deep.equal({ path: '/foo' });

      window.removeEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);
    });

    it('re-syncs router when redirect occurs during navigation', async () => {
      // simulate an enter hook calling redirect() — redirect dispatches a new
      // ROUTER_NAVIGATE_COMMAND which connectHistory picks up as a second navigation
      const router = {
        goto: sinon.stub().callsFake(async (path: string) => {
          if (path === '/foo') {
            redirect('/foo?page=1');
          }
        }),
      };
      disconnect = connectHistory(router as unknown as Routes);

      goto('/foo');
      await nextFrame();

      // THEN router.goto is called a second time via the redirect's own command
      expect(router.goto.calledTwice).to.be.true;
      expect(router.goto.firstCall.firstArg).to.equal('/foo');
      expect(router.goto.secondCall.firstArg).to.equal('/foo?page=1');
    });

    it('dispatches navigate event with final location after redirect', async () => {
      const router = {
        goto: sinon.stub().callsFake(async (path: string) => {
          if (path === '/foo') {
            redirect('/foo?page=1');
          }
        }),
      };
      disconnect = connectHistory(router as unknown as Routes);
      const navigateListener = sinon.stub();
      window.addEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);

      goto('/foo');
      await nextFrame();

      // THEN the navigate event is dispatched exactly once with the final location
      expect(navigateListener.calledOnce).to.be.true;
      expect(navigateListener.firstCall.firstArg.detail).to.deep.equal({ path: '/foo?page=1' });

      window.removeEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);
    });

    it('does not dispatch navigate event for the stale goto when redirect occurred', async () => {
      const router = {
        goto: sinon.stub().callsFake(async (path: string) => {
          if (path === '/foo') {
            redirect('/foo?page=1');
          }
        }),
      };
      disconnect = connectHistory(router as unknown as Routes);
      const navigateListener = sinon.stub();
      window.addEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);

      goto('/foo');
      await nextFrame();

      // THEN only one event is dispatched (not one for /foo and one for /foo?page=1)
      expect(navigateListener.calledOnce).to.be.true;

      window.removeEventListener(ROUTER_NAVIGATE_EVENT, navigateListener);
    });

    it('does not re-sync when location has not changed', async () => {
      const router = { goto: sinon.stub().resolves() };
      disconnect = connectHistory(router as unknown as Routes);

      goto('/foo');
      await nextFrame();

      // THEN router.goto is only called once — no re-sync needed
      expect(router.goto.calledOnce).to.be.true;
    });
  });
});
