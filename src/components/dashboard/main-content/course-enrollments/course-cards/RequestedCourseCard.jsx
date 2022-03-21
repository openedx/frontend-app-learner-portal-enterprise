import React from 'react';
import PropTypes from 'prop-types';

import BaseCourseCard from './BaseCourseCard';

import { COURSE_STATUSES } from '../data/constants';

const RequestedCourseCard = (props) => (
  <BaseCourseCard
    type={COURSE_STATUSES.requested}
    hasViewCertificateLink={false}
    {...props}
  />
);

RequestedCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
  courseRunId: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  linkToCertificate: PropTypes.string,
  isRevoked: PropTypes.bool.isRequired,
  courseRunStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
};

RequestedCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
};

export default RequestedCourseCard;
