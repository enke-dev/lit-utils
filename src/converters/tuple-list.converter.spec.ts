import { describe, it } from '@jest/globals';
import { expect } from '@open-wc/testing';

import { TupleListConverter } from './tuple-list.converter.js';

describe('TupleListConverter', () => {
  it('provides default separator and types', () => {
    expect(TupleListConverter().fromAttribute('1 2,3 4')).to.have.deep.members([
      [1, 2],
      [3, 4],
    ]);
  });

  it('parses missing values as empty array', () => {
    expect(TupleListConverter(',', ' ', [String]).fromAttribute(null)).to.be.an('array').that.is
      .empty;
  });

  it('parses empty values as empty array', () => {
    expect(TupleListConverter(',', ' ', [String]).fromAttribute('')).to.have.lengthOf(0);
    expect(TupleListConverter(',', ' ', [Number]).fromAttribute('')).to.have.lengthOf(0);
  });

  it('parses single tuples as array with single entres', () => {
    expect(TupleListConverter(',', ' ', [String]).fromAttribute('foo')).to.have.deep.members([
      ['foo'],
    ]);
    expect(TupleListConverter(',', ' ', [Number]).fromAttribute('23')).to.have.deep.members([[23]]);
  });

  it('parses multiple values as array of tuples', () => {
    expect(TupleListConverter(',', ' ', [String]).fromAttribute('foo,bar')).to.have.deep.members([
      ['foo'],
      ['bar'],
    ]);
    expect(
      TupleListConverter(' ', ',', [Number, Number, Number]).fromAttribute('23,32,14')
    ).to.have.deep.members([[23, 32, 14]]);
  });

  it('keeps empty values within', () => {
    expect(TupleListConverter(',', ' ', [String]).fromAttribute('foo,,bar,')).to.have.deep.members([
      ['foo'],
      [''],
      ['bar'],
      [''],
    ]);
    expect(TupleListConverter(',', ' ', [Number]).fromAttribute('23,,14,')).to.have.deep.members([
      [23],
      [0],
      [14],
      [0],
    ]);
  });

  it('allows custom separators', () => {
    expect(
      TupleListConverter('#', 'x', [String, String]).fromAttribute('fooxbar#baz')
    ).to.have.deep.members([['foo', 'bar'], ['baz']]);
  });

  it('keeps whitespace in entries', () => {
    expect(TupleListConverter(';', ',', [String]).fromAttribute(' ')).to.have.deep.members([[' ']]);
    expect(
      TupleListConverter(';', ',', [String, String]).fromAttribute('foo ; bar , baz')
    ).to.have.deep.members([['foo '], [' bar ', ' baz']]);
  });

  it('delivers null for empty lists', () => {
    expect(TupleListConverter(',', ' ', [String]).toAttribute([])).to.be.null;
    expect(TupleListConverter(',', ' ', [Number]).toAttribute([])).to.be.null;
  });

  it('returns an empty attribute for single, empty entry', () => {
    expect(TupleListConverter(',', ' ', [String]).toAttribute([['']])).to.be.a('string').that.is
      .empty;
    expect(TupleListConverter(',', ' ', [Number]).toAttribute([[0]]))
      .to.be.a('string')
      .that.equals('0');
  });
});
