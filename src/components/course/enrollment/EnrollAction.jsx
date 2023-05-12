import React from 'react';
import PropTypes from 'prop-types';

import ToCoursewarePage from './components/ToCoursewarePage';
import ViewOnDashboard from './components/ViewOnDashboard';
import EnrollBtnDisabled from './components/DisabledEnroll';
import ToDataSharingConsentPage from './components/ToDataSharingConsent';
import ToEcomBasketPage from './components/ToEcomBasketPage';

import { enrollButtonTypes } from './constants';
import ToExecutiveEducation2UEnrollment from './components/ToExecutiveEducation2UEnrollment';

const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
  ENROLL_DISABLED,
  TO_DATASHARING_CONSENT,
  TO_ECOM_BASKET,
  HIDE_BUTTON,
  TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT,
} = enrollButtonTypes;

/**
 * Returns correct enroll button component as per the spec at:
 * https://openedx.atlassian.net/wiki/spaces/SOL/pages/2178875970/Enroll+Button+logic+for+Enterprise+Learner+Portal
 *
 * @param {object} args Arguments.
 * @param {string} args.enrollmentType type of enrollment
 * @param {string} args.enrollmentUrl url to go to, or null
 * @param {React.Component} args.enrollLabel label component to use.
 * @param {string} args.userEnrollment enrollment if applicable, or null.
 * @param {string} args.subscriptionLicense user license if applicable, or null.
 */
const EnrollAction = ({
  enrollmentType,
  enrollmentUrl,
  enrollLabel,
  userEnrollment,
  subscriptionLicense,
  courseRunPrice,
}) => {
  switch (enrollmentType) {
    case TO_COURSEWARE_PAGE: // scenario 1: already enrolled
      return (
        <ToCoursewarePage
          enrollLabel={enrollLabel}
          enrollmentUrl={enrollmentUrl}
          userEnrollment={userEnrollment}
          subscriptionLicense={subscriptionLicense}
        />
      );
      case VIEW_ON_DASHBOARD: // scenario 2: already enrolled
        return <ViewOnDashboard enrollLabel={enrollLabel} />;
      case ENROLL_DISABLED: // scenario 3 and 4: no enrollment possible
        return <EnrollBtnDisabled enrollLabel={enrollLabel} />;
      case TO_DATASHARING_CONSENT:
        return (
          <ToDataSharingConsentPage
            enrollLabel={enrollLabel}
            enrollmentUrl={enrollmentUrl}
          />
        );
      case TO_EXECUTIVE_EDUCATION_2U_ENROLLMENT:
        return (
          <ToExecutiveEducation2UEnrollment
            enrollmentUrl={enrollmentUrl}
          />
        );
      case TO_ECOM_BASKET:
          return (
            <ToEcomBasketPage
              enrollmentUrl={enrollmentUrl}
              enrollLabel={enrollLabel}
              courseRunPrice={courseRunPrice}
            />
          );
      case HIDE_BUTTON:
      default:
        return null;
  }
};

EnrollAction.propTypes = {
  enrollmentType: PropTypes.string.isRequired,
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string,
  userEnrollment: PropTypes.shape({}),
  subscriptionLicense: PropTypes.shape({}),
  courseRunPrice: PropTypes.number,
};

EnrollAction.defaultProps = {
  enrollmentUrl: null,
  userEnrollment: null,
  subscriptionLicense: null,
  courseRunPrice: 0,
};

export default EnrollAction;
