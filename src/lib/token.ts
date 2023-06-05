import { z } from 'zod';

export const tokenToID = (() => {
  let x = 0;
  return (t: Token) => {
    x++;
    const value =
      typeof t.value === 'number' || typeof t.value === 'string'
        ? t.value
        : t.value.id;
    return `token-${x}-${t.type}-${value}`;
  };
})();

export function tokenToString(token: Token) {
  switch (token.type) {
    case 'variable':
      return token.value.name;
    case 'scalar':
      return token.value.toString(10);
    case 'unary-minus':
    case 'arithmetic-operator':
    case 'inequation-operator':
    case 'closing-bracket':
    case 'opening-bracket':
      return token.value;
  }
}

const arithmeticOperatorSchema = z.enum(['+', '-', '*', '/']);
const inequationOperatorSchema = z.enum(['>', '>=', '=', '<=', '<']);
const closingBracketOperatorSchema = z.literal(')');
const openingBracketOperatorSchema = z.literal('(');

const scalarSchema = z
  .union([z.string().min(1), z.number()])
  .pipe(z.coerce.number());

export const quickTypeOptions = z.union([
  arithmeticOperatorSchema,
  closingBracketOperatorSchema,
  openingBracketOperatorSchema,
]);

export function fromString(
  s: string,
  knowVarNames: string[] = [],
): Token | null {
  const ao = arithmeticOperatorSchema.safeParse(s);
  if (ao.success) {
    return createTokenArithmeticOperator(ao.data);
  }
  const io = inequationOperatorSchema.safeParse(s);
  if (io.success) {
    return createTokenInequationOperator(io.data);
  }
  if (closingBracketOperatorSchema.safeParse(s).success) {
    return createTokenClosingBracket();
  }
  if (openingBracketOperatorSchema.safeParse(s).success) {
    return createTokenOpeningBracket();
  }
  const scal = scalarSchema.safeParse(s);
  if (scal.success) {
    return createTokenScalar(scal.data);
  }
  if (knowVarNames.includes(s)) {
    return createTokenVariable({ id: s, name: 's', parameters: {} });
  }
  return null;
}

const tokenVariableSchema = z.object({
  type: z.literal('variable'),
  value: z.object({
    name: z.string(),
    id: z.string(),
    parameters: z.record(z.union([z.string(), z.number()])),
  }),
});
const tokenScalarSchema = z.object({
  type: z.literal('scalar'),
  value: scalarSchema,
});
const tokenUnaryMinusSchema = z.object({
  type: z.literal('unary-minus'),
  value: z.literal('unary-'),
});
const tokenArithmeticOperatorSchema = z.object({
  type: z.literal('arithmetic-operator'),
  value: arithmeticOperatorSchema,
});
const tokenInequationOperatorSchema = z.object({
  type: z.literal('inequation-operator'),
  value: inequationOperatorSchema,
});
const tokenClosingBracketSchema = z.object({
  type: z.literal('closing-bracket'),
  value: closingBracketOperatorSchema,
});
const tokenOpeningBracketSchema = z.object({
  type: z.literal('opening-bracket'),
  value: openingBracketOperatorSchema,
});

const tokenSchema = z.union([
  tokenVariableSchema,
  tokenScalarSchema,
  tokenUnaryMinusSchema,
  tokenArithmeticOperatorSchema,
  tokenInequationOperatorSchema,
  tokenClosingBracketSchema,
  tokenOpeningBracketSchema,
]);
export type Token = z.infer<typeof tokenSchema>;
type TokenVariable = z.infer<typeof tokenVariableSchema>;
type TokenScalar = z.infer<typeof tokenScalarSchema>;
type TokenUnaryMinus = z.infer<typeof tokenUnaryMinusSchema>;
type TokenArithmeticOperator = z.infer<typeof tokenArithmeticOperatorSchema>;
type TokenInequationOperator = z.infer<typeof tokenInequationOperatorSchema>;
type TokenClosingBracket = z.infer<typeof tokenClosingBracketSchema>;
type TokenOpeningBracket = z.infer<typeof tokenOpeningBracketSchema>;

export function createTokenVariable(
  value: TokenVariable['value'],
): TokenVariable {
  return {
    type: 'variable',
    value,
  };
}
export function createTokenScalar(value: TokenScalar['value']): TokenScalar {
  return {
    type: 'scalar',
    value,
  };
}
export function createTokenUnaryMinus(): TokenUnaryMinus {
  return {
    type: 'unary-minus',
    value: 'unary-',
  };
}
export function createTokenArithmeticOperator(
  value: TokenArithmeticOperator['value'],
): TokenArithmeticOperator {
  return {
    type: 'arithmetic-operator',
    value,
  };
}
export function createTokenInequationOperator(
  value: TokenInequationOperator['value'],
): TokenInequationOperator {
  return {
    type: 'inequation-operator',
    value,
  };
}
export function createTokenClosingBracket(): TokenClosingBracket {
  return {
    type: 'closing-bracket',
    value: ')',
  };
}
export function createTokenOpeningBracket(): TokenOpeningBracket {
  return {
    type: 'opening-bracket',
    value: '(',
  };
}
