import {
  PassResult,
  PassResultRuleMatch,
  PassResultToken,
  Rule,
} from '../grammar';
import { Token } from '../token';

/**
 * internal
 */
function getIndexFrom(pr: PassResult) {
  if (pr.type === 'rulematch') {
    return pr.indexFirst;
  }
  return pr.originalIndex;
}
function getIndexTo(pr: PassResult) {
  if (pr.type === 'rulematch') {
    return pr.indexLast;
  }
  return pr.originalIndex;
}
export const passResultRuleMatch = (
  matchingRule: Rule,
  tokens: PassResult[],
): PassResultRuleMatch => {
  if (tokens.length === 0) throw new Error('tokens list is empty');
  return {
    matchingRule,
    tokens,
    type: 'rulematch',
    indexFirst: getIndexFrom(tokens[0]),
    indexLast: getIndexTo(tokens.at(-1)!),
  };
};
export const passResultToken = (
  token: Token,
  originalIndex: number,
): PassResultToken => ({
  type: 'token',
  token,
  originalIndex,
});
