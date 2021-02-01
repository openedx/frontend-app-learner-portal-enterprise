import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';
import { Hyperlink } from '@edx/paragon';

import { SystemWideWarningBanner } from '../system-wide-banner';
import { SiteHeader } from '../site-header';
import { useStylesForCustomBrandColors } from './data/hooks';

import './styles/Layout.scss';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edX';

export default function Layout({ children }) {
  const { config, enterpriseConfig } = useContext(AppContext);
  const brandStyles = useStylesForCustomBrandColors(enterpriseConfig);

  return (
    <IntlProvider locale="en">
      <>
        <Helmet titleTemplate={TITLE_TEMPLATE} defaultTitle={DEFAULT_TITLE}>
          <html lang="en" />
          {brandStyles.map(({ key, styles }) => (
            <style key={key} type="text/css">{styles}</style>
          ))}
        </Helmet>
        {config?.SHOW_MAINTENANCE_ALERT && (
          <SystemWideWarningBanner>
            Some edX services will unavailable for a period of time due to planned maintenance Tuesday,
            February 2 between 8pm and 9pm EST. See our
            {' '}
            <Hyperlink target="_blank" href="https://status.edx.org/incidents/bcp3b0pcvlk4">
              status page
            </Hyperlink>
            {' '}
            for more information.
          </SystemWideWarningBanner>
        )}
        <SiteHeader />
        <main id="content">
          {children}
        </main>
        <SiteFooter />
      </>
    </IntlProvider>
  );
}

Layout.propTypes = {
  children: PropTypes.node.isRequired,
};
