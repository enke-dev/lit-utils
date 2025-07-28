import { expect } from '@open-wc/testing';

import { DateIsoConverter } from './date-iso.converter.js';

describe('date-iso.converter', () => {
  it('converts a Date to an ISO string', () => {
    const date = new Date('2023-01-01');
    const converter = DateIsoConverter();
    const isoString = converter.toAttribute(date);
    expect(isoString).to.equal('2023-01-01T00:00:00.000Z');
  });

  it('converts a Date to a short ISO string when short is true', () => {
    const date = new Date('2023-01-01');
    const converter = DateIsoConverter(true);
    const shortIsoString = converter.toAttribute(date);
    expect(shortIsoString).to.equal('2023-01-01');
  });

  it('converts an ISO string to a Date object', () => {
    const isoString = '2023-01-01T00:00:00.000Z';
    const converter = DateIsoConverter();
    const date = converter.fromAttribute(isoString);
    expect(date).to.be.instanceOf(Date);
    expect(date?.toISOString()).to.equal(isoString);
  });

  it('converts a short ISO string to a Date object when short is true', () => {
    const shortIsoString = '2023-01-01';
    const converter = DateIsoConverter(true);
    const date = converter.fromAttribute(shortIsoString);
    expect(date).to.be.instanceOf(Date);
    expect(date?.toISOString()).to.equal('2023-01-01T00:00:00.000Z');
  });

  it('returns undefined for an empty attribute value', () => {
    const converter = DateIsoConverter();
    const date = converter.fromAttribute('');
    expect(date).to.be.undefined;
  });
});
