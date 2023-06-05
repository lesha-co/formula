import { describe, it } from 'node:test';
import assert from 'node:assert';
import { arithmeticExpression } from './arithmeticExpression';
import { compileFromTestString, diagnose } from './compile';
import { ValidationErrorWithRanges } from './ValidationError';

function run(input: string, outputDiagnostics?: boolean) {
  const vr = arithmeticExpression.validate(compileFromTestString(input));
  if (outputDiagnostics) {
    console.log(diagnose(vr));
  }
  return vr;
}

describe('Corner cases', () => {
  it('empty', () => {
    assert.notEqual(run('').error, null);
  });
});
describe('Correct expressions', () => {
  it('1+(1+(-1+1))', () => {
    assert.equal(run('1+(1+(-1+1))').error, null);
  });
  it('x', () => {
    assert.equal(run('x').error, null);
  });
  it('-1', () => {
    assert.equal(run('-1').error, null);
  });
  it('-1+x', () => {
    assert.equal(run('-1+x').error, null);
  });
  it('(-1)+(1)', () => {
    assert.equal(run('(-1)+(1)').error, null);
  });
});
describe('Incorrect expressions', () => {
  describe('Double things', () => {
    it('double variable', () => {
      assert.deepEqual(
        (run('xx').error as ValidationErrorWithRanges).getIndexes(),
        [1],
      );
    });
    it('variable,scalar', () => {
      assert.deepEqual(
        (run('x1').error as ValidationErrorWithRanges).getIndexes(),
        [1],
      );
    });
    it('double scalar', () => {
      assert.deepEqual(
        (run('11').error as ValidationErrorWithRanges).getIndexes(),
        [1],
      );
    });
    it('double operator', () => {
      assert.deepEqual(
        (run('-1++x').error as ValidationErrorWithRanges).getIndexes(),
        [2, 3],
      );
    });
    it('Two sets of double operators', () => {
      assert.deepEqual(
        (run('-1+-1+(-1+-1)').error as ValidationErrorWithRanges).getIndexes(),
        [2, 3, 9, 10],
      );
    });
  });
  describe('Bracket issues', () => {
    it('Empty brackets', () => {
      assert.deepEqual(
        (run('1+()+1').error as ValidationErrorWithRanges).getIndexes(),
        [2, 3],
      );
    });
    it('Unclosed bracket', () => {
      assert.deepEqual(
        (run('1+(1').error as ValidationErrorWithRanges).getIndexes(),
        [2],
      );
    });
    it('Extra closing bracket', () => {
      assert.deepEqual(
        (run('1+(1+x))+1').error as ValidationErrorWithRanges).getIndexes(),
        [7],
      );
    });
    it('Extra closing bracket', () => {
      assert.deepEqual(
        (
          run('1+(1+(-1+1)))+1+(1+1)').error as ValidationErrorWithRanges
        ).getIndexes(),
        [12],
      );
    });
  });

  it('(1+)', () => {
    assert.deepEqual(
      (run('(1+)').error as ValidationErrorWithRanges).getIndexes(),
      [2],
    );
  });
});
describe('Correct inequalities', () => {
  it('x>1', () => {
    assert.equal(run('x>1').error, null);
  });
  it('x<-1', () => {
    assert.equal(run('x<-1').error, null);
  });
  it('x>1+1', () => {
    assert.equal(run('x>1+1').error, null);
  });
});
describe('Incorrect inequalities', () => {
  it('x>1<1', () => {
    assert.deepEqual(
      (run('x>1<1').error as ValidationErrorWithRanges).getIndexes(),
      [3],
    );
  });
  it('xx<1', () => {
    assert.deepEqual(
      (run('xx<1').error as ValidationErrorWithRanges).getIndexes(),
      [1],
    );
  });
  it('1>xx', () => {
    assert.deepEqual(
      (run('1>xx').error as ValidationErrorWithRanges).getIndexes(),
      [3],
    );
  });
  it('(x<1)', () => {
    assert.deepEqual(
      (run('(x<1)').error as ValidationErrorWithRanges).getIndexes(),
      [0, 4],
    );
  });
  it('(x(<1)', () => {
    // this is garbage input
    // doesn't really matter whar error it will come up with
    // as long as there is one
    assert.notEqual(run('(x(<1)').error, null);
  });
  it('x<', () => {
    assert.deepEqual(
      (run('x<').error as ValidationErrorWithRanges).getIndexes(),
      [1],
    );
  });
});
