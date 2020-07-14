import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { EnterpriseBanner } from '../enterprise-banner';
import { Layout } from '../layout';
import LicenseActivation from './LicenseActivation';

const LicenseActivationPage = () => (
  <EnterprisePage>
    <Layout>
      <EnterpriseBanner />
      <LicenseActivation />
    </Layout>
  </EnterprisePage>
);

export default LicenseActivationPage;
