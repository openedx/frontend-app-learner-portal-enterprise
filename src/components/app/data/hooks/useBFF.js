import { useLocation } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { resolveBFFQuery } from '../../routes/data/utils';
import { useEnterpriseCustomer } from './index';

/**
 * Switch from UUID to SLUG todo
 * @param queryOptions
 * @returns {UseQueryResult<unknown, unknown>}
 */
export function useBFF(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const queryClient = useQueryClient();
  const location = useLocation();

  // Determine the BFF query to use based on the current location
  const matchedBFFQuery = resolveBFFQuery(location.pathname);
  return useQuery({
    ...matchedBFFQuery,
    ...queryOptions,
    select: (data) => {
      if (data) {
        const oldKey = matchedBFFQuery.queryKey;
        // To be replaced eventually with the LMS enterprise customer uuid from the response
        const newKey = oldKey.map((key) => key || enterpriseCustomer.uuid);
        queryClient.setQueryData(newKey, data);
        return data;
      }
      return data;
    },
  });
}
