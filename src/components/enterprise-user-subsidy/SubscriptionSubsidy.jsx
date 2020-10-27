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

const SubscriptionSubsidy = ({ enterpriseConfig, plan, license }) => {
  const match = useRouteMatch(`/${enterpriseConfig.slug}`);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  if (!plan) {
    return null;
  }
  if (!hasValidStartExpirationDates(plan)) {
    if (!match.isExact) {
      return <Redirect to={`/${enterpriseConfig.slug}`} />;
    }
  }

  if (isNull(license)) {
    if (!match.isExact) {
      return <Redirect to={`/${enterpriseConfig.slug}`} />;
    }
    return (
      <>
        <div className="container-fluid mt-3">
          <StatusAlert
            alertType="danger"
            className="mb-0"
            dialog={(
              <>
                You do not have an enterprise license assigned to you.
                Please {renderContactHelpText()} for further information.
              </>
            )}
            dismissible={false}
            open
          />
        </div>
      </>
    );
  }

  if (isDefinedAndNotNull(license) && license.status !== LICENSE_STATUS.ACTIVATED) {
    if (!match.isExact) {
      return <Redirect to={`/${enterpriseConfig.slug}`} />;
    }
    return (
      <>
        {license.status === LICENSE_STATUS.ASSIGNED && (
          <div className="container-fluid mt-3">
            <StatusAlert
              alertType="warning"
              className="mb-0"
              dialog={(
                <>
                  Please activate your enterprise license from your email
                  or {renderContactHelpText()} for further information.
                </>
              )}
              dismissible={false}
              open
            />
          </div>
        )}
        {license.status === LICENSE_STATUS.REVOKED && (
          <div className="container-fluid mt-3">
            <StatusAlert
              alertType="danger"
              className="mb-0"
              dialog={(
                <>
                  Your enterprise license is no longer active. Please {renderContactHelpText()} for
                  further information. You may continue your learning journey by creating a personal
                  account at <a className="text-underline" href="https://edx.org">edx.org</a>.
                </>
              )}
              dismissible={false}
              open
            />
          </div>
        )}
      </>
    );
  }

  return null;
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
};

SubscriptionSubsidy.defaultProps = {
  license: undefined,
  plan: undefined,
};

export default SubscriptionSubsidy;
