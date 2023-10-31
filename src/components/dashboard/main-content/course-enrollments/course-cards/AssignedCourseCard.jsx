import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Link } from 'react-router-dom';
import BaseCourseCard from './BaseCourseCard';

import { COURSE_STATUSES } from '../data';

const AssignedCourseCard = (props) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { courseKey } = props;

  const renderButtons = () => (
    <Button
      as={Link}
      to={`/${enterpriseConfig.slug}/course/${courseKey}`}
      className="btn-xs-block"
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
  linkToCourse: PropTypes.string.isRequired,
  courseKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  isRevoked: PropTypes.bool,
  courseStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  mode: PropTypes.string,
};

AssignedCourseCard.defaultProps = {
  endDate: null,
  isRevoked: false,
  startDate: null,
  mode: null,
};

export default AssignedCourseCard;
