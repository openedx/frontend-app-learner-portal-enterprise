import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resolveBFFQuery } from '../../routes/data/utils';
import { useEnterpriseCustomer } from './index';

/**
 * Uses the route to determine which API call to make for the BFF
 * Populates the queryKey with the appropriate enterprise customer uuid once BFF call is resolved
 * @param queryOptions
 * @returns  {Types.UseQueryResult}} The query results for the routes BFF.
 */
export function useBFF(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(location.pathname);
  return useQuery({
    ...matchedBFFQuery,
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }
      // TODO: To be extracted into helper function once BFF exposes enterpriseCustomer.uuid
      const originalQueryKey = matchedBFFQuery.queryKey;
      // To be replaced eventually with the LMS enterprise customer uuid from the response
      const queryKeyWithEnterpriseUuid = originalQueryKey.map((keySegment) => keySegment || enterpriseCustomer.uuid);
      queryClient.setQueryData(queryKeyWithEnterpriseUuid, data);

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
  });
}
