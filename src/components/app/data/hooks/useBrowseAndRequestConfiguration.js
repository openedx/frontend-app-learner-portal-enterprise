import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { useQuery } from '@tanstack/react-query';

import useEnterpriseLearner from './useEnterpriseLearner';
import { makeBrowseAndRequestConfigurationQuery } from '../../routes/queries';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useBrowseAndRequestConfiguration() {
  const { email: userEmail } = useContext(AppContext);
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    makeBrowseAndRequestConfigurationQuery(enterpriseId, userEmail),
  );
}
