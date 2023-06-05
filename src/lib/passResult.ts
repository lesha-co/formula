import { Rule, RuleErroneousSequence } from './rule';
import { Token, tokenToString } from './token';

export abstract class PassResult {
  public abstract get indexFirst(): number;
  public abstract get indexLast(): number;
  public abstract toString(extended?: boolean): string;
  public abstract getTokensFlat(): Token[];
}

export class PassResultLeaf extends PassResult {
  public getTokensFlat(): Token[] {
    return [this.token];
  }
  public toString(extended?: boolean): string {
    return extended
      ? `[token: ${tokenToString(this.token)}]`
      : `${tokenToString(this.token)}`;
  }
  public get indexFirst(): number {
    return this.index;
  }
  public get indexLast(): number {
    return this.index;
  }

  constructor(public readonly token: Token, private readonly index: number) {
    super();
    this.index = index;
    this.token = token;
  }
}

export class PassResultNode extends PassResult {
  public getTokensFlat(): Token[] {
    return this.tokens.flatMap((t) => t.getTokensFlat());
  }
  public get indexFirst(): number {
    return this.tokens[0].indexFirst;
  }
  public get indexLast(): number {
    return this.tokens.at(-1)!.indexFirst;
  }

  public toString(extended?: boolean): string {
    return extended
      ? `[${this.matchingRule.name}: ${this.getTokensFlat()
          .map(tokenToString)
          .join()}]`
      : `${this.matchingRule.name}`;
  }
  constructor(
    public readonly matchingRule: Rule,
    public readonly tokens: readonly PassResult[],
  ) {
    if (tokens.length === 0) {
      throw new Error('Empty group of tokens');
    }
    super();
  }
}

export class PassResultNodeWithError extends PassResultNode {
  public toString(): string {
    return `[!${this.matchingRule.name}!]`;
  }
  constructor(
    public readonly matchingRule: RuleErroneousSequence,
    tokens: readonly PassResult[],
  ) {
    super(matchingRule, tokens);
  }
}
