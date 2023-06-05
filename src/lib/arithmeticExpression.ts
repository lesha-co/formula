import { Grammar } from './grammar';
import { Token, createTokenUnaryMinus } from './token';
const t = (str: Token['type']) => {
  return { _type: str };
};

/**
 * В списке токенов исправляет TokenArithmeticOperator('-') на TokenUnaryMinus()
 * там, где это применимо: унарному минусу предшествует или начало строки или
 * открывающаяся скобка
 * @param tokens Список токенов
 * @returns Список токенов, но с некоторыми переопределенными ARITHMETIC_OPERATOR на UNARY_MINUS
 */
function fixUnaryMinus(tokens: Token[]): Token[] {
  return tokens.map((token, index, array): Token => {
    // нас интересуют только токены-минусы
    if (!(token.type === 'arithmetic-operator')) return token;
    if (token.value !== '-') return token;
    // которые не стоят на последнем месте(мы смотрим вперед на 1 токен)
    if (index === array.length - 1) return token;

    // если минус первый в строке, то он унарный
    if (index === 0) return createTokenUnaryMinus();

    const prevToken = array[index - 1];
    const nextToken = array[index + 1];
    if (
      // унарный минус может стоять только после (
      prevToken.type === 'opening-bracket' ||
      // или после  > < =
      prevToken.type === 'inequation-operator' ||
      // или после * /, перед цифрой или переменной

      (prevToken.type === 'arithmetic-operator' &&
        (prevToken.value === '*' || prevToken.value === '/') &&
        (nextToken.type === 'variable' || nextToken.type === 'scalar'))
    )
      return createTokenUnaryMinus();

    return token;
  });
}

export const arithmeticExpression = new Grammar(['expr', 'statement'])
  .pass(fixUnaryMinus)
  .either('expr', [t('scalar'), t('variable')])
  .error('two-expressions', ['expr', 'expr'], 'Expected an operator', [1])
  .sequence('expr', [t('unary-minus'), 'expr'])
  .sequence('expr', ['expr', t('arithmetic-operator'), 'expr'])
  .sequence('expr', [t('opening-bracket'), 'expr', t('closing-bracket')])
  .sequence('statement', ['expr', t('inequation-operator'), 'expr'])
  .error(
    'two-operators',
    [t('arithmetic-operator'), t('arithmetic-operator')],
    'Two operators',
  )
  .error(
    'extra-operator',
    [
      t('opening-bracket'),
      'expr',
      t('arithmetic-operator'),
      t('closing-bracket'),
    ],
    'Extra operator after expression',
    [2],
  )
  .error(
    'extra-closed-bracket',
    ['expr', t('closing-bracket')],
    'Extra closed bracket',
    [1],
  )
  .error(
    'empty-brackets',
    [t('opening-bracket'), t('closing-bracket')],
    'Empty brackets',
  )
  .error(
    'unclosed-bracket',
    [t('opening-bracket'), 'expr'],
    'No matching bracket for opening bracket',
    [0],
  );
