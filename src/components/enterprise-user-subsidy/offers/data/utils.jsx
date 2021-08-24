export default function findOfferRedemptionCount(offers) {
  let totalRedemptionsRemaining = 0;
  offers.forEach((offer) => {
    totalRedemptionsRemaining += offer.redemptionsRemaining;
  });

  return totalRedemptionsRemaining;
}
