import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import { identify } from 'react-fullstory';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import { isDefined, isDefinedAndNull, isDefinedAndNotNull } from '../../utils/common';
import {
  useEnterpriseCustomerConfig,
  useEnterpriseCustomerSubscriptionPlan,
} from './data/hooks';

const LINK_CLASS_NAME = 'nav-link';

export default function EnterprisePage({ children }) {
  const { enterpriseSlug } = useParams();
  const enterpriseConfig = useEnterpriseCustomerConfig(enterpriseSlug);
  const subscriptionPlan = useEnterpriseCustomerSubscriptionPlan(enterpriseConfig);

  const user = getAuthenticatedUser();
  const { userId, username, profileImage } = user;

  useEffect(
    () => {
      if (isDefinedAndNotNull(userId)) {
        identify(userId);
      }
    },
    [userId],
  );

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined(enterpriseConfig) || !isDefined(profileImage)) {
    return (
      <div className="container-fluid py-5">
        <LoadingSpinner screenReaderText="loading organization details" />
      </div>
    );
  }

  // We explicitly set enterpriseConfig to null if there is no configuration, the learner portal is
  // not enabled, or there was an error fetching the configuration. In all these cases, we want to 404.
  if (isDefinedAndNull(enterpriseConfig)) {
    return <NotFoundPage />;
  }

  return (
    <AppContext.Provider
      value={{
        header: {
          mainMenu: (
            <>
              <Link to={`/${enterpriseConfig.slug}`} className={LINK_CLASS_NAME}>
                Dashboard
              </Link>
              <Link to={`/${enterpriseConfig.slug}/search`} className={LINK_CLASS_NAME}>
                Find a Course
              </Link>
              <a href="https://support.edx.org/hc/en-us" className={LINK_CLASS_NAME}>
                Help
              </a>
            </>
          ),
          userMenu: [
            {
              type: 'item',
              href: `/${enterpriseConfig.slug}`,
              content: 'Dashboard',
            },
            {
              type: 'item',
              href: `${process.env.LMS_BASE_URL}/u/${username}`,
              content: 'My Profile',
            },
            {
              type: 'item',
              href: `${process.env.LMS_BASE_URL}/account/settings`,
              content: 'Account Settings',
            },
            {
              type: 'item',
              href: 'https://support.edx.org/hc/en-us',
              content: 'Help',
            },
            {
              type: 'item',
              href: process.env.LOGOUT_URL,
              content: 'Sign Out',
            },
          ],
        },
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
