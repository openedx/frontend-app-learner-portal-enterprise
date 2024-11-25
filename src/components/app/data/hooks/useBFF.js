import { useLocation, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { resolveBFFQuery } from '../../routes/data/utils';
import { useEnterpriseCustomer } from './index';
import { isBFFFeatureFlagEnabled } from '../utils';

/**
 * Uses the route to determine which API call to make for the BFF
 * Populates the queryKey with the appropriate enterprise customer uuid once BFF call is resolved
 * @param queryOptions
 * @param bffQueryFallback
 * @returns  {Types.UseQueryResult}} The query results for the routes BFF.
 */
export default function useBFF(queryOptions = {}, bffQueryFallback = null) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const {
    select, enabled, ...queryOptionsRest
  } = queryOptions;
  const location = useLocation();

  const shouldUseBFF = isBFFFeatureFlagEnabled(enterpriseCustomer.uuid);

  // Determine the BFF query to use based on the current location
  const params = useParams();
  const matchedBFFQuery = resolveBFFQuery(location.pathname);

  // Determine which query to call, the original hook or the new BFF
  let query = {
    ...matchedBFFQuery(params),
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }
      if (select) {
        return select(data);
      }
      return data;
    },
    enabled: enabled && !!shouldUseBFF,
  };
  // Determine if the flag is enabled, or if we have retrieved teh fallback query
  if ((!shouldUseBFF || matchedBFFQuery(params).queryKey.includes('fallback')) && !!bffQueryFallback) {
    query = bffQueryFallback;
  }
  return useQuery(query);
}
