import { expect } from '@open-wc/testing';

import { handleSearchParams } from './router.utils.js';

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
});
