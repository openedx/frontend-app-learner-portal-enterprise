import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'universal-cookie';
import { LoginRedirect } from '@edx/frontend-enterprise-logistration';
import { getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getConfig } from '@edx/frontend-platform/config';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import LoginRefresh from './LoginRefresh';

export default function AuthenticatedPage({ children, useEnterpriseConfigCache }) {
  const config = getConfig();
  const user = getAuthenticatedUser();

  if (!user) {
    // if user is not authenticated, remove cookie that controls whether the user will see
    // the integration warning modal on their next visit. the expected behavior is to only
    // see the modal once per authenticated session.
    const cookies = new Cookies();
    cookies.remove(config.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME);
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
