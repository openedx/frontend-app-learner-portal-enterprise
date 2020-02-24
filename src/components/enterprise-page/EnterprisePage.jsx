import React from 'react';
import PropTypes from 'prop-types';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

const EnterprisePage = ({
  children,
  pageContext,
}) => {
  const user = getAuthenticatedUser();
  const { username } = user;
  return (
    <AppContext.Provider
      value={{
        header: {
          mainMenu: [
            {
              type: 'item',
              href: process.env.CATALOG_BASE_URL,
              content: 'Catalog',
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
              href: process.env.LMS_BASE_URL,
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
              href: `${process.env.ORDERS_MFE_URL}/orders`,
              content: 'Order History',
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
        pageContext,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

EnterprisePage.propTypes = {
  children: PropTypes.element.isRequired,
  pageContext: PropTypes.shape({
    pageType: PropTypes.string,
    pageBranding: PropTypes.shape({}),
    enterpriseName: PropTypes.string,
    enterpriseUUID: PropTypes.string,
    enterpriseEmail: PropTypes.string,
  }).isRequired,
};

export default EnterprisePage;
