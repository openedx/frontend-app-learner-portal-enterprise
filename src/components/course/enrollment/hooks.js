import { useMemo, useContext } from 'react';

import { AppContext } from '@edx/frontend-platform/react';

import { UserSubsidyContext } from '../../enterprise-user-subsidy/UserSubsidy';
import { useCourseEnrollmentUrl } from '../data/hooks';
import { CourseContext } from '../CourseContextProvider';
import {
  findHighestLevelSeatSku, findOfferForCourse, hasCourseStarted, findUserEnrollmentForCourse,
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
    () => findUserEnrollmentForCourse({ userEnrollments, key }),
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
 * Before calling this, ensure required data is in CourseContext, UserSubsidyContext and AppContext
 *
 * CourseContext: must have `state` with `activeCourseRun`, `userSubsidy` and `catalog`
 * AppContext: must have `enterpriseConfig` populated
 * UserSubsidyContext: must have `subscriptionLicense`, `offers` populated
 *
 * @param { object } location router location. Only here because of useEnrollmentUrl hook.
 *   (TODO Refactor this once useEnrollmentUrl is refactored!)
 *
 * @returns {object} with fields:
 * {
 *    subscriptionLicense,
 *    userSubsidyApplicableToCourse,
 *    enrollmentUrl,
 *    offersCount,
*     courseHasOffer,
 * }
 */
export function useSubsidyData({ location }) {
  const { state: courseData } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense, offers: { offers, offersCount } } = useContext(UserSubsidyContext);

  const {
    activeCourseRun,
    userSubsidyApplicableToCourse,
    catalog: { catalogList },
  } = courseData;
  const {
    key,
    seats,
  } = activeCourseRun;

  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );

  const enrollmentUrl = useCourseEnrollmentUrl({
    catalogList,
    enterpriseConfig,
    key,
    location,
    offers,
    sku,
    subscriptionLicense,
    userSubsidyApplicableToCourse,
  });

  return {
    subscriptionLicense,
    userSubsidyApplicableToCourse,
    enrollmentUrl,
    offersCount,
    courseHasOffer: !!findOfferForCourse(offers, catalogList),
  };
}
