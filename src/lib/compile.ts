import { Token, fromString } from './token';
import { ValidationResult } from './validationResult';

export function compileFromTestString(s: string): Token[] {
  const arr = Array.from(s);
  return arr.map((character) => {
    const t = fromString(character, ['x']);
    if (t !== null) return t;
    throw new Error();
  });
}

export function diagnose(vr: ValidationResult): string {
  const parsingSteps =
    'Parsing steps:' +
    '\n' +
    vr.debugStrings.map((x, i) => `${i}: ${x}`).join('\n') +
    '\n';
  const errorInterpretation = vr.error
    ? '\n=== Error interpretation === \n' + vr.error.toString()
    : '\n=== Success === \n' +
      `The input is recognised as: ` +
      `${vr.result?.toString(false)}`;
  return parsingSteps + errorInterpretation;
}
