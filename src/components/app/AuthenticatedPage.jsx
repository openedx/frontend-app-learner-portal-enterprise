import React from 'react';
import PropTypes from 'prop-types';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';

export default function AuthenticatedPage({ children, useEnterpriseConfigCache }) {
  return (
    <LoginRedirect>
      <EnterprisePage useEnterpriseConfigCache={useEnterpriseConfigCache}>
        <Layout>
          <EnterpriseBanner />
          {children}
        </Layout>
      </EnterprisePage>
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
