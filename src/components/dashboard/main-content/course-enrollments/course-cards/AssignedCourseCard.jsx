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
    courseKey,
    isCancelledAssignment,
    isExpiredAssignment,
  } = props;

  const renderButtons = () => (
    <Button
      as={Link}
      to={`/${enterpriseConfig.slug}/course/${courseKey}`}
      className={classNames('btn-xs-block', { disabled: isCancelledAssignment || isExpiredAssignment })}
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
  courseKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isRevoked: PropTypes.bool,
  courseRunStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  linkToCourse: PropTypes.string.isRequired,
  mode: PropTypes.string,
  isCancelledAssignment: PropTypes.bool,
  isExpiredAssignment: PropTypes.bool,
};

AssignedCourseCard.defaultProps = {
  endDate: null,
  isRevoked: false,
  startDate: null,
  mode: null,
  isCancelledAssignment: false,
  isExpiredAssignment: false,
};

export default AssignedCourseCard;
