import { Rule, RuleOption } from '../grammar';
import { Type } from '../tokenTypes';

/**
 * creating grammar
 */
export const ref = (ref: string): RuleOption => ({
  referencedRuleName: ref,
  type: 'rulematch',
});
export const type = (type: Type): RuleOption => ({
  tokentype: type,
  type: 'tokentype',
});

export function either(name: string, options: RuleOption[]): Rule {
  return {
    name,
    mode: 'either',
    options,
  };
}
export function sequence(name: string, options: RuleOption[]): Rule {
  return {
    name,
    mode: 'sequence',
    options,
  };
}
export function error(name: string, options: RuleOption[]): Rule {
  return {
    name,
    mode: 'erroneous-sequence',
    options,
  };
}
