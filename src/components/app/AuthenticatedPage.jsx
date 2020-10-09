import React from 'react';
import PropTypes from 'prop-types';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';
import { UserSubsidy } from '../enterprise-user-subsidy';

export default function AuthenticatedPage({ children }) {
  return (
    <LoginRedirect>
      <EnterprisePage>
        <Layout>
          <UserSubsidy>
            <EnterpriseBanner />
            {children}
          </UserSubsidy>
        </Layout>
      </EnterprisePage>
    </LoginRedirect>
  );
}

AuthenticatedPage.propTypes = {
  children: PropTypes.node.isRequired,
};
