export default function findCouponCodeRedemptionCount(couponCodes) {
  let totalRedemptionsRemaining = 0;
  couponCodes.forEach((couponCode) => {
    totalRedemptionsRemaining += couponCode.redemptionsRemaining;
  });

  return totalRedemptionsRemaining;
}
