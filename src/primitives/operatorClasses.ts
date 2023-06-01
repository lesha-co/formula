import * as op from './operators';
export type ArithmeticOperator = '+' | '-' | '*' | '/';
export const ARITHMETIC_OPERATORS: ArithmeticOperator[] = [
  op.PLUS,
  op.MINUS,
  op.DIV,
  op.MUL,
];
export type InequationOperator = '>' | '>=' | '<' | '<=';
export const INEQUATION_OPERATORS: InequationOperator[] = [
  op.LESS_THAN,
  op.LESS_THAN_OR_EQUAL_TO,
  op.GREATER_THAN,
  op.GREATER_THAN_OR_EQUAL_TO,
];
