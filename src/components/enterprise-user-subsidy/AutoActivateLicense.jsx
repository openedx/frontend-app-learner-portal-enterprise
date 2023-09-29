import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { UserSubsidyContext } from './UserSubsidy';
import { LICENSE_STATUS } from './data/constants';

/**
 * Redirects users to the license activation page if they have an assigned license.
 */
const AutoActivateLicense = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const location = useLocation();

  if (!subscriptionLicense?.activationKey || subscriptionLicense?.status !== LICENSE_STATUS.ASSIGNED) {
    return null;
  }

  const activationPath = `/${enterpriseConfig.slug}/licenses/${subscriptionLicense.activationKey}/activate`;

  return (
    <Navigate to={{
      pathname: activationPath,
      state: {
        from: location.pathname,
      },
    }}
    />
  );
};

export default AutoActivateLicense;
