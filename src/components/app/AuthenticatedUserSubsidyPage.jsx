import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';
import { AutoActivateLicense } from '../enterprise-user-subsidy';

const AuthenticatedUserSubsidyPage = ({ children }) => (
  <AuthenticatedPage>
    <AutoActivateLicense />
    {children}
  </AuthenticatedPage>
);

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthenticatedUserSubsidyPage;
