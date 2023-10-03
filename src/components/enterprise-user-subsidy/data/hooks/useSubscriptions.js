import { useState, useEffect } from 'react';

import { useSubscriptionLicense, useCustomerAgreementData } from './hooks';
import { hasValidStartExpirationDates } from '../../../../utils/common';

/**
 * Given an authenticated user and an enterprise customer config, returns the user's subscription license (if any)
 * along with metadata about the customer agreement and subscription plan(s). Includes a function to allow consumers
 * to activate the user's license.
 */
function useSubscriptions({
  authenticatedUser,
  enterpriseConfig,
}) {
  const [subscriptionPlan, setSubscriptionPlan] = useState();
  const [showExpirationNotifications, setShowExpirationNotifications] = useState();
  const [customerAgreementConfig, isLoadingCustomerAgreementConfig] = useCustomerAgreementData(enterpriseConfig.uuid);
  const {
    license: subscriptionLicense,
    isLoading: isLoadingLicense,
    activateUserLicense,
  } = useSubscriptionLicense({
    enterpriseConfig,
    customerAgreementConfig,
    isLoadingCustomerAgreementConfig,
    user: authenticatedUser,
  });

  useEffect(
    () => {
      if (subscriptionLicense?.subscriptionPlan) {
        setSubscriptionPlan({
          ...subscriptionLicense.subscriptionPlan,
          isCurrent: hasValidStartExpirationDates({
            startDate: subscriptionLicense.subscriptionPlan.startDate,
            expirationDate: subscriptionLicense.subscriptionPlan.expirationDate,
          }),
        });
      }
      setShowExpirationNotifications(!(customerAgreementConfig?.disableExpirationNotifications));
    },
    [subscriptionLicense, customerAgreementConfig],
  );

  return {
    customerAgreementConfig,
    subscriptionPlan,
    subscriptionLicense,
    isLoading: isLoadingCustomerAgreementConfig || isLoadingLicense,
    showExpirationNotifications,
    activateUserLicense,
  };
}

export default useSubscriptions;
