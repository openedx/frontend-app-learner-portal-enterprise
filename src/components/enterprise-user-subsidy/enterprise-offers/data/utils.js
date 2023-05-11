import {
  ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD_RATIO,
  ENTERPRISE_OFFER_LOW_BALANCE_USER_THRESHOLD_DOLLARS,
  ENTERPRISE_OFFER_NO_BALANCE_THRESHOLD_DOLLARS,
  ENTERPRISE_OFFER_NO_BALANCE_USER_THRESHOLD_DOLLARS,
  ENTERPRISE_OFFER_TYPE,
} from './constants';

export const offerHasBookingsLimit = offer => (
  // requires loose equality check to account for both null and undefined
  offer.maxDiscount != null || offer.maxUserDiscount != null
);
export const offerHasEnrollmentsLimit = offer => (
  // requires loose equality check to account for both null and undefined
  offer.maxGlobalApplications != null || offer.maxUserApplications != null
);

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
    // null is <= a positive integer. if maxUserDiscount is null, limit is not set, so we
    // would want to return false for this part of the check even if remainingBalanceForUser null
    const lowOfferUserDollarThreshold = offer.maxUserDiscount === null
      ? -1 : ENTERPRISE_OFFER_LOW_BALANCE_USER_THRESHOLD_DOLLARS;
    // same as above, that if maxDiscount is null, the limit is not set, so we
    // would want to return false if remainingBalance is null, but need to apply
    // the ratio to maxDiscount in this case
    const lowOfferDollarThreshold = offer.maxDiscount === null
      ? -1 : offer.maxDiscount * ENTERPRISE_OFFER_LOW_BALANCE_THRESHOLD_RATIO;

    return offer.remainingBalance <= lowOfferDollarThreshold
      || offer.remainingBalanceForUser <= lowOfferUserDollarThreshold;
  }

  return false;
};

export const isOfferOutOfBalance = (offer) => {
  if (offerHasBookingsLimit(offer)) {
    const outOfOfferUserDollarThreshold = offer.maxUserDiscount === null
      ? -1 : ENTERPRISE_OFFER_NO_BALANCE_USER_THRESHOLD_DOLLARS;
    const outOfOfferDollarThreshold = offer.maxDiscount === null
      ? -1 : ENTERPRISE_OFFER_NO_BALANCE_THRESHOLD_DOLLARS;

    return offer.remainingBalance <= outOfOfferDollarThreshold
      || offer.remainingBalanceForUser <= outOfOfferUserDollarThreshold;
  }

  return false;
};

export const transformEnterpriseOffer = (offer) => {
  const offerType = getOfferType(offer);

  const transformedOffer = {
    ...offer,
    offerType,
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
    transformedOffer.maxGlobalApplications = Number.MAX_VALUE;
    transformedOffer.maxUserDiscount = Number.MAX_VALUE;
    transformedOffer.maxUserApplications = Number.MAX_VALUE;
    transformedOffer.remainingApplications = Number.MAX_VALUE;
    transformedOffer.remainingBalance = Number.MAX_VALUE;
    transformedOffer.remainingBalanceForUser = Number.MAX_VALUE;
    transformedOffer.remainingApplicationsForUser = Number.MAX_VALUE;
    transformedOffer.remainingApplicationsForUser = Number.MAX_VALUE;
  }

  return {
    ...transformedOffer,
    isLowOnBalance: isOfferLowOnBalance(transformedOffer),
    isOutOfBalance: isOfferOutOfBalance(transformedOffer),
  };
};
