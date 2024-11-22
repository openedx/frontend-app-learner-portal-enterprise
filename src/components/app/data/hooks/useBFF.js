import { getConfig } from '@edx/frontend-platform/config';
import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveBFFQuery } from '../../routes/data/utils';
import { useEnterpriseCustomer } from './index';

/**
 * Uses the route to determine which API call to make for the BFF
 * Populates the queryKey with the appropriate enterprise customer uuid once BFF call is resolved
 * @param queryOptions
 * @returns  {Types.UseQueryResult}} The query results for the routes BFF.
 */
export function useBFF(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select, enabled, ...queryOptionsRest } = queryOptions;
  const location = useLocation();
  const { FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS } = getConfig();
  let shouldUseBFF = false;
  if (!FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS) {
    shouldUseBFF = false;
  } else if (FEATURE_ENABLE_BFF_API_FOR_ENTERPRISE_CUSTOMERS.includes(enterpriseCustomer.uuid)) {
    shouldUseBFF = true;
  }
  const params = useParams();
  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(location.pathname);
  return useQuery({
    ...matchedBFFQuery(params),
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }
      console.log(matchedBFFQuery, data);
      // TODO: Determine if returned data needs further transformations
      const transformedData = structuredClone(data);
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
    enabled: enabled && !!shouldUseBFF,
  });
}
