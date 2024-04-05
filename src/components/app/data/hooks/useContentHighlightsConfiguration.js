import { useQuery } from '@tanstack/react-query';

import { queryContentHighlightsConfiguration } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Retrieves the content highlights configuration for the active enterprise customer user.
 * @param {Types.UseQueryOptions} queryOptions The query options for the content highlights configuration.
 * @returns {Types.UseQueryResult} The query results for the content highlights configuration.
 */
export default function useContentHighlightsConfiguration(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
    ...queryOptions,
  });
}

/**
 * Custom hook to get the content highlights configuration for the enterprise.
 * @returns {Types.UseQueryResult} WHether the user can only view highlights.
 */
export function useCanOnlyViewHighlights() {
  return useContentHighlightsConfiguration({
    select: (data) => {
      if (!data?.isHighlightFeatureActive) {
        return false;
      }
      return data.canOnlyViewHighlightSets;
    },
  });
}
