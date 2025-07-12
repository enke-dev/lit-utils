import { expect } from '@open-wc/testing';

import { ListConverter } from './list.converter.js';

describe('ListConverter', () => {
  it('provides default separator and type', () => {
    expect(ListConverter().fromAttribute('foo,23')).to.have.members(['foo', '23']);
  });

  it('parses missing values as empty array', () => {
    expect(ListConverter(',', String).fromAttribute(null)).to.be.an('array').that.is.empty;
  });

  it('parses empty values as empty array', () => {
    expect(ListConverter(',', String).fromAttribute('')).to.have.lengthOf(0);
    expect(ListConverter(',', Number).fromAttribute('')).to.have.lengthOf(0);
  });

  it('parses single values as array with single entry', () => {
    expect(ListConverter(',', String).fromAttribute('foo')).to.have.members(['foo']);
    expect(ListConverter(',', Number).fromAttribute('23')).to.have.members([23]);
  });

  it('parses multiple values as array', () => {
    expect(ListConverter(',', String).fromAttribute('foo,bar')).to.have.members(['foo', 'bar']);
    expect(ListConverter(',', Number).fromAttribute('23,32,14')).to.have.members([23, 32, 14]);
  });

  it('keeps empty values within', () => {
    expect(ListConverter(',', String).fromAttribute('foo,,bar,')).to.have.members([
      'foo',
      '',
      'bar',
      '',
    ]);
    expect(ListConverter(',', Number).fromAttribute('23,,14,')).to.have.members([23, 0, 14, 0]);
  });

  it('allows custom separators', () => {
    expect(ListConverter(' ', String).fromAttribute('foo bar')).to.have.members(['foo', 'bar']);
    expect(ListConverter('#', String).fromAttribute('foo#bar')).to.have.members(['foo', 'bar']);
    expect(ListConverter('|', String).fromAttribute('foo|bar')).to.have.members(['foo', 'bar']);

    expect(ListConverter(' ', Number).fromAttribute('23 32 14')).to.have.members([23, 32, 14]);
    expect(ListConverter('#', Number).fromAttribute('23#32#14')).to.have.members([23, 32, 14]);
    expect(ListConverter('|', Number).fromAttribute('23|32|14')).to.have.members([23, 32, 14]);
  });

  it('keeps whitespace in entries', () => {
    expect(ListConverter(',', String).fromAttribute(' ')).to.have.members([' ']);
    expect(ListConverter(',', String).fromAttribute('foo ')).to.have.members(['foo ']);
    expect(ListConverter(',', String).fromAttribute(' foo ,bar ')).to.have.members([
      ' foo ',
      'bar ',
    ]);
  });

  it('delivers null for empty lists', () => {
    expect(ListConverter(',', String).toAttribute([])).to.be.null;
    expect(ListConverter(',', Number).toAttribute([])).to.be.null;
  });

  it('returns an empty attribute for single, empty entry', () => {
    expect(ListConverter(',', String).toAttribute([''])).to.be.a('string').that.is.empty;
    expect(ListConverter(',', Number).toAttribute([''])).to.be.an('string').that.is.empty;
  });

  it('stringifies single entry lists', () => {
    expect(ListConverter(',', String).toAttribute(['foo'])).equals('foo');
    expect(ListConverter(',', Number).toAttribute([23])).equals('23');
  });

  it('stringifies multiple entry lists', () => {
    expect(ListConverter(',', String).toAttribute(['foo', 'bar'])).equals('foo,bar');
    expect(ListConverter(' ', String).toAttribute(['foo', 'bar'])).equals('foo bar');
    expect(ListConverter('#', String).toAttribute(['foo', 'bar'])).equals('foo#bar');
    expect(ListConverter('|', String).toAttribute(['foo', 'bar'])).equals('foo|bar');

    expect(ListConverter(',', Number).toAttribute([23, 32, 14])).equals('23,32,14');
    expect(ListConverter(' ', Number).toAttribute([23, 32, 14])).equals('23 32 14');
    expect(ListConverter('#', Number).toAttribute([23, 32, 14])).equals('23#32#14');
    expect(ListConverter('|', Number).toAttribute([23, 32, 14])).equals('23|32|14');
  });
});
