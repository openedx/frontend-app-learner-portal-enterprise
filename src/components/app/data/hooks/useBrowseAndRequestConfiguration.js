import { useQuery } from '@tanstack/react-query';

import useEnterpriseLearner from './useEnterpriseLearner';
import { queryBrowseAndRequestConfiguration } from '../../routes/data';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useBrowseAndRequestConfiguration() {
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    queryBrowseAndRequestConfiguration(enterpriseId),
  );
}
