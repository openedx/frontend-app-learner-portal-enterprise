export const getOfferExpiringFirst = (offers) => {
  if (!offers) {
    return undefined;
  }
  return offers
    .filter(offer => offer.isCurrent)
    .sort((a, b) => new Date(a.endDatetime) - new Date(b.endDatetime))[0];
};

export const getPolicyExpiringFirst = ({ expiredPolicies, unexpiredPolicies }) => {
  if (!expiredPolicies || !unexpiredPolicies) {
    return undefined;
  }
  const hasUnexpiredPolicies = unexpiredPolicies.length > 0;
  if (hasUnexpiredPolicies) {
    return unexpiredPolicies.sort((a, b) => new Date(a.subsidyExpirationDate) - new Date(b.subsidyExpirationDate))[0];
  }
  return expiredPolicies.sort((a, b) => new Date(b.subsidyExpirationDate) - new Date(a.subsidyExpirationDate))[0];
};
