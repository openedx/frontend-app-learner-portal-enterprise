import React from 'react';

import AuthenticatedPage from '../app/AuthenticatedPage';
import LicenseActivation from './LicenseActivation';

const LicenseActivationPage = () => (
  <AuthenticatedPage useEnterpriseConfigCache={false}>
    <LicenseActivation />
  </AuthenticatedPage>
);

export default LicenseActivationPage;
