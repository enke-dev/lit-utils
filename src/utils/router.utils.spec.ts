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
      const path = handleSearchParams('/foo.html?bar=123&baz=1', 'replace');
      expect(path).to.equal('/foo.html?bar=123&baz=1');
    });

    it('merges the search params of the current URL', () => {
      const path = handleSearchParams('/foo.html?bar=123&baz=1', 'preserve');
      expect(path).to.equal('/foo.html?foo=bar&bar=123&baz=1');
    });

    it('overrides existing search params on merge', () => {
      const path = handleSearchParams('/foo.html?foo=foo&bar=123', 'preserve');
      expect(path).to.equal('/foo.html?foo=foo&bar=123');
    });
  });
});
