import React, { Component } from 'react';
import { Helmet } from 'react-helmet';
import PropTypes from 'prop-types';
import { IntlProvider } from 'react-intl';
import SiteHeader from '@edx/frontend-component-site-header';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import EdXLogo from '../../assets/edx-logo.svg';

import './styles/Layout.scss';

class Layout extends Component {
  getUserMenuItems = () => {
    const { header: { userMenu } } = this.context;
    return userMenu || [];
  };

  getMainMenuItems = () => {
    const { header: { mainMenu } } = this.context;
    return mainMenu || [];
  };

  render() {
    const {
      siteUrl, siteName, children, headerLogo, footerLogo,
    } = this.props;

    const user = getAuthenticatedUser();
    const { username, profileImage } = user;

    return (
      <IntlProvider locale="en">
        <>
          <Helmet titleTemplate="%s - edX" defaultTitle="edX">
            <html lang="en" />
          </Helmet>
          <SiteHeader
            logo={headerLogo || EdXLogo}
            logoDestination={siteUrl}
            logoAltText={siteName}
            loggedIn={!!username}
            username={username}
            avatar={profileImage.imageUrlMedium}
            mainMenu={this.getMainMenuItems()}
            userMenu={this.getUserMenuItems()}
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
  }
}

Layout.contextType = AppContext;

Layout.defaultProps = {
  children: [],
  siteName: 'edX',
  siteUrl: 'https://edx.org/',
  headerLogo: null,
  footerLogo: null,
};

Layout.propTypes = {
  children: PropTypes.node,
  siteName: PropTypes.string,
  siteUrl: PropTypes.string,
  headerLogo: PropTypes.string,
  footerLogo: PropTypes.string,
};

export default Layout;
