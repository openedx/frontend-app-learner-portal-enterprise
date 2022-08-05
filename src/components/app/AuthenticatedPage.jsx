import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { useLocation } from 'react-router-dom';

import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';
import { Hyperlink } from '@edx/paragon';
import LoginRedirect from './LoginRedirect';
import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import LoginRefresh from './LoginRefresh';
import { ErrorPage } from '../error-page';

export default function AuthenticatedPage({ children, useEnterpriseConfigCache }) {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const enterpriseSlug = window.location.host.split('.')[0];
  const isLogoutWorkflow = params.get('logout');
  const config = getConfig();
  const user = getAuthenticatedUser();

  if (!user) {
    // if user is not authenticated, remove cookie that controls whether the user will see
    // the integration warning modal on their next visit. the expected behavior is to only
    // see the modal once per authenticated session.
    const cookies = new Cookies();
    cookies.remove(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);
  }

  // in the special case where there is not authenticated user and we are being told it's the logout
  // flow, we can show the logout message safely
  // not rendering the SiteFooter here since it looks like it requires additional setup
  // not available in the logged out state (errors with InjectIntl errors)
  if (!user && isLogoutWorkflow) {
    return (
      <ErrorPage title="You are now logged out." showSiteFooter={false}>
        Please log back in {' '}
        <Hyperlink destination={`${config.BASE_URL}/${enterpriseSlug}`}>
          here.
        </Hyperlink>
      </ErrorPage>
    );
  }
  return (
    <LoginRedirect>
      <LoginRefresh>
        <EnterprisePage useEnterpriseConfigCache={useEnterpriseConfigCache}>
          <Layout>
            <EnterpriseBanner />
            {children}
          </Layout>
        </EnterprisePage>
      </LoginRefresh>
    </LoginRedirect>
  );
}

AuthenticatedPage.propTypes = {
  children: PropTypes.node.isRequired,
  useEnterpriseConfigCache: PropTypes.bool,
};

AuthenticatedPage.defaultProps = {
  useEnterpriseConfigCache: true,
};
