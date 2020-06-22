import React, { useCallback, useState, useEffect } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import { LICENSE_STATUS } from './constants';
import { fetchSubscriptionLicensesForUser } from './service';

export function useSubscriptionLicenseForUser(subscriptionPlan) {
  const [license, setLicense] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (subscriptionPlan && subscriptionPlan.uuid) {
      fetchSubscriptionLicensesForUser(subscriptionPlan.uuid)
        .then((response) => {
          const { results } = camelCaseObject(response.data);
          const activated = results.filter(result => result.status === LICENSE_STATUS.ACTIVATED);
          const assigned = results.filter(result => result.status === LICENSE_STATUS.ASSIGNED);
          const deactivated = results.filter(result => result.status === LICENSE_STATUS.DEACTIVATED);

          if (activated.length) {
            setLicense(activated.pop());
          } else if (assigned.length) {
            setLicense(assigned.pop());
          } else if (deactivated.length) {
            setLicense(deactivated.pop());
          } else {
            setLicense(null);
          }
        })
        .catch((error) => {
          logError(new Error(error));
          setLicense(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
    if (subscriptionPlan === null) {
      setIsLoading(false);
    }
  }, [subscriptionPlan]);

  return [license, isLoading];
}

export function useRenderContactHelpText(enterpriseConfig) {
  const renderContactHelpText = useCallback(
    () => {
      const { contactEmail } = enterpriseConfig;
      const message = 'reach out to your organization\'s edX administrator';
      if (contactEmail) {
        return (
          <a className="text-underline" href={`mailto:${contactEmail}`}>
            {message}
          </a>
        );
      }
      return message;
    },
    [enterpriseConfig],
  );

  return renderContactHelpText;
}
