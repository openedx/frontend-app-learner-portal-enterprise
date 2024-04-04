import { useMemo } from 'react';

import { hasCourseStarted, findUserEnrollmentForCourseRun } from '../data/utils';
import { useCourseMetadata, useEnterpriseCourseEnrollments } from '../../app/data';

/**
 * Enrollment data needed for enroll logic
 * @typedef {Object} EnrollmentData
 * @property {boolean} isUserEnrolled
 * @property {boolean} isCourseStarted
 * @property {boolean} isEnrollable
 * @property {object} userEnrollment
 */

/**
 *
 * Extracts info needed for enroll button logic from CourseContext, for a single course.
 * Which course?
 *   `activeCourseRun`, `userEnrollments` are looked up in the CourseContext's `state`
 *
 * @returns {EnrollmentData} enrolldata data for use in enrollment logic
 */
export function useEnrollData() {
  const { data: { activeCourseRun } } = useCourseMetadata();
  const { key, start, isEnrollable } = activeCourseRun;
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const userEnrollment = useMemo(
    () => findUserEnrollmentForCourseRun({ userEnrollments: enterpriseCourseEnrollments, key }),
    [enterpriseCourseEnrollments, key],
  );
  return {
    isEnrollable,
    isUserEnrolled: !!userEnrollment,
    isCourseStarted,
    userEnrollment,
  };
}
