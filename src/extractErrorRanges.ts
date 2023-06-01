import { PassResult, prIsToken } from './primitives/grammar';

export function extractErrorRanges(passResults: PassResult[]): number[] {
  return passResults.filter(prIsToken).map((x) => x.originalIndex);
}
