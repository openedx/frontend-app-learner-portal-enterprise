import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryContentHighlightSets } from '../queries';

export default function useContentHighlightSets(options = {}) {
  const { select } = options;
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useSuspenseQuery(
    queryOptions({
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
    }),
  );
}
