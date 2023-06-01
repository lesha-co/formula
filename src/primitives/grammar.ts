import { Token } from './token';
import { Type } from './tokenTypes';

/**
 * Грамматика представляет собой набор правил
 */
export type Grammar = Rule[];

/**
 * Правило представляет собой или последовательность или выбор из вариантов (RuleOption)
 */
export type Rule = RuleEither | RuleSequence | RuleErroneousSequence;
export type RuleEither = {
  name: string;
  mode: 'either';
  options: RuleOption[];
};
export type RuleSequence = {
  name: string;
  mode: 'sequence';
  options: RuleOption[];
};
export type RuleErroneousSequence = {
  name: string;
  mode: 'erroneous-sequence';
  options: RuleOption[];
};

/**
 * RuleOption — "токен высшего уровня", сущность, которую мы ищем, когда пытаемся сопоставить с правилом
 * Это может быть:
 * - сущность вида "токен определенного типа"
 * - сущность вида "группа токенов, объединенная по определенному правилу"
 */
export type RuleOption = TokenRuleOption | RuleMatchRuleOption;
type TokenRuleOption = { type: 'tokentype'; tokentype: Type };
type RuleMatchRuleOption = { type: 'rulematch'; referencedRuleName: string };

/**
 * PassResult - промежуточный
 * is a structure that
 */

export type PassResultRuleMatch = {
  type: 'rulematch';
  matchingRule: Rule;
  tokens: PassResult[];
  indexFirst: number;
  indexLast: number;
};
export type PassResultToken = {
  type: 'token';
  token: Token;
  originalIndex: number;
};
export function prIsToken(pr: PassResult): pr is PassResultToken {
  return pr.type === 'token';
}
export type PassResult = PassResultRuleMatch | PassResultToken;
