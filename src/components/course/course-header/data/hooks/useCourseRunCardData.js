import { COURSE_AVAILABILITY_MAP } from '../../../data/constants';
import useCourseRunCardHeading from './useCourseRunCardHeading';
import useCourseRunCardSubHeading from './useCourseRunCardSubHeading';
import useCourseRunCardAction from './useCourseRunCardAction';

/**
 * TODO
 * @param {*} param0
 * @returns
 */
const useCourseRunCardData = ({
  courseRun,
  userEnrollment,
  courseRunUrl,
  userSubsidyApplicableToCourse,
}) => {
  const {
    key: contentKey,
    availability,
    start,
    pacingType,
    enrollmentCount,
  } = courseRun;
  const isCourseRunCurrent = availability === COURSE_AVAILABILITY_MAP.CURRENT;
  const isUserEnrolled = !!userEnrollment;

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
    contentKey,
    userSubsidyApplicableToCourse,
  });

  return {
    heading,
    subHeading,
    action,
  };
};

export default useCourseRunCardData;
