import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Hyperlink } from '@edx/paragon';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContext } from '../../CourseContextProvider';
import { EnrollButtonCta } from '../common';
import { shouldUpgradeUserEnrollment, createCourseInfoUrl } from '../../data/utils';
import { useTrackSearchConversionClickHandler } from '../../data/hooks';

import { enrollLinkClass } from '../constants';

/**
 * Renders a hyperlink to the course info url (or enrollment url)
 * Uses the passed in enroll label as the Label shown along with enroll link
 */
const ToCoursewarePage = ({
  enrollLabel, enrollmentUrl, userEnrollment, subscriptionLicense,
}) => {
  const { config } = useContext(AppContext);
  const {
    state: {
      activeCourseRun: { key: courseKey },
    },
  } = useContext(CourseContext);
  const courseInfoUrl = createCourseInfoUrl({ baseUrl: config.LMS_BASE_URL, courseKey });
  const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
    userEnrollment,
    subscriptionLicense,
    enrollmentUrl,
  });
  const landingUrl = shouldUseEnrollmentUrl ? enrollmentUrl : courseInfoUrl;
  const handleClick = useTrackSearchConversionClickHandler({
    href: landingUrl,
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_courseware.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      className={classNames('btn btn-primary btn-brand-primary d-block', enrollLinkClass)}
      destination={landingUrl}
      as={Hyperlink}
      onClick={handleClick}
    />
  );
};

ToCoursewarePage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  userEnrollment: PropTypes.shape().isRequired,
  subscriptionLicense: PropTypes.shape(),
};

ToCoursewarePage.defaultProps = {
  subscriptionLicense: undefined,
};

export default ToCoursewarePage;
