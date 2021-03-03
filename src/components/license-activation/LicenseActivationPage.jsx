import React from 'react';

import LicenseActivation from './LicenseActivation';
import AuthenticatedPage from '../app/AuthenticatedPage';

const LicenseActivationPage = () => (
  <AuthenticatedPage useEnterpriseConfigCache={false}>
    <LicenseActivation />
  </AuthenticatedPage>

);

export default LicenseActivationPage;
