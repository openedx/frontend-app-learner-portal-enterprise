import { useQuery } from '@tanstack/react-query';

import useEnterpriseLearner from './useEnterpriseLearner';
import { queryContentHighlightsConfiguration } from '../../routes/data/queries';

/**
 * Retrieves the content highlights configuration for the active enterprise customer user.
 * @returns {Types.UseQueryResult}} The query results for the content highlights configuration.
 */
export default function useContentHighlightsConfiguration() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    queryContentHighlightsConfiguration(enterpriseId),
  );
}
