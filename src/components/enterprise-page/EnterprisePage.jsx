import React from 'react';
import PropTypes from 'prop-types';
import { useParams } from 'react-router-dom';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import { LoadingSpinner } from '../loading-spinner';
import NotFoundPage from '../NotFoundPage';

import { isDefined, isDefinedAndNull } from '../../utils/common';
import { useEnterpriseCustomerConfig } from './data/hooks';

export default function EnterprisePage({ children }) {
  const { enterpriseSlug } = useParams();
  const enterpriseConfig = useEnterpriseCustomerConfig(enterpriseSlug);

  const user = getAuthenticatedUser();
  const { username, profileImage } = user;

  // Render the app as loading while waiting on the configuration or additional user metadata
  if (!isDefined(enterpriseConfig) || !isDefined(profileImage)) {
    return (
      <div className="py-5">
        <LoadingSpinner screenReaderText="loading company details" />
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
          mainMenu: [
            {
              type: 'item',
              href: `/${enterpriseConfig.slug}/search`,
              content: 'Find a Course',
            },
            {
              type: 'item',
              href: 'https://support.edx.org/hc/en-us',
              content: 'Help',
            },
          ],
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

EnterprisePage.propTypes = {
  children: PropTypes.node.isRequired,
};
