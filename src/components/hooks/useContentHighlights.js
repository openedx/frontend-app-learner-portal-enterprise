import { useQuery } from '@tanstack/react-query';
import { queryContentHighlightSets } from '../app/data';
import useEnterpriseCustomer from './useEnterpriseCustomer';

export default function useContentHighlights() {
  const { uuid } = useEnterpriseCustomer();
  const { data: contentHighlightsData, isLoading } = useQuery(queryContentHighlightSets(uuid));

  const highlightSetsWithContent = contentHighlightsData
    .filter(highlightSet => highlightSet.highlightedContent.length > 0);

  return {
    isLoading,
    contentHighlights: highlightSetsWithContent,
  };
}
