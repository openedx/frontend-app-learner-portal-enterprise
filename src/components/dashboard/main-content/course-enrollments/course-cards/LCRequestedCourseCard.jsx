import { Button } from '@openedx/paragon';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import BaseCourseCard from './BaseCourseCard';
import { COURSE_STATUSES } from '../../../../../constants';

const LCRequestedCourseCard = (props) => {
  const renderButtons = () => (
    <Button
      className="btn-xs-block"
      disabled
    >
      <FormattedMessage
        id="enterprise.learner-portal.dashboard.courses.requested.requested.enroll"
        defaultMessage="Enroll"
        description="Button text for requested course card in disabled state"
      />
    </Button>
  );

  return (
    <BaseCourseCard
      type={COURSE_STATUSES.lcRequested}
      hasViewCertificateLink={false}
      buttons={renderButtons()}
      {...props}
    />
  );
};

export default LCRequestedCourseCard;
