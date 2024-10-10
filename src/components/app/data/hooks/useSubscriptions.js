import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';

import { querySubscriptions } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { transformSubscriptionsData } from '../services';
import { resolveBFFQuery } from '../../routes/data';

/**
 * Custom hook to get subscriptions data for the enterprise.
 * @param {Types.UseQueryOptions} queryOptions
 * @returns {Types.UseQueryResults} The query results for the subscriptions.
 */
export default function useSubscriptions(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const location = useLocation();

  const matchedBFFQuery = resolveBFFQuery(location.pathname);

  // Determine the query configuration: use the matched BFF query or fallback to default
  let queryConfig;
  if (matchedBFFQuery) {
    queryConfig = {
      ...matchedBFFQuery(enterpriseCustomer.uuid),
      select: (data) => {
        const { customerAgreement, subscriptionLicenses } = data?.enterpriseCustomerUserSubsidies?.subscriptions || {};
        if (!customerAgreement || !subscriptionLicenses) {
          return {};
        }
        // TODO: move transforms into the BFF response
        const transformedSubscriptionsData = transformSubscriptionsData(customerAgreement, subscriptionLicenses);
        return transformedSubscriptionsData;
      },
    };
  } else {
    queryConfig = querySubscriptions(enterpriseCustomer.uuid);
  }
  return useQuery({
    ...queryConfig,
    ...queryOptions,
  });
}
