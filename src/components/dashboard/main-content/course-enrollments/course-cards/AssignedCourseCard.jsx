import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import BaseCourseCard from './BaseCourseCard';
import { COURSE_STATUSES } from '../data';

const AssignedCourseCard = (props) => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    // Note: we are using `courseRunId` instead of `contentKey` or `courseKey` because the `CourseSection`
    // and `BaseCourseCard` components expect `courseRunId` to be used as the content identifier. Consider
    // refactoring to rename `courseRunId` to `contentKey` in the future given learner content assignments
    // are for top-level courses, not course runs.
    courseRunId: courseKey,
    isCanceledAssignment,
    isExpiredAssignment,
  } = props;

  const renderButtons = () => (
    <Button
      as={Link}
      to={`/${enterpriseConfig.slug}/course/${courseKey}`}
      className={classNames('btn-xs-block', { disabled: isCanceledAssignment || isExpiredAssignment })}
      // TODO: Not all assignment cards are rendered with a darker background (e.g., external courses
      // such as Executive Education) should use the inverse-brand variant while Open Courses (with white
      // background) should be using the brand variant.
      variant="inverse-brand"
    >
      Enroll
    </Button>
  );

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      type={COURSE_STATUSES.assigned}
      hasViewCertificateLink={false}
      canUnenroll={false}
      {...props}
    />
  );
};

AssignedCourseCard.propTypes = {
  courseRunId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isRevoked: PropTypes.bool,
  courseRunStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  mode: PropTypes.string,
  isCanceledAssignment: PropTypes.bool,
  isExpiredAssignment: PropTypes.bool,
};

AssignedCourseCard.defaultProps = {
  endDate: null,
  isRevoked: false,
  startDate: null,
  mode: null,
  isCanceledAssignment: false,
  isExpiredAssignment: false,
};

export default AssignedCourseCard;
