import React, {
  createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import {
  useCouponCodes,
  useSubscriptions,
} from './data/hooks';
import { useEnterpriseOffers } from './enterprise-offers/data/hooks';
import { LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig, authenticatedUser } = useContext(AppContext);

  // Subscriptions
  const {
    customerAgreementConfig,
    subscriptionPlan,
    subscriptionLicense,
    isLoading: isLoadingSubscriptions,
    showExpirationNotifications,
    activateUserLicense,
  } = useSubscriptions({ enterpriseConfig, authenticatedUser });

  // Coupon Codes
  const [couponCodes, isLoadingCouponCodes] = useCouponCodes(enterpriseConfig.uuid);

  // Enterprise Offers
  const {
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    isLoading: isLoadingEnterpriseOffers,
  } = useEnterpriseOffers({
    enterpriseId: enterpriseConfig.uuid,
    enableLearnerPortalOffers: enterpriseConfig.enableLearnerPortalOffers,
    customerAgreementConfig,
  });

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [
        isLoadingSubscriptions,
        isLoadingCouponCodes,
        isLoadingEnterpriseOffers,
      ];
      return loadingStates.includes(true);
    },
    [isLoadingSubscriptions, isLoadingCouponCodes, isLoadingEnterpriseOffers],
  );

  const contextValue = useMemo(
    () => {
      if (isLoadingSubsidies) {
        return {};
      }
      return {
        subscriptionLicense,
        subscriptionPlan,
        couponCodes,
        enterpriseOffers,
        canEnrollWithEnterpriseOffers,
        hasLowEnterpriseOffersBalance,
        hasNoEnterpriseOffersBalance,
        showExpirationNotifications,
        customerAgreementConfig,
        activateUserLicense,
      };
    },
    [
      isLoadingSubsidies,
      subscriptionLicense,
      subscriptionPlan,
      couponCodes,
      enterpriseOffers,
      canEnrollWithEnterpriseOffers,
      hasLowEnterpriseOffersBalance,
      hasNoEnterpriseOffersBalance,
      showExpirationNotifications,
      customerAgreementConfig,
      activateUserLicense,
    ],
  );

  if (isLoadingSubsidies) {
    return (
      <Container className="py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </Container>
    );
  }
  return (
    <>
      {/* Render the children so the rest of the page shows */}
      <UserSubsidyContext.Provider value={contextValue}>
        {children}
      </UserSubsidyContext.Provider>
    </>
  );
};

UserSubsidy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSubsidy;
