import { AppContext } from '@edx/frontend-platform/react';
import { useContext, useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { COURSE_AVAILABILITY_MAP } from '../../../data/constants';
import useCourseRunCardHeading from './useCourseRunCardHeading';
import useCourseRunCardSubHeading from './useCourseRunCardSubHeading';
import useCourseRunCardAction from './useCourseRunCardAction';
import { getExecutiveEducation2UEnrollmentUrl } from '../../../enrollment/utils';
import { CourseContext } from '../../../CourseContextProvider';
import { findHighestLevelEntitlementSku, pathContainsCourseTypeSlug } from '../../../data/utils';

/**
 * Gathers the data needed to render the `CourseRunCard` component.
 * @param {object} args
 * @param {object} args.courseRun The course run metadata, including the key, availability,
 *  start date, pacing type, and enrollment count.
 * @param {object} args.userEnrollment The user's enrollment in the course run, if any.
 * @param {string} args.courseRunUrl The URL to the course run coureware page.
 * @param {object} args.subsidyAccessPolicy A redeemable subsidy access policy applicable to the course, if any.
 * @returns An object containing the `heading, `subHeading`, and `action` data needed to render the `CourseRunCard`.
 */
const useCourseRunCardData = ({
  courseRun,
  userEnrollment,
  courseRunUrl,
  subsidyAccessPolicy,
}) => {
  const location = useLocation();
  const {
    key: contentKey,
    availability,
    start,
    pacingType,
    enrollmentCount,
  } = courseRun;
  const isCourseRunCurrent = availability === COURSE_AVAILABILITY_MAP.CURRENT;
  const isUserEnrolled = !!userEnrollment;
  const { enterpriseConfig } = useContext(AppContext);
  const {
    state: {
      course: {
        entitlements,
      },
    },
  } = useContext(CourseContext);
  const entitlementProductSku = useMemo(
    () => findHighestLevelEntitlementSku(entitlements),
    [entitlements],
  );
  const courseTypeEnrollmentUrl = getExecutiveEducation2UEnrollmentUrl({
    enterpriseSlug: enterpriseConfig.slug,
    courseRunUuid: courseRun.courseUuid,
    entitlementProductSku,
    isExecutiveEducation2UCourse: pathContainsCourseTypeSlug(location.pathname, 'executive-education-2u'),
  });

  const heading = useCourseRunCardHeading({
    isCourseRunCurrent,
    pacingType,
    start,
    isUserEnrolled,
  });
  const subHeading = useCourseRunCardSubHeading({
    isUserEnrolled,
    enrollmentCount,
  });
  const action = useCourseRunCardAction({
    isUserEnrolled,
    userEnrollment,
    courseRunUrl,
    courseTypeEnrollmentUrl,
    contentKey,
    subsidyAccessPolicy,
  });

  return {
    heading,
    subHeading,
    action,
  };
};

export default useCourseRunCardData;
