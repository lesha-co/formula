import { grammar } from '../grammar';
import { tok } from '../primitives/constructors/tokenConstructors';
import { validate } from '../validate';
import { expect, test, describe } from '@jest/globals';

const variable = tok.variable('hello');
const one = tok.scalar(1);
const plus = tok.arithmetic('+');
const minus = tok.arithmetic('-');
const open = tok.openingBracket();
const close = tok.closingBracket();
const gt = tok.ineq('>');

describe('Correct expressions', () => {
  test('1+(1+(-1+1))', () => {
    expect(
      validate(
        [one, plus, open, one, plus, open, minus, one, plus, one, close, close],
        grammar,
      ),
    ).not.toBe(null);
  });
  test('x', () => {
    expect(validate([variable], grammar)).not.toBe(null);
  });
  test('-1', () => {
    expect(validate([minus, one], grammar)).not.toBe(null);
  });
  test('-1+x', () => {
    expect(validate([minus, one, plus, variable], grammar)).not.toBe(null);
  });
  test('(-1)+(1)', () => {
    expect(
      validate([open, minus, one, close, plus, open, one, close], grammar),
    ).not.toBe(null);
  });
});
describe('Incorrect expressions', () => {
  test('-1++x', () => {
    expect(validate([minus, one, plus, plus, variable], grammar)).toBe(null);
  });
  test('-1+-1+(-1+-1)', () => {
    expect(
      validate(
        [
          minus,
          one,
          plus,
          minus,
          one,
          plus,
          open,
          minus,
          one,
          plus,
          minus,
          one,
          close,
        ],
        grammar,
      ),
    ).toBe(null);
  });
  test('1+(1+(-1+1)))+1+(1+1)', () => {
    expect(
      validate(
        [
          one,
          plus,
          open,
          one,
          plus,
          open,
          minus,
          one,
          plus,
          one,
          close,
          close,
          close,
          plus,
          one,
          plus,
          open,
          one,
          plus,
          one,
          close,
        ],
        grammar,
      ),
    ).toBe(null);
  });
});

describe('Correct inequalities', () => {
  test('x>1', () => {
    expect(validate([variable, gt, one], grammar)).not.toBe(null);
  });
  test('x>1', () => {
    expect(validate([variable, gt, one], grammar)).not.toBe(null);
  });
});
describe('Incorrect inequalities', () => {
  test('x>1<1', () => {
    expect(validate([variable, gt, one, gt, one], grammar)).toBe(null);
  });
  test('(x<1)', () => {
    expect(validate([open, variable, gt, one, close], grammar)).toBe(null);
  });
});
