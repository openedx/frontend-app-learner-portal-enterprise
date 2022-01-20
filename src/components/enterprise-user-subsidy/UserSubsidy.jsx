import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import {
  useSubscriptionLicense,
  useOffers,
  useCustomerAgreementData,
} from './data/hooks';
import { LOADING_SCREEN_READER_TEXT, LICENSE_STATUS } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [customerAgreementConfig, isLoadingCustomerAgreementConfig] = useCustomerAgreementData(enterpriseConfig.uuid);
  const [subscriptionLicense, isLoadingLicense] = useSubscriptionLicense({
    enterpriseConfig,
    customerAgreementConfig,
    isLoadingCustomerAgreementConfig,
  });
  const [offers, isLoadingOffers] = useOffers(enterpriseConfig.uuid);
  const [subscriptionPlan, setSubscriptionPlan] = useState();
  const [showExpirationNotifications, setShowExpirationNotifications] = useState();

  useEffect(
    () => {
      setSubscriptionPlan(subscriptionLicense?.subscriptionPlan);
      setShowExpirationNotifications(!(customerAgreementConfig?.disableExpirationNotifications));
    },
    [subscriptionLicense, customerAgreementConfig],
  );

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingLicense, isLoadingOffers, isLoadingCustomerAgreementConfig];
      return loadingStates.includes(true);
    },
    [isLoadingLicense, isLoadingOffers, isLoadingCustomerAgreementConfig],
  );

  const hasActiveSubsidies = useMemo(
    () => {
      const { offersCount } = offers;
      const hasSubscriptionPlan = !!subscriptionPlan;
      const hasActivatedLicense = subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
      const hasOffers = offersCount > 0;

      return (hasSubscriptionPlan && hasActivatedLicense) || hasOffers;
    },
    [subscriptionPlan, subscriptionLicense, offers],
  );

  const contextValue = useMemo(
    () => {
      if (isLoadingSubsidies) {
        return {};
      }
      return {
        subscriptionLicense,
        subscriptionPlan,
        offers,
        showExpirationNotifications,
        hasActiveSubsidies,
      };
    },
    [
      isLoadingSubsidies,
      subscriptionPlan,
      subscriptionLicense,
      offers,
      enterpriseConfig.uuid,
      customerAgreementConfig,
      hasActiveSubsidies,
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
