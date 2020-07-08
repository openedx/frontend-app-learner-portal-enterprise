import {
  isDefinedAndNotNull,
  createArrayFromValue,
  isDefinedAndNull,
  hasTruthyValue,
} from '../common';

function assertTestCaseEquals(testCase, expectedValue) {
  const result = createArrayFromValue(testCase);
  expect(result).toEqual(expectedValue);
}

describe('createArrayFromValue', () => {
  it('handles array value', () => {
    const testCase = [null, null];
    assertTestCaseEquals(testCase, testCase);
  });

  it('handles other values', () => {
    let testCase = 2;
    assertTestCaseEquals(testCase, [testCase]);

    testCase = { test: 'key' };
    assertTestCaseEquals(testCase, [testCase]);

    testCase = 2;
    assertTestCaseEquals(testCase, [testCase]);

    testCase = undefined;
    assertTestCaseEquals(testCase, [testCase]);
  });
});

describe('isDefinedAndNotNull', () => {
  it('returns false when passed a null', () => {
    const result = isDefinedAndNotNull(null);
    expect(result).toBeFalsy();
  });

  it('returns false when passed an array of nulls', () => {
    const result = isDefinedAndNotNull([null, null]);
    expect(result).toBeFalsy();
  });

  it('returns false when passed an array with 1 null', () => {
    const result = isDefinedAndNotNull(['test', null]);
    expect(result).toBeFalsy();
  });

  it('returns true when passed an array with no nulls', () => {
    const result = isDefinedAndNotNull(['test', 1]);
    expect(result).toBeTruthy();
  });
});

describe('isDefinedAndNull', () => {
  it('returns true when passed a null', () => {
    const result = isDefinedAndNull(null);
    expect(result).toBeTruthy();
  });

  it('returns true when passed an array of nulls', () => {
    const result = isDefinedAndNull([null, null]);
    expect(result).toBeTruthy();
  });

  it('returns false when passed an array with 1 null', () => {
    const result = isDefinedAndNull(['test', null]);
    expect(result).toBeFalsy();
  });

  it('returns false when passed an array with no nulls', () => {
    const result = isDefinedAndNull(['test', 1]);
    expect(result).toBeFalsy();
  });
});

describe('hasTruthyValue', () => {
  it('returns true when passed a non-empty string', () => {
    const result = hasTruthyValue('test');
    expect(result).toBeTruthy();
  });

  it('returns true when passed an array with no nulls', () => {
    const result = hasTruthyValue(['test', 1]);
    expect(result).toBeTruthy();
  });

  it('returns false when passed an array with 1 null', () => {
    const result = hasTruthyValue(['test', null]);
    expect(result).toBeFalsy();
  });

  it('returns false when passed an array with 1 empty string', () => {
    const result = hasTruthyValue(['']);
    expect(result).toBeFalsy();
  });
});
