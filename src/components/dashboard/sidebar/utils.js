export const getOfferExpiringFirst = (offers) => offers?.filter(offer => offer.isCurrent)
  .sort((a, b) => new Date(a.endDatetime) - new Date(b.endDatetime))[0];

export const getPolicyExpiringFirst = (policies) => {
  if (!policies) {
    return undefined;
  }
  return policies
    .filter(policy => policy.active)
    .sort((a, b) => new Date(a.subsidyExpirationDate) - new Date(b.subsidyExpirationDate))[0];
};
