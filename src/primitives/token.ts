import * as cls from './operatorClasses';
import { Type } from './tokenTypes';
export type Variable = {
  name: string;
  id: string;
  parameters: Record<string, string | number>;
};

export type Token =
  | {
      type: Type.VARIABLE;
      value: Variable;
    }
  | {
      type: Type.SCALAR;
      value: number;
    }
  | {
      type: Type.UNARY_MINUS;
      value: '-';
    }
  | {
      type: Type.ARITHMETIC_OPERATOR;
      value: cls.ArithmeticOperator;
    }
  | {
      type: Type.ARITHMETIC_OPERATOR;
      value: cls.ArithmeticOperator;
    }
  | {
      type: Type.INEQUATION_OPERATOR;
      value: cls.InequationOperator;
    }
  | {
      type: Type.CLOSING_BRACKET;
      value: ')';
    }
  | {
      type: Type.OPENING_BRACKET;
      value: '(';
    };

export function tokenToString(t: Token): string {
  if (t.type === Type.VARIABLE) {
    return t.value.id;
  }
  if (t.type === Type.SCALAR) {
    return t.value.toString(10);
  }
  return t.value;
}
