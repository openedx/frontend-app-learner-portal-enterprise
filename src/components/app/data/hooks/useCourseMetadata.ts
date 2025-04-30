import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import { getAvailableCourseRuns } from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useCourseRunKeyQueryParam from './useCourseRunKeyQueryParam';

type UseCourseMetataSelectFnArgs = {
  original: CourseMetadata;
  transformed: CourseMetadataWithAvailableRuns;
};

type UseCourseMetadataQueryOptions<TData = unknown> = {
  select?: (args: UseCourseMetataSelectFnArgs) => TData;
};

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns The query results for the course metadata.
 */
export default function useCourseMetadata<TData = CourseMetadataWithAvailableRuns>(
  options: UseCourseMetadataQueryOptions<TData> = {},
) {
  const { select } = options;
  const params = useParams();
  const courseKey = params.courseKey!;
  const courseRunKey = useCourseRunKeyQueryParam();

  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();

  return useSuspenseQuery<CourseMetadata, Error, TData>(
    queryOptions({
      ...queryCourseMetadata(courseKey),
      select: (data) => {
        if (!data) {
          return data;
        }
        // NOTE: The results from this call includes restricted runs, some of
        // which might not be ACTUALLY available depending on the subsidy being
        // applied.  However, we don't know the subsidy being applied at this
        // point of the code, so just return all the available
        // restricted runs regardless of catalog inclusion.
        const availableCourseRuns = getAvailableCourseRuns({
          course: data,
          lateEnrollmentBufferDays,
          courseRunKey,
        });
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
        return transformedData as TData;
      },
    }),
  );
}
