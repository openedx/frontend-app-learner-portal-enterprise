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
  useCatalogData,
  useCustomerAgreementData,
} from './data/hooks';
import { LOADING_SCREEN_READER_TEXT } from './data/constants';

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
  const [catalogData, isLoadingCatalogData] = useCatalogData(enterpriseConfig.uuid);

  useEffect(
    () => {
      setSubscriptionPlan(subscriptionLicense?.subscriptionPlan);
      setShowExpirationNotifications(!(customerAgreementConfig?.disableExpirationNotifications));
    },
    [subscriptionLicense, customerAgreementConfig],
  );

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingLicense, isLoadingOffers, isLoadingCustomerAgreementConfig, isLoadingCatalogData];
      return loadingStates.includes(true);
    },
    [isLoadingLicense, isLoadingOffers, isLoadingCustomerAgreementConfig, isLoadingCatalogData],
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
        customerAgreementConfig,
        catalogData,
      };
    },
    [
      isLoadingSubsidies,
      subscriptionPlan,
      subscriptionLicense,
      offers,
      enterpriseConfig.uuid,
      customerAgreementConfig,
      catalogData,
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
