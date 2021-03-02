import React from 'react';
import PropTypes from 'prop-types';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';

export default function AuthenticatedPage({ children, useCache }) {
  return (
    <LoginRedirect>
      <EnterprisePage useCache={useCache}>
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
  useCache: PropTypes.bool,
};

AuthenticatedPage.defaultProps = {
  useCache: true,
};
