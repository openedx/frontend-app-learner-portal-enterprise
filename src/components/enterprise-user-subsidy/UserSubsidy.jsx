import React, { createContext, useContext, useMemo } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import SubscriptionSubsidy from './SubscriptionSubsidy';

import { useSubscriptionLicenseForUser } from './data/hooks';
import { LICENSE_STATUS, LOADING_SCREEN_READER_TEXT } from './data/constants';

export const UserSubsidyContext = createContext();

const UserSubsidy = ({ children }) => {
  const { subscriptionPlan } = useContext(AppContext);
  const [subscriptionLicense, isLoadingLicense] = useSubscriptionLicenseForUser(subscriptionPlan);

  const isLoadingSubsidies = useMemo(
    () => {
      const loadingStates = [isLoadingLicense];
      return loadingStates.includes(true);
    },
    [isLoadingLicense],
  );

  const value = useMemo(
    () => {
      let hasAccessToPortal = true;

      // determine whether user has access to the Learner Portal if their organization
      // has an active Subscription Plan.
      if (subscriptionPlan && subscriptionLicense === null) {
        hasAccessToPortal = false;
      } else if (subscriptionLicense && subscriptionLicense.status !== LICENSE_STATUS.ACTIVATED) {
        hasAccessToPortal = false;
      }

      return { hasAccessToPortal, subscriptionLicense };
    },
    [subscriptionLicense],
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
       * to a license (i.e., status="activated") and rendering warning/error status alerts.
       */}
      <SubscriptionSubsidy subscriptionLicense={subscriptionLicense} />
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
