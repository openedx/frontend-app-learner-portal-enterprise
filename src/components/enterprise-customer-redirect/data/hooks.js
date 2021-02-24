import { useEffect, useState, useMemo } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { logError } from '@edx/frontend-platform/logging';

import { fetchEnterpriseCustomersForUser } from './service';

/**
 * A React hook that will fetch all the enterprise customers linked to the specified user id.
 *
 * @param {*} userId A user's id.
 *
 * @returns {list} obj.enterpriseCustomers A list of enterprise customers associated with a user. Note this is empty
 *  until the fetch promise has finished resolving.
 * @returns {bool} obj.isLoading A Boolean for whether the request is pending.
 */
export const useEnterpriseCustomersForUser = (userId) => {
  const [enterpriseCustomers, setEnterpriseCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(
    () => {
      if (!userId) {
        return;
      }
      fetchEnterpriseCustomersForUser()
        .then((response) => {
          const data = camelCaseObject(response.data);
          const results = data?.results || [];
          setEnterpriseCustomers(results);
        })
        .catch((error) => {
          logError(`EnterpriseCustomerRedirect could not fetch enterprise customers: ${error.message}`);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    [userId],
  );

  return { enterpriseCustomers, isLoading };
};

/**
 * Determines a user's selected enterprise customer given their JWT roles.
 *
 * @param {array} userRoles List of edx-rbac roles for the user.
 *
 * @returns {string} The user's selected enterprise UUID for their session.
 */
export const useSelectedEnterpriseUUIDByUserRoles = (userRoles) => {
  const selectedEnterpriseRole = useMemo(
    () => userRoles.find((role) => {
      const parts = role.split(':');
      return parts[0] === 'enterprise_learner';
    }),
    [userRoles],
  );

  const selectedEnterpriseUUID = selectedEnterpriseRole?.split(':')[1];
  return selectedEnterpriseUUID;
};

/**
 * Finds the enterprise customer's slug for a given enterprise UUID.
 *
 * @param {string} uuid An enterprise customer UUID
 * @param {array} enterpriseCustomers List of enterprise customers linked to the user.
 *
 * @returns {string} The slug of the enterprise matching the given UUID.
 */
export const useEnterpriseCustomerSlugByUUID = (uuid, enterpriseCustomers) => {
  const enterpriseCustomer = useMemo(
    () => enterpriseCustomers?.find(customer => customer?.uuid === uuid),
    [uuid, enterpriseCustomers],
  );
  return enterpriseCustomer?.slug;
};
