import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Card } from '@openedx/paragon';

import { findUserEnrollmentForCourseRun } from '../data/utils';
import { useCourseRunCardData } from './data';
import CourseRunCardStatus from './CourseRunCardStatus';
import { useCourseMetadata, useEnterpriseCourseEnrollments } from '../../app/data';
import {
  useCanUserRequestSubsidyForCourse,
  useUserSubsidyApplicableToCourse,
  useUserHasLearnerCreditRequestForCourse,
  useUserHasSubsidyRequestForCourse,
} from '../data';

/**
 * React component that displays information about the course run and provides a CTA to allow the learner
 * to enroll in the course run or navigate to courseware.
 */
const CourseRunCard = ({ courseRun }) => {
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();
  const { data: courseMetadata } = useCourseMetadata();
  const {
    missingUserSubsidyReason,
  } = useUserSubsidyApplicableToCourse();
  const userCanRequestSubsidyForCourse = useCanUserRequestSubsidyForCourse();
  const userHasSubsidyRequestForCourse = useUserHasSubsidyRequestForCourse(courseMetadata.key);
  const userHasLearnerCreditRequest = useUserHasLearnerCreditRequestForCourse(courseMetadata.key, ['requested']);

  const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
    userEnrollments: enterpriseCourseEnrollments,
    key: courseRun.key,
  });

  const {
    heading,
    subHeading,
    action,
  } = useCourseRunCardData({
    course: courseMetadata,
    courseRun,
    userEnrollment: userEnrollmentForCourseRun,
    courseRunUrl: userEnrollmentForCourseRun?.linkToCourse,
    userCanRequestSubsidyForCourse,
  });

  return (
    <Card>
      <Card.Section className="text-center">
        <div className="h4 mb-0">{heading}</div>
        <p
          className={classNames('small', {
            'mb-0': userCanRequestSubsidyForCourse,
          })}
        >
          {subHeading}
        </p>
        {action}
      </Card.Section>
      <CourseRunCardStatus
        isUserEnrolled={!!userEnrollmentForCourseRun}
        missingUserSubsidyReason={missingUserSubsidyReason}
        userCanRequestSubsidyForCourse={userCanRequestSubsidyForCourse}
        userHasLearnerCreditRequest={userHasLearnerCreditRequest}
        userHasSubsidyRequestForCourse={userHasSubsidyRequestForCourse}
      />
    </Card>
  );
};

CourseRunCard.propTypes = {
  courseRun: PropTypes.shape({
    key: PropTypes.string,
    availability: PropTypes.string,
    start: PropTypes.string,
    pacingType: PropTypes.string,
    enrollmentCount: PropTypes.number,
  }).isRequired,
};

export default CourseRunCard;
