import React, { useContext } from 'react';
import { Navigate, useLocation, useMatch } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { UserSubsidyContext } from './UserSubsidy';
import { LICENSE_STATUS } from './data/constants';

/**
 * Redirects users to the license activation page if they have an assigned license.
 *
 * TODO: move to route loader when we pick up work to migrate license activation route.
 */
const AutoActivateLicense = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const location = useLocation();

  const isLicenseActivationRouteMatch = useMatch('/:enterpriseSlug/licenses/:activationKey/activate');
  // If user is on the license activation page, do not redirect them to the
  // same license activation page again.
  if (isLicenseActivationRouteMatch) {
    return null;
  }

  // If the user does not have an assigned license or their license status is not assigned, do not redirect them.
  if (!subscriptionLicense?.activationKey || subscriptionLicense?.status !== LICENSE_STATUS.ASSIGNED) {
    return null;
  }

  // Redirect to license activation page.
  const activationPath = `/${enterpriseConfig.slug}/licenses/${subscriptionLicense.activationKey}/activate`;
  return (
    <Navigate
      to={activationPath}
      state={{
        from: location.pathname,
      }}
      replace
    />
  );
};

export default AutoActivateLicense;
