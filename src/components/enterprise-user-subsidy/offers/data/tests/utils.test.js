import findOfferRedemptionCount from '../utils';

describe('find offer redemption count function', () => {
  it('should not fail and return 0 if there are no remaining redemptions', () => {
    const offers = [{ code: 'ARGLBLARGL', redemptionsRemaining: 0 }];
    expect(findOfferRedemptionCount(offers)).toEqual(0);
  });

  it('should return total sum of redemptions remaining when provided multiple codes', () => {
    const offers = [
      { code: '3254XDF', redemptionsRemaining: 5 },
      { code: '89KJDRHNF', redemptionsRemaining: 7 },
      { code: 'LKJ3LJ38', redemptionsRemaining: 3 },
    ];
    expect(findOfferRedemptionCount(offers)).toEqual(15);
  });
});
