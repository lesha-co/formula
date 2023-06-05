import {
  Range,
  ValidationErrorEmpty,
  ValidationErrorIncompleteFinalNode,
  ValidationErrorWithRanges,
} from './ValidationError';
import {
  PassResult,
  PassResultLeaf,
  PassResultNode,
  PassResultNodeWithError,
} from './passResult';
import {
  Rule,
  RuleEither,
  RuleErroneousSequence,
  RuleOption,
  RuleSequence,
} from './rule';
import { Token } from './token';
import { ValidationResult } from './validationResult';

export class Grammar {
  private rules: Rule[] = [];
  private preprocessors: ((t: Token[]) => Token[])[] = [];
  constructor(public readonly finalNodes: readonly string[]) {}

  public either(name: string, options: RuleOption[]) {
    this.rules.push(new RuleEither(name, options));
    return this;
  }
  public pass(preprocessor: (typeof this.preprocessors)[number]) {
    this.preprocessors.push(preprocessor);
    return this;
  }
  public sequence(name: string, options: RuleOption[]) {
    this.rules.push(new RuleSequence(name, options));
    return this;
  }
  public error(
    name: string,
    options: RuleOption[],
    description: string,
    errorIndexes?: number[],
  ) {
    this.rules.push(
      new RuleErroneousSequence(name, options, description, errorIndexes),
    );
    return this;
  }

  public validate(tokens: Token[]): ValidationResult {
    if (tokens.length === 0) {
      return {
        debugStrings: [],
        error: new ValidationErrorEmpty(),
        result: null,
      };
    }
    for (const preprocessor of this.preprocessors) {
      tokens = preprocessor(tokens);
    }
    let sequence: PassResult[] = this.createLeaves(tokens);
    const debugStrings = [sequence.map((tok) => tok.toString()).join(' ')];
    while (this.checkErrors(sequence).length == 0) {
      try {
        sequence = this.singlePass(sequence);
        debugStrings.push(sequence.map((tok) => tok.toString()).join(' '));
      } catch (x) {
        break;
      }
    }
    const errors = this.checkErrors(sequence);
    if (errors.length) {
      const er = new ValidationErrorWithRanges(
        tokens,
        errors.map((error) => {
          const indexes = error.matchingRule.errorIndexes;
          if (indexes) {
            const indexFirst = Math.min(...indexes);
            const indexLast = Math.max(...indexes);
            return new Range(
              error.tokens[indexFirst].indexFirst,
              error.tokens[indexLast].indexLast,
              error.matchingRule,
            );
          } else {
            return new Range(
              error.indexFirst,
              error.indexLast,
              error.matchingRule,
            );
          }
        }),
        sequence,
      );

      return {
        debugStrings,
        error: er,
        result: null,
      };
    }

    if (sequence.length === 1) {
      const result = sequence[0];
      if (
        !(result instanceof PassResultNode) ||
        !this.finalNodes.includes(result.matchingRule.name)
      ) {
        return {
          debugStrings,
          error: new ValidationErrorIncompleteFinalNode(),
          result: null,
        };
      }
      return {
        debugStrings,
        error: null,
        result,
      };
    }
    const ranges = sequence
      .filter(
        (token): token is PassResultLeaf => token instanceof PassResultLeaf,
      )
      .map(
        (leaf: PassResultLeaf) =>
          new Range(leaf.indexFirst, leaf.indexLast, "Couldn't parse"),
      );

    const er = new ValidationErrorWithRanges(tokens, ranges, sequence);
    return {
      debugStrings,
      error: er,
      result: null,
    };
  }

  /**
   * Пытается провести замену согласно правилам грамматики
   * Если ни одно правило не удовлетворяется, возвращает исходную
   * последовательность (можно проверить по ===)
   * @param sequence последовательность токенов
   * @param grammar грамматика
   * @returns результат первой трансформации или null, если правила не подходят
   */
  private singlePass(sequence: PassResult[]): PassResult[] {
    for (const rule of this.rules) {
      try {
        return rule.apply(sequence);
      } catch {}
    }
    throw new Error('no rules applied');
  }

  private checkErrors(seq: PassResult[]): PassResultNodeWithError[] {
    return seq.filter(
      (x): x is PassResultNodeWithError => x instanceof PassResultNodeWithError,
    );
  }

  private createLeaves(tokens: Token[]): PassResultLeaf[] {
    return tokens.map((token, index) => {
      return new PassResultLeaf(token, index);
    });
  }
}
