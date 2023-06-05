import {
  PassResult,
  PassResultLeaf,
  PassResultNode,
  PassResultNodeWithError,
} from './passResult';
import { Token } from './token';

export type RuleOption = string | { _type: Token['type'] };

function compare(item: PassResult, rule: RuleOption): boolean {
  if (typeof rule == 'string') {
    if (item instanceof PassResultNode) {
      return item.matchingRule.name === rule;
    }
    return false;
  }

  if (item instanceof PassResultLeaf) {
    return item.token.type === rule._type;
  }

  return false;
}

/**
 * Правило грамматики
 */
export abstract class Rule {
  constructor(public readonly name: string) {}
  public abstract toString(): string;
  /**
   * В случае успешного применения правила создается PassResultNode,
   * ассоциированный с этим правилом и последовательностью токенов,
   * удовлетворяющих ему
   * @param sequence
   */
  protected abstract createPassResult(sequence: PassResult[]): PassResultNode;
  /**
   * Пытается применить правило к входящей последовательности токенов
   * В случае успеха возвращает новую последовательность, иначе throw
   * @param sequence
   */
  public abstract apply(sequence: PassResult[]): PassResult[];
}

export class RuleEither extends Rule {
  protected createPassResult(sequence: PassResult[]): PassResultNode {
    return new PassResultNode(this, sequence);
  }
  constructor(
    public readonly name: string,
    public readonly options: readonly RuleOption[],
  ) {
    super(name);
  }

  public apply(sequence: PassResult[]) {
    let changed = false;
    const result = sequence.map((item): PassResult => {
      if (this.match(item)) {
        changed = true;
        return this.createPassResult([item]);
      }
      return item;
    });
    if (!changed) {
      throw new Error('Rule not applicable here');
    }
    return result;
  }

  public match(item: PassResult): boolean {
    for (const option of this.options) {
      if (compare(item, option)) return true;
    }
    return false;
  }

  public toString(): string {
    return `either of [${this.options.map((o) => o.toString()).join(', ')}]`;
  }
}
export class RuleSequence extends Rule {
  protected createPassResult(sequence: PassResult[]): PassResultNode {
    return new PassResultNode(this, sequence);
  }
  public apply(sequence: PassResult[]): PassResult[] {
    const windowLength = this.options.length;
    const lastStartingIndex = sequence.length - windowLength;
    // // todo что если ruleSeqLength > seq.length
    // // итерируемся по всем окнам
    // for (let skip = 0; skip <= sequence.length - windowLength; skip++) {
    //   const sequenceElements = sequence.slice(skip, skip + windowLength);
    //   if (this.match(sequenceElements)) {
    //     return [
    //       ...sequence.slice(0, skip),
    //       this.createPassResult(sequenceElements),
    //       ...sequence.slice(skip + windowLength),
    //     ];
    //   }
    // }
    const newSequence: PassResult[] = [];
    let skip = 0;
    let changed = false;
    while (skip <= lastStartingIndex) {
      const window = sequence.slice(skip, skip + windowLength);
      if (this.match(window)) {
        newSequence.push(this.createPassResult(window));
        skip += windowLength;
        changed = true;
      } else {
        newSequence.push(sequence[skip]);
        skip++;
      }
    }
    if (changed) {
      newSequence.push(...sequence.slice(skip));
      return newSequence;
    }
    throw new Error('Rule not applicable here');
  }
  constructor(
    public readonly name: string,
    public readonly options: readonly RuleOption[],
  ) {
    super(name);
  }

  public toString(): string {
    return `sequence of [${this.options.map((o) => o.toString()).join(', ')}]`;
  }
  private match(items: PassResult[]): boolean {
    if (items.length !== this.options.length)
      throw new Error('mismatching lengths');

    let compareResult = true;
    for (let index = 0; index < items.length; index++) {
      compareResult &&= compare(items[index], this.options[index]);
    }
    return compareResult;
  }
}
export class RuleErroneousSequence extends RuleSequence {
  protected createPassResult(sequence: PassResult[]): PassResultNode {
    return new PassResultNodeWithError(this, sequence);
  }
  public toString(): string {
    return this.description;
  }
  constructor(
    name: string,
    options: RuleOption[],
    public readonly description: string,
    public readonly errorIndexes?: readonly number[],
  ) {
    super(name, options);
  }
}
