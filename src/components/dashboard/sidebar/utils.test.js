import dayjs from 'dayjs';
import { getOfferExpiringFirst, getPolicyExpiringFirst } from './utils';

describe('getOfferExpiringFirst', () => {
  it.each([
    { offers: undefined },
    { offers: [] },
  ])('returns undefined if no offers', ({ offers }) => {
    expect(getOfferExpiringFirst(offers)).toBeUndefined();
  });

  it('returns undefined if no current offers', () => {
    const offers = [{ isCurrent: false }];
    expect(getOfferExpiringFirst(offers)).toBeUndefined();
  });

  it('returns current, offer expiring first', () => {
    const offers = [{
      endDatetime: '2022-01-01T00:00:00Z',
      isCurrent: true,
    }, {
      endDatetime: '2021-01-01T00:00:00Z',
      isCurrent: true,
    }, {
      endDatetime: '2020-01-01T00:00:00Z',
      isCurrent: false,
    }];
    expect(getOfferExpiringFirst(offers)).toEqual(offers[1]);
  });
});

describe('getPolicyExpiringFirst', () => {
  it.each([
    {
      policies: {
        expiredPolicies: [],
        unexpiredPolicies: [],
      },
    },
    {
      policies: {
        expiredPolicies: undefined,
        unexpiredPolicies: undefined,
      },
    },
  ])('returns undefined if no policies', ({ policies }) => {
    expect(getPolicyExpiringFirst(policies)).toBeUndefined();
  });
  it('returns policy expiring first', () => {
    const policies = {
      expiredPolicies: [{
        subsidyExpirationDate: dayjs().subtract(1, 'days').toISOString(),
        active: false,
      }, {
        subsidyExpirationDate: dayjs().subtract(30, 'days').toISOString(),
        active: false,
      }, {
        subsidyExpirationDate: dayjs().subtract(70, 'days').toISOString(),
        active: false,
      }],
      unexpiredPolicies: [{
        subsidyExpirationDate: dayjs().add(3, 'days').toISOString(),
        active: true,
      }, {
        subsidyExpirationDate: dayjs().add(1, 'days').toISOString(),
        active: true,
      }, {
        subsidyExpirationDate: dayjs().add(24, 'days').toISOString(),
        active: true,
      }],
    };
    const expectedOutput = {
      subsidyExpirationDate: dayjs().add(1, 'days').toISOString(),
      active: true,
    };
    expect(getPolicyExpiringFirst(policies)).toEqual(expectedOutput);
  });
});
