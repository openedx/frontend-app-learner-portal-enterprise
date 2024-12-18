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
  isRevoked: PropTypes.bool,
  courseRunStatus: PropTypes.string.isRequired,
  endDate: PropTypes.string,
  startDate: PropTypes.string,
  mode: PropTypes.string,
};

RequestedCourseCard.defaultProps = {
  linkToCertificate: null,
  endDate: null,
  isRevoked: false,
  startDate: null,
  mode: null,
};

export default RequestedCourseCard;
