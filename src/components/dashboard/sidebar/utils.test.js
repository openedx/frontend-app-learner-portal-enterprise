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
    { policies: undefined },
    { policies: [] },
  ])('returns undefined if no policies', ({ policies }) => {
    expect(getPolicyExpiringFirst(policies)).toBeUndefined();
  });

  it('returns undefined if no current policies', () => {
    const policies = [{ active: false }];
    expect(getPolicyExpiringFirst(policies)).toBeUndefined();
  });

  it('returns policy expiring first', () => {
    const policies = [{
      subsidyExpirationDate: '2022-01-01T00:00:00Z',
      active: true,
    }, {
      subsidyExpirationDate: '2021-01-01T00:00:00Z',
      active: true,
    }, {
      subsidyExpirationDate: '2020-01-01T00:00:00Z',
      active: false,
    }];
    expect(getPolicyExpiringFirst(policies)).toEqual(policies[1]);
  });
});
