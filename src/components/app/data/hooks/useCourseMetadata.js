import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import { getAvailableCourseRuns } from '../utils';
import useLateRedemptionBufferDays from './useLateRedemptionBufferDays';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useCourseMetadata(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { courseKey } = useParams();
  const [searchParams] = useSearchParams();
  // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
  // need to replace it with `+` again to be a valid course run key.
  const courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');
  const isEnrollableBufferDays = useLateRedemptionBufferDays();
  return useQuery({
    ...queryCourseMetadata(courseKey, courseRunKey),
    enabled: !!courseKey,
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }
      const availableCourseRuns = getAvailableCourseRuns({ course: data, isEnrollableBufferDays });
      const transformedData = {
        ...data,
        availableCourseRuns,
      };
      if (select) {
        return select({
          original: data,
          transformed: transformedData,
        });
      }
      return transformedData;
    },
  });
}
