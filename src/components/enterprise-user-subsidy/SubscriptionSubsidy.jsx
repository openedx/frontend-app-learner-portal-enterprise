import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Redirect, useRouteMatch } from 'react-router-dom';
import { StatusAlert } from '@edx/paragon';
import { AppContext } from '@edx/frontend-platform/react';

import { useRenderContactHelpText } from './data/hooks';
import { LICENSE_STATUS } from './data/constants';

const SubscriptionSubsidy = ({ subscriptionLicense }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const match = useRouteMatch(`/${enterpriseConfig.slug}`);
  const renderContactHelpText = useRenderContactHelpText(enterpriseConfig);

  if (subscriptionLicense === null) {
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

  if (subscriptionLicense && subscriptionLicense.status !== LICENSE_STATUS.ACTIVATED) {
    if (!match.isExact) {
      return <Redirect to={`/${enterpriseConfig.slug}`} />;
    }
    return (
      <>
        {subscriptionLicense.status === LICENSE_STATUS.ASSIGNED && (
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
        {subscriptionLicense.status === LICENSE_STATUS.DEACTIVATED && (
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
  subscriptionLicense: PropTypes.shape(),
};

SubscriptionSubsidy.defaultProps = {
  subscriptionLicense: undefined,
};

export default SubscriptionSubsidy;
