import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import { LoginRedirect } from '../login-redirect';
import LicenseActivation from './LicenseActivation';

const LicenseActivationPage = () => (
  <LoginRedirect>
    <EnterprisePage>
      <Layout>
        <EnterpriseBanner />
        <LicenseActivation />
      </Layout>
    </EnterprisePage>
  </LoginRedirect>
);

export default LicenseActivationPage;
