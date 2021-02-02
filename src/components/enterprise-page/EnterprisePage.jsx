import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { identify } from 'react-fullstory';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext, ErrorPage } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import { isDefined, isDefinedAndNull, isDefinedAndNotNull } from '../../utils/common';
import {
  useEnterpriseCustomerConfig,
  useEnterpriseCustomerSubscriptionPlan,
} from './data/hooks';

export default function EnterprisePage({ children }) {
  const { enterpriseSlug } = useParams();
  const [enterpriseConfig, fetchError] = useEnterpriseCustomerConfig(enterpriseSlug);
  const subscriptionPlan = useEnterpriseCustomerSubscriptionPlan(enterpriseConfig);

  const user = getAuthenticatedUser();
  const { userId, profileImage } = user;

  useEffect(
    () => {
      if (isDefinedAndNotNull(userId)) {
        identify(userId);
      }
    },
    [userId],
  );

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined(enterpriseConfig) || !isDefined(subscriptionPlan) || !isDefined(profileImage)) {
    return (
      <div className="container-fluid py-5">
        <LoadingSpinner screenReaderText="loading organization details" />
      </div>
    );
  }

  if (fetchError) {
    return <ErrorPage message={fetchError.message} />;
  }

  if (isDefinedAndNull(enterpriseConfig)) {
    return <NotFoundPage />;
  }

  return (
    <AppContext.Provider
      value={{
        authenticatedUser: getAuthenticatedUser(),
        config: getConfig(),
        courseCards: {
          'in-progress': {
            settingsMenu: {
              hasMarkComplete: true,
            },
          },
        },
        enterpriseConfig,
        subscriptionPlan,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

EnterprisePage.propTypes = {
  children: PropTypes.node.isRequired,
};
