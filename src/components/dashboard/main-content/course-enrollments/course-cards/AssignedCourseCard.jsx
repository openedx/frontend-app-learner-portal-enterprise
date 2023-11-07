import React, { useContext } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { Link } from 'react-router-dom';
import BaseCourseCard from './BaseCourseCard';

import { COURSE_STATUSES } from '../data';
import dayjs from '../../../../../utils/dayjs';

const AssignedCourseCard = (props) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { courseId } = props;

  const renderButtons = () => (
    <Button
      as={Link}
      to={`/${enterpriseConfig.enterpriseSlug}/course/${courseId}`}
      className="btn-xs-block"
      variant="brand"
    >
      Enroll
    </Button>
  );
  const { startDate } = props;
  const formattedStartDate = startDate ? dayjs(startDate).format('MMMM Do, YYYY') : null;

  const miscText = () => (
    <small className="text-gray-500 font-weight-bold">
      This course has been assigned to you by your learning administrator.&nbsp;&nbsp;
      {formattedStartDate && `Start date - ${formattedStartDate}`}
    </small>
  );

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      type={COURSE_STATUSES.assigned}
      hasViewCertificateLink={false}
      miscText={miscText()}
      canUnenroll={false}
      {...props}
    />
  );
};

AssignedCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseId: PropTypes.string.isRequired,
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

AssignedCourseCard.contextType = AppContext;

export default AssignedCourseCard;
