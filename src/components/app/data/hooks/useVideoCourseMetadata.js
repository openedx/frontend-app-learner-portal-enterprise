import { useQuery } from '@tanstack/react-query';

import { queryCourseMetadata } from '../queries';
import { getAvailableCourseRuns } from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns The query results for the course metadata.
 */
export default function useVideoCourseMetadata(courseKey, queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const isEnrollableBufferDays = useLateEnrollmentBufferDays({
    enabled: !!courseKey,
  });
  return useQuery({
    ...queryCourseMetadata(courseKey),
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
