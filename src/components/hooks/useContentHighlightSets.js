import { useQuery } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';

import { queryContentHighlightSets, useEnterpriseCustomer } from '../app/data';

export default function useContentHighlightSets(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryContentHighlightSets(enterpriseCustomer.uuid),
    select: (data) => {
      const highlightSetsWithContent = data.filter(highlightSet => highlightSet.highlightedContent.length > 0);
      if (select) {
        return select({
          original: data,
          transformed: highlightSetsWithContent,
        });
      }
      return highlightSetsWithContent;
    },
    enabled: !!getConfig().FEATURE_CONTENT_HIGHLIGHTS,
    ...queryOptionsRest,
  });
}
