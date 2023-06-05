import {
  Token as NewToken,
  createTokenArithmeticOperator,
  createTokenClosingBracket,
  createTokenOpeningBracket,
  createTokenScalar,
  createTokenVariable,
} from './token';

export enum OldTokenType {
  SCALAR = 'scalar',
  METRIC = 'metric',
  OPERATOR = 'operator',
}

export type OldToken =
  | {
      type: OldTokenType.METRIC;
      value: string;
    }
  | {
      type: OldTokenType.OPERATOR;
      value: '+' | '-' | '*' | '/' | '(' | ')';
    }
  | {
      type: OldTokenType.SCALAR;
      value: number;
    };

export function fromOld(t: OldToken): NewToken {
  switch (t.type) {
    case OldTokenType.SCALAR:
      return createTokenScalar(t.value);
    case OldTokenType.METRIC:
      return createTokenVariable({
        id: t.value,
        name: t.value,
        parameters: {},
      });
    case OldTokenType.OPERATOR:
      switch (t.value) {
        case '+':
        case '-':
        case '*':
        case '/':
          return createTokenArithmeticOperator(t.value);
        case '(':
          return createTokenOpeningBracket();
        case ')':
          return createTokenClosingBracket();
      }
  }
}
export function toOld(t: NewToken): OldToken {
  if (t.type === 'unary-minus') {
    return { type: OldTokenType.OPERATOR, value: '-' };
  } else if (t.type === 'arithmetic-operator') {
    return { type: OldTokenType.OPERATOR, value: t.value };
  } else if (t.type === 'closing-bracket') {
    return { type: OldTokenType.OPERATOR, value: ')' };
  } else if (t.type === 'opening-bracket') {
    return { type: OldTokenType.OPERATOR, value: '(' };
  } else if (t.type === 'scalar') {
    return { type: OldTokenType.SCALAR, value: t.value };
  } else if (t.type === 'variable') {
    return { type: OldTokenType.METRIC, value: t.value.id };
  } else if (t.type === 'inequation-operator') {
    throw new Error('Not implemented');
  } else throw new Error('Not implemented');
}
