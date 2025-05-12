import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryContentHighlightsConfiguration } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Retrieves the content highlights configuration for the active enterprise customer user.
 * @returns The query results for the content highlights configuration.
 */
export default function useContentHighlightsConfiguration(options = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { select } = options;
  return useSuspenseQuery(
    queryOptions({
      ...queryContentHighlightsConfiguration(enterpriseCustomer.uuid),
      select,
    }),
  );
}

/**
 * Custom hook to get the content highlights configuration for the enterprise.
 * @returns Whether the user can only view highlights.
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
