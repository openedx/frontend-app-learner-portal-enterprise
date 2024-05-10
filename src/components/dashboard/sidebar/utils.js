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
  let policiesToConsiderForExpirationMessaging = expiredPolicies;
  const hasUnexpiredPolicies = unexpiredPolicies.length > 0;
  const hasExpiredPolicies = unexpiredPolicies.length > 0;
  if (hasUnexpiredPolicies && hasExpiredPolicies) {
    policiesToConsiderForExpirationMessaging = unexpiredPolicies;
  }
  return policiesToConsiderForExpirationMessaging
    .sort((a, b) => new Date(a.subsidyExpirationDate) - new Date(b.subsidyExpirationDate))[0];
};
