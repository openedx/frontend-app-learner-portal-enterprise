import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import useEnterpriseCustomer from './useEnterpriseCustomer';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useCourseMetadata(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { courseKey } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  return useQuery({
    ...queryOptionsRest,
    ...queryCourseMetadata(enterpriseCustomer.uuid, courseKey),
    select: (data) => {
      if (select) {
        return select(data);
      }
      if (!data) {
        return data;
      }
      const { advertisedCourseRunUuid } = data;
      const activeCourseRun = data.courseRuns.find((courseRun) => courseRun.uuid === advertisedCourseRunUuid);
      return {
        ...data,
        activeCourseRun,
      };
    },
  });
}
