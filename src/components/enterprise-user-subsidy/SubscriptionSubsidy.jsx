import React from 'react';
import PropTypes from 'prop-types';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { StatusAlert } from '@edx/paragon';

import {
  isDefinedAndNotNull,
  isNull,
  hasValidStartExpirationDates,
} from '../../utils/common';
import { useRenderContactHelpText } from '../../utils/hooks';
import { LICENSE_STATUS } from './data/constants';
import { hasValidSubscription } from './data/utils';

const statusAlertTypes = {
  invalidStartExpirationDate: 'invalidStartExpiration',
  noLicense: 'noLicense',
  notActivated: 'notActivated',
  revoked: 'revoked',
};

const SubscriptionSubsidy = ({
  enterpriseConfig, plan, license, offersCount,
}) => {
  const match = useRouteMatch(`/${enterpriseConfig.slug}`);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  if (!plan) {
    return null;
  }
  if (!hasValidSubscription(plan, license) && !offersCount) {
    if (!match.isExact) {
      return <Redirect to={`/${enterpriseConfig.slug}`} />;
    }
  }
  const getStatusAlertText = (textType) => {
    const contactHelpText = renderContactHelpText();
    switch (textType) {
      case statusAlertTypes.invalidStartExpirationDate:
        return `Your organization does not have an active subscription plan.
        Please ${contactHelpText} for further information.`;
      case statusAlertTypes.noLicense:
        return `You do not have an enterprise license assigned to you.
        Please ${contactHelpText} for further information.`;
      case statusAlertTypes.notActivated:
        return `Please activate your enterprise license from your email
        or ${contactHelpText} for further information.`;
      case statusAlertTypes.revoked:
        return `Your enterprise license is no longer active. Please ${contactHelpText} for
        further information. You may continue your learning journey by creating a personal
        account at <a className="text-underline" href="https://edx.org">edx.org</a>.`;
      default:
        return null;
    }
  };
  let alertText = null;
  let alertType = 'danger';
  if (!hasValidStartExpirationDates(plan)) {
    alertText = getStatusAlertText(statusAlertTypes.invalidStartExpirationDate);
  } else if (isNull(license)) {
    alertText = getStatusAlertText(statusAlertTypes.noLicense);
  } else if (isDefinedAndNotNull(license) && license.status !== LICENSE_STATUS.ACTIVATED) {
    if (license.status === LICENSE_STATUS.ASSIGNED) {
      alertText = getStatusAlertText(statusAlertTypes.notActivated);
      alertType = 'warning';
    }
    if (license.status === LICENSE_STATUS.REVOKED) {
      alertText = getStatusAlertText(statusAlertTypes.revoked);
    }
  }

  if (!alertText) {
    return null;
  }
  return (
    <div className="container-fluid mt-3">
      <StatusAlert
        alertType={alertType}
        className="mb-0"
        dialog={alertText}
        dismissible={false}
        open
      />
    </div>
  );
};

SubscriptionSubsidy.propTypes = {
  enterpriseConfig: PropTypes.shape({
    slug: PropTypes.string,
    contactEmail: PropTypes.string,
  }).isRequired,
  license: PropTypes.shape({
    status: PropTypes.string,
  }),
  plan: PropTypes.shape({
    startDate: PropTypes.string,
    expirationDate: PropTypes.string,
  }),
  offersCount: PropTypes.number.isRequired,
};

SubscriptionSubsidy.defaultProps = {
  license: undefined,
  plan: undefined,
};

export default SubscriptionSubsidy;
