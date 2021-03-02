import React from 'react';
import PropTypes from 'prop-types';

import ToCoursewarePage from './components/ToCoursewarePage';
import ViewOnDashboard from './components/ViewOnDashboard';
import EnrollBtnDisabled from './components/DisabledEnroll';
import ToDataSharingConsentPage from './components/ToDataSharingConsent';
import ToVoucherRedeemPage from './components/ToVoucherRedeemPage';
import ToEcomBasketPage from './components/ToEcomBasketPage';

import { enrollButtonTypes } from './constants';

const {
  TO_COURSEWARE_PAGE,
  VIEW_ON_DASHBOARD,
  ENROLL_DISABLED,
  TO_DATASHARING_CONSENT,
  TO_VOUCHER_REDEEM,
  TO_ECOM_BASKET,
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
      case TO_VOUCHER_REDEEM:
          return <ToVoucherRedeemPage enrollmentUrl={enrollmentUrl} enrollLabel={enrollLabel} />;
      case TO_ECOM_BASKET:
          return <ToEcomBasketPage enrollmentUrl={enrollmentUrl} enrollLabel={enrollLabel} />;
      default: return null;
  }
};

EnrollAction.defaultProps = {
  enrollmentUrl: null,
  userEnrollment: null,
  subscriptionLicense: null,
};

EnrollAction.propTypes = {
  enrollmentType: PropTypes.string.isRequired,
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string,
  userEnrollment: PropTypes.shape({}),
  subscriptionLicense: PropTypes.shape({}),
};

export default EnrollAction;
