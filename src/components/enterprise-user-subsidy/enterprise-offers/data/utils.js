/* eslint-disable import/prefer-default-export */
import { ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD, ENTERPRISE_OFFER_TYPE } from './constants';

export const getOfferType = (offer) => {
  if (offer.maxDiscount !== null && offer.maxGlobalApplications !== null) {
    return ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT;
  }

  if (offer.maxDiscount !== null) {
    return ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT;
  }

  if (offer.maxGlobalApplications !== null) {
    return ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT;
  }

  return ENTERPRISE_OFFER_TYPE.NO_LIMIT;
};

export const offerHasBookingsLimit = (offer) => [
  ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT,
  ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT,
].includes(offer.offerType);

export const isOfferLowOnBalance = (offer) => {
  if (offerHasBookingsLimit(offer)) {
    return offer.remainingBalance <= ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD;
  }

  return false;
};

export const transformEnterpriseOffer = (offer) => {
  const offerType = getOfferType(offer);

  const transformedOffer = {
    ...offer,
    offerType,
    // Null equates to no limit for these values, use Number.MAX_VALUE so we don't
    // have to do null checks in multiple places
    maxDiscount: offerType === ENTERPRISE_OFFER_TYPE.NO_LIMIT
      ? Number.MAX_VALUE : offer.maxDiscount,
    remainingBalance: offerType === ENTERPRISE_OFFER_TYPE.NO_LIMIT
      ? Number.MAX_VALUE : offer.remainingBalance,
    maxGlobalApplications: offerType === ENTERPRISE_OFFER_TYPE.NO_LIMIT
      ? Number.MAX_VALUE : offer.maxGlobalApplications,
  };

  return {
    ...transformedOffer,
    isLowOnBalance: isOfferLowOnBalance(transformedOffer),
  };
};
