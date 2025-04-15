import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';

import { queryCourseMetadata } from '../queries';
import { getAvailableCourseRuns } from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns The query results for the course metadata.
 */
export default function useVideoCourseMetadata(courseKey) {
  const isEnrollableBufferDays = useLateEnrollmentBufferDays();
  return useSuspenseQuery(
    queryOptions({
      ...queryCourseMetadata(courseKey),
      select: (data) => {
        if (!data) {
          return data;
        }
        const availableCourseRuns = getAvailableCourseRuns({ course: data, isEnrollableBufferDays });
        const transformedData = {
          ...data,
          availableCourseRuns,
        };
        return transformedData;
      },
    }),
  );
}
