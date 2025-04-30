import PropTypes from 'prop-types';

import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from '../../data/hooks';
import { EnrollButtonCta } from '../common';
import { useEnterpriseCourseEnrollments } from '../../../app/data';

// Data sharing consent
const ToDataSharingConsentPage = ({ courseRunKey, enrollLabel, enrollmentUrl }) => {
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();

  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    courseRunKey,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dsc.clicked',
  });
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    href: enrollmentUrl,
    courseRunKey,
    userEnrollments: enterpriseCourseEnrollments,
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      href={enrollmentUrl}
      onClick={(e) => {
        analyticsHandler(e);
        optimizelyHandler(e);
      }}
      block
    />
  );
};

ToDataSharingConsentPage.propTypes = {
  courseRunKey: PropTypes.string.isRequired,
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
