import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import useEnterpriseLearner from './useEnterpriseLearner';
import { queryCourseMetadata } from '../../routes/queries';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useCourseMetadata() {
  const { courseKey } = useParams();
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const enterpriseId = enterpriseCustomer.uuid;
  return useQuery(
    queryCourseMetadata(enterpriseId, courseKey),
  );
}
