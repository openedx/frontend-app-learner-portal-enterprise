import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';
import { CourseContext } from '../CourseContextProvider';

import { findUserEnrollmentForCourseRun } from '../data/utils';
import { useCourseRunCardData } from './data';

import DeprecatedCourseRunCard from './deprecated/CourseRunCard';

/**
 * React component that displays information about the course run and provides a CTA to allow the learner
 * to enroll in the course run or navigate to courseware.
 */
/* istanbul ignore next */
const CourseRunCard = ({
  courseRun,
  subsidyAccessPolicy,
}) => {
  const { state: courseData } = useContext(CourseContext);
  const { userEnrollments } = courseData;
  const userEnrollmentForCourseRun = findUserEnrollmentForCourseRun({
    userEnrollments,
    key: courseRun.key,
  });

  const {
    heading,
    subHeading,
    action,
  } = useCourseRunCardData({
    courseRun,
    subsidyAccessPolicy,
    userEnrollment: userEnrollmentForCourseRun,
    courseRunUrl: userEnrollmentForCourseRun?.courseRunUrl,
  });

  return (
    <Card>
      <Card.Section>
        <div className="text-center">
          <div className="h4 mb-0">{heading}</div>
          <p className="small">{subHeading}</p>
          {action}
        </div>
      </Card.Section>
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
  subsidyAccessPolicy: PropTypes.shape().isRequired,
};

/* istanbul ignore next */
CourseRunCard.Deprecated = DeprecatedCourseRunCard;

export default CourseRunCard;