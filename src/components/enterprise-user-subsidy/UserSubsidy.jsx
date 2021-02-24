import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Container } from '@edx/paragon';

import { LoadingSpinner } from '../loading-spinner';

import { useSubscriptionLicenseForUser, useOffers } from './data/hooks';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { subscriptionPlan, enterpriseConfig } = useContext(AppContext);
  const [subscriptionLicense, isLoadingLicense] = useSubscriptionLicenseForUser(enterpriseConfig.uuid);
  const [offers, isLoadingOffers] = useOffers(enterpriseConfig.uuid);

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingLicense, isLoadingOffers];
      return loadingStates.includes(true);
    },
    [isLoadingLicense, isLoadingOffers],
  );

  const contextValue = useMemo(
    () => {
      let hasAccessToPortal = true;

      // determine whether user has access to the Learner Portal if their organization
      // has a Subscription Plan and whether user has an activated license.
      if (subscriptionPlan) {
        hasAccessToPortal = subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
      }
      if (offers.offersCount > 0) {
        hasAccessToPortal = true;
      }

      return {
        hasAccessToPortal, subscriptionLicense, offers,
      };
    },
    [subscriptionPlan, subscriptionLicense, offers, enterpriseConfig?.uuid],
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
