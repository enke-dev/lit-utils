import { expect } from '@open-wc/testing';

import { StringifiedBooleanConverter } from './stringified-boolean.converter.js';

describe('StringifiedBooleanConverter', () => {
  it('parses boolean values', () => {
    expect(StringifiedBooleanConverter().fromAttribute('true')).to.be.true;
    expect(StringifiedBooleanConverter().fromAttribute('false')).to.be.false;
  });

  it('parses custom boolean values', () => {
    expect(StringifiedBooleanConverter('ja', 'nein').fromAttribute('ja')).to.be.true;
    expect(StringifiedBooleanConverter('ja', 'nein').fromAttribute('nein')).to.be.false;
  });
});
