import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Card } from '@edx/paragon';
import { CourseContext } from '../CourseContextProvider';

import { findUserEnrollmentForCourseRun } from '../data/utils';
import { useCourseRunCardData } from './data';

import DeprecatedCourseRunCard from './deprecated/CourseRunCard';

const CourseRunCard = ({ courseRun }) => {
  const { state: courseData } = useContext(CourseContext);
  const {
    userEnrollments,
    userSubsidyApplicableToCourse,
  } = courseData;

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
    userSubsidyApplicableToCourse,
    userEnrollment: userEnrollmentForCourseRun,
    // TODO: URL to courseware will get pulled from EMET `can_redeem` API instead during the redemption
    // flow. Without the API integration in place yet, temporarily uses `courseRunUrl` associated with
    // the user's enterprise enrollment record, which we already have the data for.
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
  // TODO: fill out the shape object
  courseRun: PropTypes.shape().isRequired,
};

CourseRunCard.Deprecated = DeprecatedCourseRunCard;

export default CourseRunCard;
