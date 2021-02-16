import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { AppContext } from '@edx/frontend-platform/react';
import { CourseContext } from '../../CourseContextProvider';
import { EnrollButtonCta } from '../common';
import { shouldUpgradeUserEnrollment, createCourseInfoUrl } from '../../data/utils';

import { enrollLinkClass } from '../constants';

/**
 * Renders a hyperlink to the course info url (or enrollment url)
 * Uses the passed in enroll label as the Label shown along with enroll link
 */
const ToCoursewarePage = ({
  enrollLabel, enrollmentUrl, userEnrollment, subscriptionLicense,
}) => {
  const { config } = useContext(AppContext);
  const { state: { activeCourseRun: { key: courseKey } } } = useContext(CourseContext);
  const courseInfoUrl = createCourseInfoUrl({ baseUrl: config.LMS_BASE_URL, courseKey });
  const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
    userEnrollment,
    subscriptionLicense,
    enrollmentUrl,
  });
  const landingUrl = shouldUseEnrollmentUrl ? enrollmentUrl : courseInfoUrl;

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      className={classNames(enrollLinkClass, 'btn-brand-primary')}
      href={landingUrl}
    />
  );
};

ToCoursewarePage.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
  userEnrollment: PropTypes.shape.isRequired,
  subscriptionLicense: PropTypes.shape.isRequired,
};

export default ToCoursewarePage;
