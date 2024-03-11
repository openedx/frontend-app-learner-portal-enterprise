import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { queryContentHighlights, useEnterpriseCustomer } from '../app/data';

export default function useContentHighlights(queryOptions = {}) {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryContentHighlights(enterpriseCustomer.uuid),
    select: (data) => data.filter(highlightSet => highlightSet.highlightedContent.length > 0),
    enabled: !!getConfig().FEATURE_CONTENT_HIGHLIGHTS,
    ...queryOptions,
  });
}
