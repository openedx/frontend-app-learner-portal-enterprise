import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { logError } from '@edx/frontend-platform/logging';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { resolveBFFQuery } from '../queries';
import useEnterpriseFeatures from './useEnterpriseFeatures';

/**
 * Uses the route to determine which API call to make for the BFF
 *
 * @param bffQueryAdditionalParams - additional fields to pass into a matched BFF query call
 * @param bffQueryOptions - the queryOptions specifically for the matched BFF query call
 * @param fallbackQueryConfig - if a route is not compatible with the BFF layer, this field
 * allows you to pass a fallback query endpoint to call in lieu of an unmatched BFF query
 * @returns  {Types.UseQueryResult}} The query results for the routes BFF.
 */
export default function useBFF({
  bffQueryAdditionalParams = {},
  bffQueryOptions = {},
  fallbackQueryConfig = null,
}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: enterpriseFeatures } = useEnterpriseFeatures();
  const { enterpriseSlug } = useParams();
  const location = useLocation();

  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(
    location.pathname,
    {
      enterpriseCustomerUuid: enterpriseCustomer.uuid,
      enterpriseFeatures,
    },
  );

  // Determine which query to call, the original hook or the new BFF
  let queryConfig = {};
  if (matchedBFFQuery) {
    queryConfig = {
      ...matchedBFFQuery({ enterpriseSlug, ...bffQueryAdditionalParams }),
      ...bffQueryOptions,
    };
  } else if (fallbackQueryConfig) {
    queryConfig = fallbackQueryConfig;
  } else {
    const err = new Error('No BFF query found for the current route and no fallback query provided');
    logError(err);
    throw err;
  }
  return useQuery(queryConfig);
}
