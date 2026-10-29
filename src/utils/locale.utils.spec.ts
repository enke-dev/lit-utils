import { afterEach, describe, it } from '@jest/globals';
import { expect } from '@open-wc/testing';

import { plural } from './locale.utils.js';

const FORMS = { one: 'device', other: 'devices' };

describe('locale.utils', () => {
  describe('plural', () => {
    afterEach(() => {
      document.documentElement.lang = '';
    });

    it('picks the form the plural rules name', () => {
      expect(plural(1, FORMS, 'en')).to.equal('device');
      expect(plural(0, FORMS, 'en')).to.equal('devices');
      expect(plural(2, FORMS, 'en')).to.equal('devices');
    });

    it('follows the rules of the locale', () => {
      // fr: zero is one, pl: has few
      expect(plural(0, FORMS, 'fr')).to.equal('device');
      expect(
        plural(3, { one: 'plik', few: 'pliki', many: 'plików', other: 'pliku' }, 'pl')
      ).to.equal('pliki');
    });

    it('falls back to other for a category without a form', () => {
      expect(plural(1, { other: 'devices' }, 'en')).to.equal('devices');
    });

    it('reads no count as other', () => {
      expect(plural(undefined, FORMS, 'en')).to.equal('devices');
    });

    it('defaults to the lang of the document', () => {
      document.documentElement.lang = 'fr';
      expect(plural(0, FORMS)).to.equal('device');
    });

    it('defaults to the runtime locale without a lang', () => {
      expect(plural(2, FORMS)).to.equal('devices');
    });
  });
});
