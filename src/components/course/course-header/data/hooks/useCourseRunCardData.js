import { useLocation } from 'react-router-dom';

import useCourseRunCardHeading from './useCourseRunCardHeading';
import useCourseRunCardSubHeading from './useCourseRunCardSubHeading';
import useCourseRunCardAction from './useCourseRunCardAction';
import { getExternalCourseEnrollmentUrl } from '../../../enrollment/utils';
import { COURSE_AVAILABILITY_MAP } from '../../../../app/data';

/**
 * Gathers the data needed to render the `CourseRunCard` component.
 * @param {object} args
 * @param {object} args.course The course metadata.
 * @param {object} args.courseRun The course run metadata, including the key, availability,
 *  start date, pacing type, and enrollment count.
 * @param {object} args.userEnrollment The user's enrollment in the course run, if any.
 * @param {string} args.courseRunUrl The URL to the course run coureware page.
 * @param {object} args.subsidyAccessPolicy A redeemable subsidy access policy applicable to the course, if any.
 * @param {boolean} args.userCanRequestSubsidyForCourse Whether the user can request a subsidy for the course.
 * @returns An object containing the `heading, `subHeading`, and `action` data needed to render the `CourseRunCard`.
 */
const useCourseRunCardData = ({
  course,
  courseRun,
  userEnrollment,
  courseRunUrl,
  subsidyAccessPolicy,
  userCanRequestSubsidyForCourse,
}) => {
  const { pathname } = useLocation();
  const {
    key: contentKey,
    availability,
    enrollmentCount,
  } = courseRun;
  const isCourseRunCurrent = availability === COURSE_AVAILABILITY_MAP.CURRENT;
  const isUserEnrolled = !!userEnrollment;
  const externalCourseEnrollmentUrl = getExternalCourseEnrollmentUrl({
    currentRouteUrl: pathname,
    selectedCourseRunKey: courseRun.key,
  });

  // Get and return course run card data for display
  const heading = useCourseRunCardHeading({
    isCourseRunCurrent,
    course,
    courseRun,
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
    externalCourseEnrollmentUrl,
    contentKey,
    subsidyAccessPolicy,
    userCanRequestSubsidyForCourse,
    course,
  });

  return {
    heading,
    subHeading,
    action,
  };
};

export default useCourseRunCardData;
