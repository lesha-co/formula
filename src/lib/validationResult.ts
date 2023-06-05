import { ValidationErrorBase } from './ValidationError';
import { PassResult } from './passResult';

export type ValidationResult = {
  result: PassResult | null;
  error: ValidationErrorBase | null;
  debugStrings: string[];
};
