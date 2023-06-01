import {
  either,
  ref,
  sequence,
  type,
} from './primitives/constructors/grammarConstructors';
import { Grammar } from './primitives/grammar';
import { Type } from './primitives/tokenTypes';

export const grammar: Grammar = [
  either('term', [type(Type.SCALAR), type(Type.VARIABLE)]),
  sequence('term', [type(Type.UNARY_MINUS), ref('term')]),
  sequence('term', [ref('term'), type(Type.ARITHMETIC_OPERATOR), ref('term')]),
  sequence('term', [
    type(Type.OPENING_BRACKET),
    ref('term'),
    type(Type.CLOSING_BRACKET),
  ]),
  sequence('inequality', [
    ref('term'),
    type(Type.INEQUATION_OPERATOR),
    ref('term'),
  ]),
];
