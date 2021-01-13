import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { IntlProvider } from 'react-intl';
import SiteFooter from '@edx/frontend-component-footer';
import { AppContext } from '@edx/frontend-platform/react';

import { SiteHeader } from '../site-header';
import { useStylesForCustomBrandColors } from './data/hooks';

import './styles/Layout.scss';

export const TITLE_TEMPLATE = '%s - edX';
export const DEFAULT_TITLE = 'edX';

export default function Layout({ children }) {
  const { enterpriseConfig } = useContext(AppContext);
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
