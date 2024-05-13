import dayjs from 'dayjs';

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
    return [...unexpiredPolicies].sort((a, b) => (
      dayjs(a.subsidyExpirationDate).isAfter(dayjs(b.subsidyExpirationDate)) ? 1 : -1))[0];
  }
  return [...expiredPolicies].sort((a, b) => (
    dayjs(b.subsidyExpirationDate).isAfter(dayjs(a.subsidyExpirationDate)) ? 1 : -1))[0];
};
