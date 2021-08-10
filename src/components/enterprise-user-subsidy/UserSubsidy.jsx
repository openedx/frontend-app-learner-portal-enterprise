import React, {
  createContext, useContext, useEffect, useMemo, useState,
} from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import {
  useSubscriptionLicenseForUser,
  useOffers,
  useCustomerAgreementData,
} from './data/hooks';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const [subscriptionLicense, isLoadingLicense] = useSubscriptionLicenseForUser(enterpriseConfig.uuid);
  const [customerAgreementConfig, isLoadingCustomerAgreementConfig] = useCustomerAgreementData(enterpriseConfig.uuid);
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

  const contextValue = useMemo(
    () => {
      if (isLoadingSubsidies) {
        return {};
      }
      let hasAccessToPortal = false;
      if (subscriptionLicense) {
        hasAccessToPortal = subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
      }
      if (offers.offersCount > 0) {
        hasAccessToPortal = true;
      }
      return {
        hasAccessToPortal,
        subscriptionLicense,
        subscriptionPlan,
        offers,
        showExpirationNotifications,
      };
    },
    [isLoadingSubsidies,
      subscriptionPlan,
      subscriptionLicense,
      offers,
      enterpriseConfig?.uuid,
      customerAgreementConfig],
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
