/**
 * tokens
 */

import { Token } from '../token';
import { Type } from '../tokenTypes';
import * as cls from '../operatorClasses';
export const tok = {
  variable: (name: string): Token => ({
    type: Type.VARIABLE,
    value: { id: name, name, parameters: {} },
  }),
  arithmetic: (value: cls.ArithmeticOperator): Token => ({ type: Type.ARITHMETIC_OPERATOR, value }),
  ineq: (value: cls.InequationOperator): Token => ({ type: Type.INEQUATION_OPERATOR, value }),
  openingBracket: (): Token => ({ type: Type.OPENING_BRACKET, value: '(' }),
  closingBracket: (): Token => ({ type: Type.CLOSING_BRACKET, value: ')' }),
  scalar: (value: number): Token => ({ type: Type.SCALAR, value }),
  uminus: (): Token => ({ type: Type.UNARY_MINUS, value: '-' }),
};
