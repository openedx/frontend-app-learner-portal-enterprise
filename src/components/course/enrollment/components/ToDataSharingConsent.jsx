import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Hyperlink } from '@edx/paragon';

import {
  useOptimizelyEnrollmentClickHandler,
  useTrackSearchConversionClickHandler,
} from '../../data/hooks';
import { enrollLinkClass } from '../constants';
import { EnrollButtonCta } from '../common';
import { CourseContext } from '../../CourseContextProvider';
import { CourseEnrollmentsContext } from '../../../dashboard/main-content/course-enrollments/CourseEnrollmentsContextProvider';

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => {
  const {
    state: {
      activeCourseRun: { key: courseRunKey },
    },
  } = useContext(CourseContext);
  const {
    courseEnrollmentsByStatus,
  } = useContext(CourseEnrollmentsContext);

  const analyticsHandler = useTrackSearchConversionClickHandler({
    href: enrollmentUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dsc.clicked',
  });
  const optimizelyHandler = useOptimizelyEnrollmentClickHandler({
    href: enrollmentUrl,
    courseRunKey,
    courseEnrollmentsByStatus,
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Hyperlink}
      className={classNames('btn btn-primary btn-brand-primary d-block', enrollLinkClass)}
      destination={enrollmentUrl}
      onClick={(e) => {
        analyticsHandler(e);
        optimizelyHandler(e);
      }}
    />
  );
};

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToDataSharingConsentPage;
