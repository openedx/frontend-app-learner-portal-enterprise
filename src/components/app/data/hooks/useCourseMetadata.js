import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import { filterCourseMetadataByAllocationCourseRun, getAvailableCourseRuns } from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useRedeemablePolicies from './useRedeemablePolicies';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useCourseMetadata(queryOptions = {}) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { courseKey } = useParams();
  const [searchParams] = useSearchParams();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const {
    allocatedCourseRunAssignmentKeys,
    hasAssignedCourseRuns,
    hasMultipleAssignedCourseRuns,
  } = filterCourseMetadataByAllocationCourseRun({
    courseKey,
    redeemableLearnerCreditPolicies,
  });
  // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
  // need to replace it with `+` again to be a valid course run key.
  let courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');
  if (!courseRunKey && hasAssignedCourseRuns) {
    courseRunKey = hasMultipleAssignedCourseRuns ? null : allocatedCourseRunAssignmentKeys[0];
  }
  const lateEnrollmentBufferDays = useLateEnrollmentBufferDays({
    enabled: !!courseKey,
  });
  return useQuery({
    ...queryCourseMetadata(courseKey, courseRunKey),
    enabled: !!courseKey,
    ...queryOptionsRest,
    select: (data) => {
      if (!data) {
        return data;
      }
      const availableCourseRuns = getAvailableCourseRuns({ course: data, lateEnrollmentBufferDays });
      let transformedData = {
        ...data,
        availableCourseRuns,
      };
      // TODO: Test data remove
      const keys = ['course-v1:edx+H200+2018', 'course-v1:edx+H200+2T2020'];
      // This logic should appropriately handle multiple course runs being assigned, and return the appropriate metadata
      if (hasMultipleAssignedCourseRuns) {
        transformedData = {
          ...data,
          courseRuns: data.courseRuns.filter(
            courseRun => keys.includes(courseRun.key),
          ),
          availableCourseRuns: data.courseRuns.filter(
            courseRun => keys.includes(courseRun.key),
          ),
        };
      }
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
