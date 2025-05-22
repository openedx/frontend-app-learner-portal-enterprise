import PropTypes from 'prop-types';
import { Button } from '@openedx/paragon';
import { Link } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import BaseCourseCard from './BaseCourseCard';
import { COURSE_STATUSES } from '../../../../../constants';

const ApprovedCourseCard = (props) => {
  const {
    linkToCourse,
  } = props;
  const renderButtons = () => (
    <Button
      as={Link}
      to={linkToCourse}
      className="btn-xs-block"
      variant="inverse-brand"
    >
      <FormattedMessage
        id="enterprise.learner.portal.dashboard.courses.assignments.assignment.enroll"
        defaultMessage="Enroll"
        description="Button text for approved course card to go to course about page to continue with enrollment"
      />
    </Button>
  );

  return (
    <BaseCourseCard
      buttons={renderButtons()}
      type={COURSE_STATUSES.approved}
      hasViewCertificateLink={false}
      canUnenroll={false}
      externalCourseLink={false}
      {...props}
    />
  );
};

ApprovedCourseCard.propTypes = {
  linkToCourse: PropTypes.string.isRequired,
};

export default ApprovedCourseCard;
