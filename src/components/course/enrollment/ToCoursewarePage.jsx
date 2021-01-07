import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { AppContext } from '@edx/frontend-platform/react';

import { EnrollButtonCta } from './common';
import { shouldUpgradeUserEnrollment } from '../data/utils';
import { enrollLinkClass } from '../data/constants';

// Courseware page
const ToCoursewarePage = ({
  enrollLabel, enrollmentUrl, courseKey, userEnrollment, subscriptionLicense,
}) => {
  const { config } = useContext(AppContext);
  const courseInfoUrl = `${config.LMS_BASE_URL}/courses/${courseKey}/info`;
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
  courseKey: PropTypes.string.isRequired,
  userEnrollment: PropTypes.shape.isRequired,
  subscriptionLicense: PropTypes.shape.isRequired,
};

export default ToCoursewarePage;
