import React, { useContext } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import SiteHeader from '@edx/frontend-component-site-header';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import EdXLogo from '../../assets/edx-logo.svg';
import './styles/Layout.scss';

const Layout = ({
  children,
  headerLogo,
  footerLogo,
}) => {
  const context = useContext(AppContext);
  const { pageContext } = context;

  const user = getAuthenticatedUser();
  const { username, profileImage } = user;

  function getHeaderMenuItems(key) {
    const { header } = context;
    return header[key] || [];
  }

  return (
    <IntlProvider locale="en">
      <>
        <Helmet titleTemplate="%s - edX" defaultTitle="edX">
          <html lang="en" />
        </Helmet>
        <SiteHeader
          logo={headerLogo || EdXLogo}
          logoDestination={`${process.env.BASE_URL}/${pageContext.enterpriseSlug}`}
          logoAltText={pageContext.enterpriseName}
          loggedIn={!!username}
          username={username}
          avatar={profileImage.imageUrlMedium}
          mainMenu={getHeaderMenuItems('mainMenu')}
          userMenu={getHeaderMenuItems('userMenu')}
          loggedOutItems={[
            { type: 'item', href: '#', content: 'Login' },
            { type: 'item', href: '#', content: 'Sign Up' },
          ]}
          skipNavId="content"
        />
        <main id="content">
          {children}
        </main>
        <SiteFooter logo={footerLogo || EdXLogo} />
      </>
    </IntlProvider>
  );
};

Layout.defaultProps = {
  children: [],
  headerLogo: null,
  footerLogo: null,
};

Layout.propTypes = {
  children: PropTypes.node,
  headerLogo: PropTypes.string,
  footerLogo: PropTypes.string,
};

export default Layout;
