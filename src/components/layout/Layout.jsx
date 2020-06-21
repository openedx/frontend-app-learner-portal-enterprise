import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import SiteHeader from '@edx/frontend-component-site-header';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';

import { useStylesForCustomBrandColors } from './data/hooks';

import EdXLogo from '../../assets/edx-logo.svg';
import './styles/Layout.scss';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edx';

export default function Layout({ children }) {
  const { enterpriseConfig, header } = useContext(AppContext);
  const brandStyles = useStylesForCustomBrandColors(enterpriseConfig);

  const user = getAuthenticatedUser();
  const { username, profileImage } = user;

  const getHeaderMenuItems = key => header[key] || [];

  return (
    <IntlProvider locale="en">
      <>
        <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
          <html lang="en" />
          {brandStyles.map(brandStyle => (
            <style type="text/css">{brandStyle}</style>
          ))}
        </Helmet>
        <SiteHeader
          logo={enterpriseConfig.branding.logo || EdXLogo}
          logoDestination={`${process.env.BASE_URL}/${enterpriseConfig.slug}`}
          logoAltText={`${enterpriseConfig.name} logo`}
          loggedIn={!!username}
          username={username}
          avatar={profileImage.imageUrlMedium}
          mainMenu={getHeaderMenuItems('mainMenu')}
          userMenu={getHeaderMenuItems('userMenu')}
          loggedOutItems={[]}
          skipNavId="content"
        />
        <main id="content">
          {children}
        </main>
        <SiteFooter
          logo="https://files.edx.org/openedx-logos/edx-openedx-logo-tag.png"
        />
      </>
    </IntlProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
