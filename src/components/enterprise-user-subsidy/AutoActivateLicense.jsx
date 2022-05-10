import React, { useContext } from 'react';
import { Redirect, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { UserSubsidyContext } from './UserSubsidy';

/**
 * Redirects users to the license activation page if they have an assigned license.
 */
const AutoActivateLicense = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const location = useLocation();

  if (!subscriptionLicense?.activationKey || ['activated', 'revoked'].includes(subscriptionLicense?.status)) {
    return null;
  }

  const activationPath = `/${enterpriseConfig.slug}/licenses/${subscriptionLicense.activationKey}/activate`;

  return (
    <Redirect to={{
      pathname: activationPath,
      state: {
        from: location.pathname,
      },
    }}
    />
  );
};

export default AutoActivateLicense;
