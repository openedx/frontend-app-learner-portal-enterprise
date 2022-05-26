import findCouponCodeRedemptionCount from '../utils';

describe('find coupon code redemption count function', () => {
  it('should not fail and return 0 if there are no remaining redemptions', () => {
    const couponCodes = [{ code: 'ARGLBLARGL', redemptionsRemaining: 0 }];
    expect(findCouponCodeRedemptionCount(couponCodes)).toEqual(0);
  });

  it('should return total sum of redemptions remaining when provided multiple codes', () => {
    const couponCodes = [
      { code: '3254XDF', redemptionsRemaining: 5 },
      { code: '89KJDRHNF', redemptionsRemaining: 7 },
      { code: 'LKJ3LJ38', redemptionsRemaining: 3 },
    ];
    expect(findCouponCodeRedemptionCount(couponCodes)).toEqual(15);
  });
});
