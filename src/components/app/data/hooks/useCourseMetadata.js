import { useQuery } from '@tanstack/react-query';
import { useParams, useSearchParams } from 'react-router-dom';

import { queryCourseMetadata } from '../queries';
import {
  determineAllocatedAssignmentsForCourse,
  getAvailableCourseRuns,
  transformCourseMetadataByAllocatedCourseRunAssignments,
  isRunUnrestricted,
} from '../utils';
import useLateEnrollmentBufferDays from './useLateEnrollmentBufferDays';
import useRedeemablePolicies from './useRedeemablePolicies';
import useEnterpriseCustomerContainsContent from './useEnterpriseCustomerContainsContent';

/**
 * Retrieves the course metadata for the given enterprise customer and course key.
 * @returns {Types.UseQueryResult}} The query results for the course metadata.
 */
export default function useCourseMetadata(queryOptions = {}, catalogUuid = undefined) {
  const { select, ...queryOptionsRest } = queryOptions;
  const { courseKey } = useParams();
  const [searchParams] = useSearchParams();
  const { data: redeemableLearnerCreditPolicies } = useRedeemablePolicies();
  const {
    allocatedCourseRunAssignmentKeys,
    hasAssignedCourseRuns,
    hasMultipleAssignedCourseRuns,
  } = determineAllocatedAssignmentsForCourse({ courseKey, redeemableLearnerCreditPolicies });
  const {
    data: {
      restrictedRunsAllowed,
    },
  } = useEnterpriseCustomerContainsContent([courseKey]);
  // `requestUrl.searchParams` uses `URLSearchParams`, which decodes `+` as a space, so we
  // need to replace it with `+` again to be a valid course run key.
  let courseRunKey = searchParams.get('course_run_key')?.replaceAll(' ', '+');
  // only override `courseRunKey` when learner has a single allocated assignment
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
      // First stage filters out any runs that are unavailable for universal reasons, such as enrollment windows and
      // published states.
      const basicAvailableCourseRuns = getAvailableCourseRuns({ course: data, lateEnrollmentBufferDays });
      // Second stage filters out any *restricted* runs that are not redeemable via a specific catalog (if
      // catalogUuid is defined), or via any of the customer's catalogs (if catalogUuid is undefined).
      const availableAndUnrestrictedCourseRuns = basicAvailableCourseRuns.filter(
        courseRunMetadata => isRunUnrestricted({
          restrictedRunsAllowed,
          courseKey,
          courseRunMetadata,
          catalogUuid,
        }),
      );
      let transformedData = {
        ...data,
        availableCourseRuns: availableAndUnrestrictedCourseRuns,
      };
      // This logic should appropriately handle multiple course runs being assigned, and return the appropriate metadata
      transformedData = transformCourseMetadataByAllocatedCourseRunAssignments({
        hasMultipleAssignedCourseRuns,
        courseMetadata: transformedData,
        allocatedCourseRunAssignmentKeys,
      });
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
