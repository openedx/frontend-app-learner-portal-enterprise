import PropTypes from 'prop-types';

import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from '../../data/hooks';
import { EnrollButtonCta } from '../common';
import { useCourseMetadata, useEnterpriseCourseEnrollments } from '../../../app/data';

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => {
  const {
    data: {
      activeCourseRun: { key: courseRunKey },
    },
  } = useCourseMetadata();
  const { data: { enterpriseCourseEnrollments } } = useEnterpriseCourseEnrollments();

  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
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
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
