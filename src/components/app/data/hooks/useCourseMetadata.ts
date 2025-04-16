import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import {
  determineAllocatedAssignmentsForCourse,
  getAvailableCourseRuns,
  transformCourseMetadataByAllocatedCourseRunAssignments,
} from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useRedeemablePolicies from './useRedeemablePolicies';

type UseCourseMetadataQueryOptions = {
  select?: (data: unknown) => unknown;
};

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns The query results for the course metadata.
 */
export default function useCourseMetadata(options: UseCourseMetadataQueryOptions = {}) {
  const { select } = options;
  const params = useParams();
  const courseKey = params.courseKey!;
  const [searchParams] = useSearchParams();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const {
    allocatedCourseRunAssignmentKeys,
  } = determineAllocatedAssignmentsForCourse({ courseKey, redeemableLearnerCreditPolicies });
  // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
  // need to replace it with `+` again to be a valid course run key.
  const courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');

  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays();

  return useSuspenseQuery(
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
        const availableCourseRuns = getAvailableCourseRuns({ course: data, lateEnrollmentBufferDays });
        let transformedData = {
          ...data,
          availableCourseRuns,
        };
        // This logic should appropriately handle multiple course runs being
        // assigned, and return the appropriate metadata
        transformedData = transformCourseMetadataByAllocatedCourseRunAssignments({
          courseMetadata: transformedData,
          allocatedCourseRunAssignmentKeys,
          courseRunKey,
        });
        if (select) {
          return select({
            original: data,
            transformed: transformedData,
          });
        }
        return transformedData;
      },
    }),
  );
}
