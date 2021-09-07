import moment from 'moment';
import {
  isDefinedAndNotNull,
  createArrayFromValue,
  isDefinedAndNull,
  hasTruthyValue,
  hasValidStartExpirationDates,
  fixedEncodeURIComponent,
} from '../common';

function assertTestCaseEquals(testCase, expectedValue) {
  const result = createArrayFromValue(testCase);
  expect(result).toEqual(expectedValue);
}

describe('fixedEncodeURIComponent', () => {
  it('returns correctly encoded string', () => {
    const str = 'Python Programming Language';
    const expected = 'Python%20Programming%20Language';
    const result = fixedEncodeURIComponent(str);
    expect(result).toEqual(expected);
  });

  it('returns encoded string for characters that are not supported by encodeURIComponent', () => {
    const str = 'Python (Programming Language)';
    const expected = 'Python%20%28Programming%20Language%29';
    const result = fixedEncodeURIComponent(str);
    expect(result).toEqual(expected);
  });
});

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

const now = moment();
const validStartDate = moment(now).subtract(5, 'days');
const validEndDate = moment(now).add(5, 'days');
const validExpirationDate = moment(now).add(6, 'days');
const invalidStartDate = moment(now).add(1, 'days');
const invalidEndDate = moment(now).subtract(1, 'days');
const invalidExpirationDate = moment(now).subtract(2, 'days');

describe('hasValidStartExpirationDates', () => {
  it('returns true when now is between startDate and endDate', () => {
    const validStartEnd = {
      startDate: validStartDate,
      endDate: validEndDate,
    };
    const result = hasValidStartExpirationDates(validStartEnd);
    expect(result).toBeTruthy();
  });

  it('returns true when now is between startDate and expirationDate', () => {
    const validStartExp = {
      startDate: validStartDate,
      expirationDate: validExpirationDate,
    };
    const result = hasValidStartExpirationDates(validStartExp);
    expect(result).toBeTruthy();
  });

  it('returns false when startDate is invalid', () => {
    const invalidStart = {
      startDate: invalidStartDate,
      endDate: validEndDate,
    };
    const result = hasValidStartExpirationDates(invalidStart);
    expect(result).toBeFalsy();
  });

  it('returns false when endDate is invalid', () => {
    const invalidEnd = {
      startDate: validStartDate,
      endDate: invalidEndDate,
    };
    const result = hasValidStartExpirationDates(invalidEnd);
    expect(result).toBeFalsy();
  });

  it('returns false when expirationDate is invalid', () => {
    const invalidExp = {
      startDate: validStartDate,
      expirationDate: invalidExpirationDate,
    };
    const result = hasValidStartExpirationDates(invalidExp);
    expect(result).toBeFalsy();
  });
});
