/* eslint-disable import/prefer-default-export */
import { ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD, ENTERPRISE_OFFER_TYPE } from './constants';

export const offerHasBookingsLimit = offer => offer.maxDiscount !== null || offer.maxUserDiscount !== null;
export const offerHasEnrollmentsLimit = offer => offer.maxGlobalApplications !== null;

export const getOfferType = (offer) => {
  const hasBookingsLimit = offerHasBookingsLimit(offer);
  const hasEnrollmentsLimit = offerHasEnrollmentsLimit(offer);

  if (hasBookingsLimit && hasEnrollmentsLimit) {
    return ENTERPRISE_OFFER_TYPE.BOOKINGS_AND_ENROLLMENTS_LIMIT;
  }

  if (hasBookingsLimit) {
    return ENTERPRISE_OFFER_TYPE.BOOKINGS_LIMIT;
  }

  if (hasEnrollmentsLimit) {
    return ENTERPRISE_OFFER_TYPE.ENROLLMENTS_LIMIT;
  }

  return ENTERPRISE_OFFER_TYPE.NO_LIMIT;
};

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
    maxDiscount: offer.maxDiscount,
    maxGlobalApplications: offer.maxGlobalApplications,
    remainingBalance: offer.remainingBalance !== null
      ? parseFloat(offer.remainingBalance) : offer.remainingBalance,
    remainingBalanceForUser: offer.remainingBalanceForUser !== null
      ? parseFloat(offer.remainingBalanceForUser) : offer.remainingBalanceForUser,
  };

  // If the offer has no limits, set the following fields to Number.MAX_VALUE
  // so that we don't have to do null checks down the line when computing
  // applicability to a course
  if (offerType === ENTERPRISE_OFFER_TYPE.NO_LIMIT) {
    transformedOffer.maxDiscount = Number.MAX_VALUE;
    transformedOffer.remainingBalance = Number.MAX_VALUE;
    transformedOffer.maxGlobalApplications = Number.MAX_VALUE;
    transformedOffer.remainingBalanceForUser = Number.MAX_VALUE;
  }

  return {
    ...transformedOffer,
    isLowOnBalance: isOfferLowOnBalance(transformedOffer),
  };
};
