import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { queryContentHighlightSets, useEnterpriseCustomer } from '../app/data';

export default function useContentHighlightSets(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryContentHighlightSets(enterpriseCustomer.uuid),
    select: (data) => data.filter(highlightSet => highlightSet.highlightedContent.length > 0),
    enabled: !!getConfig().FEATURE_CONTENT_HIGHLIGHTS,
    ...queryOptions,
  });
}
