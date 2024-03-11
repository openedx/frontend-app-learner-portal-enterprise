import { useQuery } from '@tanstack/react-query';
import { queryContentHighlights, useEnterpriseCustomer } from '../app/data';

export default function useContentHighlights() {
  const { uuid } = useEnterpriseCustomer();
  const { data: contentHighlightsData, isLoading } = useQuery(queryContentHighlights(uuid));

  const highlightSetsWithContent = contentHighlightsData
    .filter(highlightSet => highlightSet.highlightedContent.length > 0);

  return {
    isLoading,
    contentHighlights: highlightSetsWithContent,
  };
}
