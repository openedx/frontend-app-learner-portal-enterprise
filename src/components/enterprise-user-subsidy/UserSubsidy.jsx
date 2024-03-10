import React, {
  createContext, useContext, useMemo,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@openedx/paragon';

import { LoadingSpinner } from '../loading-spinner';
import {
  useCouponCodes,
  useSubscriptions,
  useRedeemableLearnerCreditPolicies,
} from './data/hooks';
import { useEnterpriseOffers } from './enterprise-offers/data/hooks';
import { LOADING_SCREEN_READER_TEXT } from './data/constants';
import { useEnterpriseCustomer } from '../app/data';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { authenticatedUser } = useContext(AppContext);
  const { userId } = authenticatedUser;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();

  // Subscriptions
  const {
    customerAgreementConfig,
    subscriptionPlan,
    subscriptionLicense,
    isLoading: isLoadingSubscriptions,
    showExpirationNotifications,
  } = useSubscriptions({ enterpriseCustomer, authenticatedUser });
  // Subsidy Access Policies
  const {
    data: redeemableLearnerCreditPolicies,
    isLoading: isLoadingRedeemablePolicies,
  } = useRedeemableLearnerCreditPolicies(enterpriseCustomer.uuid, userId);

  // Coupon Codes
  const [couponCodes, isLoadingCouponCodes] = useCouponCodes(enterpriseCustomer.uuid);

  // Enterprise Offers
  const {
    enterpriseOffers,
    currentEnterpriseOffers,
    hasCurrentEnterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    isLoading: isLoadingEnterpriseOffers,
  } = useEnterpriseOffers({
    enterpriseId: enterpriseCustomer.uuid,
    enableLearnerPortalOffers: enterpriseCustomer.enableLearnerPortalOffers,
    customerAgreementConfig,
  });

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [
        isLoadingSubscriptions,
        isLoadingCouponCodes,
        isLoadingEnterpriseOffers,
        isLoadingRedeemablePolicies,
      ];
      return loadingStates.includes(true);
    },
    [isLoadingSubscriptions, isLoadingCouponCodes, isLoadingEnterpriseOffers, isLoadingRedeemablePolicies],
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
        currentEnterpriseOffers,
        hasCurrentEnterpriseOffers,
        canEnrollWithEnterpriseOffers,
        hasLowEnterpriseOffersBalance,
        hasNoEnterpriseOffersBalance,
        showExpirationNotifications,
        customerAgreementConfig,
        redeemableLearnerCreditPolicies,
      };
    },
    [
      isLoadingSubsidies,
      subscriptionLicense,
      subscriptionPlan,
      couponCodes,
      enterpriseOffers,
      currentEnterpriseOffers,
      hasCurrentEnterpriseOffers,
      canEnrollWithEnterpriseOffers,
      hasLowEnterpriseOffersBalance,
      hasNoEnterpriseOffersBalance,
      showExpirationNotifications,
      customerAgreementConfig,
      redeemableLearnerCreditPolicies,
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
