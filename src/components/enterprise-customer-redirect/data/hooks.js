import { useEffect, useState, useMemo } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { fetchEnterpriseCustomerByUUID } from './service';

/**
 * A React hook that will fetch all the enterprise customers linked to the specified user id.
 *
 * @param {*} userId A user's id.
 *
 * @returns {list} obj.enterpriseCustomers A list of enterprise customers associated with a user. Note this is empty
 *  until the fetch promise has finished resolving.
 * @returns {bool} obj.isLoading A Boolean for whether the request is pending.
 */
export const useEnterpriseCustomerByUUID = (enterpriseUUID) => {
  const [enterpriseCustomer, setEnterpriseCustomer] = useState();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () => {
      if (!enterpriseUUID) {
        setIsLoading(false);
        return;
      }

      fetchEnterpriseCustomerByUUID(enterpriseUUID)
        .then((response) => {
          const data = camelCaseObject(response.data);
          const results = data?.results || [];
          setEnterpriseCustomer(results.shift());
        })
        .catch((error) => {
          const errorMessage = (
            `EnterpriseCustomerRedirect could not fetch metadata for 
            enterprise customer (${enterpriseUUID}): ${error.message}`
          );
          logError(errorMessage);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [enterpriseUUID],
  );

  return [enterpriseCustomer, isLoading];
};

/**
 * Determines a user's selected enterprise customer given their JWT roles.
 *
 * @param {array} userRoles List of edx-rbac roles for the user.
 *
 * @returns {string} The user's selected enterprise UUID for their session.
 */
export const useSelectedEnterpriseUUIDByUserRoles = (userRoles) => {
  const selectedEnterpriseUUID = useMemo(
    () => {
      const enterpriseLearnerRole = userRoles.find((role) => {
        const parts = role.split(':');
        return parts[0] === 'enterprise_learner';
      });
      return enterpriseLearnerRole?.split(':').pop();
    },
    [userRoles],
  );
  return selectedEnterpriseUUID;
};
