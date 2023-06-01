import _ from 'lodash';

export enum ExpressionType {
  // a + b < 4
  Inequation,
  // a + b
  Expression,
}

/**
 * Проверка на флоат целиком
 * Будет использоваться при проверке перед отправкой на сервер
 */
const FLOAT_STRICT_REGEX_CORE = '-?[0-9]*\\.?[0-9]+';

export const floatStrictRegex = new RegExp(`^${FLOAT_STRICT_REGEX_CORE}$`, 'i');
