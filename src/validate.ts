import { zip } from 'lodash';
import {
  Grammar,
  PassResult,
  Rule,
  RuleEither,
  RuleOption,
  RuleSequence,
} from './primitives/grammar';
import { Token, tokenToString } from './primitives/token';
import { Type } from './primitives/tokenTypes';
import {
  passResultRuleMatch,
  passResultToken,
} from './primitives/constructors/passResultConstructors';
import { tok } from './primitives/constructors/tokenConstructors';
import { extractErrorRanges } from './extractErrorRanges';

/**
 * унарному минусу предшествует или начало строки или открывающаяся скобка
 * @param tokens Список токенов
 * @returns Список токенов, но с некоторыми переопределенными ARITHMETIC_OPERATOR на UNARY_MINUS
 */
function detectUnaryMinus(tokens: Token[]): Token[] {
  return tokens.map((token, index, array): Token => {
    if (token.type !== Type.ARITHMETIC_OPERATOR) return token;
    if (token.value !== '-') return token;
    if (index === 0) return tok.uminus();

    const prevToken = array[index - 1];
    if (prevToken.type === Type.OPENING_BRACKET) return tok.uminus();

    return token;
  });
}

function compare(item: PassResult, ruleOption: RuleOption): boolean {
  switch (item.type) {
    case 'rulematch': {
      switch (ruleOption.type) {
        case 'tokentype':
          return false;
        case 'rulematch':
          return item.matchingRule.name === ruleOption.referencedRuleName;
      }
    }
    case 'token': {
      switch (ruleOption.type) {
        case 'tokentype':
          return item.token.type === ruleOption.tokentype;
        case 'rulematch':
          return false;
      }
    }
  }
}

function findInEitherRule(item: PassResult, rule: RuleEither): boolean {
  for (const option of rule.options) {
    if (compare(item, option)) return true;
  }
  return false;
}
function findInSequence(items: PassResult[], rule: RuleSequence): boolean {
  if (items.length !== rule.options.length)
    throw new Error('mismatching lengths');
  const pairs = zip(items, rule.options);
  return pairs.every(([item, ruleOption]) => compare(item!, ruleOption!));
}

/**
 * @param sequence Список токенов или результатов группировки
 * @param rule поиск по правилу
 */
function find(sequence: PassResult[], rule: Rule): PassResult[] | null {
  switch (rule.mode) {
    case 'either': {
      let changed = false;
      const result = sequence.map((item): PassResult => {
        if (findInEitherRule(item, rule)) {
          changed = true;
          return passResultRuleMatch(rule, [item]);
        }
        return item;
      });
      if (!changed) {
        return null;
      }
      return result;
    }
    case 'sequence': {
      const ruleSeqLength = rule.options.length;
      // todo что если ruleSeqLength > seq.length
      // итерируемся по всем окнам
      for (let skip = 0; skip <= sequence.length - ruleSeqLength; skip++) {
        const sequenceElements = sequence.slice(skip, skip + ruleSeqLength);
        if (findInSequence(sequenceElements, rule)) {
          return [
            ...sequence.slice(0, skip),
            passResultRuleMatch(rule, sequenceElements),
            ...sequence.slice(skip + ruleSeqLength),
          ];
        }
      }
      return null;
    }
    default:
      throw new Error('invalid rule mode');
  }
}

function pass(sequence: PassResult[], grammar: Grammar): PassResult[] | null {
  for (const rule of grammar) {
    const result = find(sequence, rule);
    if (result) {
      return result;
    }
  }
  return null;
}
export function validate(tokens: Token[], grammar: Grammar): PassResult | null {
  const fixedTokens = detectUnaryMinus(tokens);
  let sequence: PassResult[] = fixedTokens.map((token, index) =>
    passResultToken(token, index),
  );
  // console.log(sequence.map(passResultToString).join(', '));
  while (true) {
    const result = pass(sequence, grammar);
    if (result === null) break;
    sequence = result;
    // console.log(sequence.map(passResultToString).join(', '));
  }

  if (sequence.length === 1) {
    return sequence[0];
  }

  const tokenStrings = tokens.map(tokenToString);
  const diagnostics = extractErrorRanges(sequence);
  let diagnosticsStrings: string[] = tokenStrings.map((tokenString, index) => {
    return (diagnostics.includes(index) ? '~' : ' ').repeat(tokenString.length);
  });

  const s1 = tokenStrings.join('');
  const s2 = diagnosticsStrings.join('');
  const s3 = sequence.map((x) => {
    if (x.type === 'rulematch') return x.matchingRule.name;
    return x.token.type;
  });

  console.log(`${s1}\n${s2}\n${s3}`);
  return null;
}
