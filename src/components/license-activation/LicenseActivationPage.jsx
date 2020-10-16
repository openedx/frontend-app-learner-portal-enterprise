import React from 'react';

import LicenseActivation from './LicenseActivation';
import AuthenticatedPage from '../app/AuthenticatedPage';

const LicenseActivationPage = () => (
  <AuthenticatedPage>
    <LicenseActivation />
  </AuthenticatedPage>

);

export default LicenseActivationPage;
