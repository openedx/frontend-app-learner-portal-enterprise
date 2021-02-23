import { useMemo, useContext } from 'react';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { CourseContext } from '../CourseContextProvider';
import {
  findOfferForCourse, hasCourseStarted, findUserEnrollmentForCourseRun,
} from '../data/utils';

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
  const { state: courseData } = useContext(CourseContext);
  const { activeCourseRun, userEnrollments } = courseData;
  const { key, start, isEnrollable } = activeCourseRun;

  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const userEnrollment = useMemo(
    () => findUserEnrollmentForCourseRun({ userEnrollments, key }),
    [userEnrollments, key],
  );
  return {
    isEnrollable,
    isUserEnrolled: !!userEnrollment,
    isCourseStarted,
    userEnrollment,
  };
}

/**
 * Extract subsidy information from CourseContext and UserSubsidyContext.
 * Before calling this, ensure the following data is in CourseContext and UserSubsidyContext:
 *   CourseContext `state` should have `userSubsidyApplicableToCourse` and `catalog`
 *   UserSubsidyContext `value` should have `subscriptionLicense` and `offers`
 *
 * @returns {object} with fields:
 * {
 *    subscriptionLicense,
 *    userSubsidyApplicableToCourse,
 *    offersCount,
 *    offers,
 *     courseHasOffer,
 * }
 */
export function useSubsidyDataForCourse() {
  const { state: courseData } = useContext(CourseContext);
  const { subscriptionLicense, offers: { offers, offersCount } } = useContext(UserSubsidyContext);

  const { userSubsidyApplicableToCourse, catalog: { catalogList } } = courseData;
  return {
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    offersCount,
    offers,
    courseHasOffer: !!findOfferForCourse(offers, catalogList),
  };
}
