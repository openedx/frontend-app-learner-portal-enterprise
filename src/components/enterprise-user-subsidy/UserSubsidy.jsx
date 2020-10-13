import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import SubscriptionSubsidy from './SubscriptionSubsidy';

import { useSubscriptionLicenseForUser, useOffers } from './data/hooks';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { subscriptionPlan, enterpriseConfig } = useContext(AppContext);
  const [subscriptionLicense, isLoadingLicense] = useSubscriptionLicenseForUser(subscriptionPlan);
  const [offers, isLoadingOffers] = useOffers(enterpriseConfig.uuid);

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingLicense, isLoadingOffers];
      return loadingStates.includes(true);
    },
    [isLoadingLicense, isLoadingOffers],
  );

  const value = useMemo(
    () => {
      let hasAccessToPortal = true;

      // determine whether user has access to the Learner Portal if their organization
      // has a Subscription Plan and whether user has an activated license.
      if (subscriptionPlan) {
        hasAccessToPortal = subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED;
      }

      return { hasAccessToPortal, subscriptionLicense, offers };
    },
    [subscriptionPlan, subscriptionLicense, offers, enterpriseConfig.uuid],
  );

  if (isLoadingSubsidies) {
    return (
      <div className="container-fluid py-5">
        <LoadingSpinner screenReaderText={LOADING_SCREEN_READER_TEXT} />
      </div>
    );
  }

  return (
    <>
      {/**
       * SubscriptionSubsidy takes care of redirecting the user to `/${enterpriseConfig.slug}`
       * if their organization has a subscription plan but they don't have appropriate access
       * to a license (i.e., status="activated"). it also handles the case where the organization
       * has an active subscription plan but the current date is not between the plan's start and
       * expiration dates. The component also handles rendering warning/error status alerts.
       */}
      <SubscriptionSubsidy plan={subscriptionPlan} license={subscriptionLicense} />
      {/**
       * Potential direction for code organization for blended use case of subscriptions,
       * codes, and offers:
       *   <CodeSubsidy />
       *   <OfferSubidy />
      */}
      {/* Render the children so the rest of the page shows */}
      <UserSubsidyContext.Provider value={value}>
        {children}
      </UserSubsidyContext.Provider>
    </>
  );
};

UserSubsidy.propTypes = {
  children: PropTypes.node.isRequired,
};

export default UserSubsidy;
