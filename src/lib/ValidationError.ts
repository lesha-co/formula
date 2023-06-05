import { PassResult, PassResultLeaf } from './passResult';
import { RuleErroneousSequence } from './rule';
import { Token, tokenToString } from './token';

export class Range {
  constructor(
    public readonly from: number,
    public readonly to: number,
    public readonly description: RuleErroneousSequence | string,
  ) {}

  public allIndexes(): number[] {
    const indexes: number[] = [];
    for (let index = this.from; index <= this.to; index++) {
      indexes.push(index);
    }
    return indexes;
  }
}

export abstract class ValidationErrorBase extends Error {}

export class ValidationErrorWithRanges extends ValidationErrorBase {
  constructor(
    public readonly tokens: readonly Token[],
    public readonly ranges: readonly Range[],
    public readonly sequence?: readonly PassResult[],
  ) {
    super('Expression is not valid');
  }
  public getIndexes(): number[] {
    return this.ranges.flatMap((range) => range.allIndexes());
  }
  public inRange(index: number) {
    return this.ranges.some(
      (range) => index >= range.from && index <= range.to,
    );
  }

  public toString() {
    return (
      this.makeSquigglyLines() +
      '\n' +
      this.ranges
        .map(
          (r) =>
            `Reason: ${r.description} \n  at ${
              r.from === r.to
                ? `position ${r.from}`
                : `positions ${r.from}-${r.to}`
            }`,
        )
        .join('\n')
    );
  }
  private makeSquigglyLines() {
    // error diagnostic
    const tokenStrings = this.tokens.map(tokenToString);

    let diagnosticsStrings: string[] = tokenStrings.map(
      (tokenString, index) => {
        return (this.inRange(index) ? '~' : ' ').repeat(tokenString.length);
      },
    );

    const s1 = tokenStrings.join('');
    const s2 = diagnosticsStrings.join('');

    return `${s1}\n${s2}`;
  }
}

export class ValidationErrorEmpty extends ValidationErrorBase {
  public toString() {
    return 'Empty input';
  }
}
export class ValidationErrorIncompleteFinalNode extends ValidationErrorBase {
  public toString() {
    return 'This is not a complete expression';
  }
}
