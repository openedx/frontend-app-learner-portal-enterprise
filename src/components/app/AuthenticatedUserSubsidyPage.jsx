import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';

const AuthenticatedUserSubsidyPage = ({ children }) => (
  <AuthenticatedPage>
    {children}
  </AuthenticatedPage>
);

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AuthenticatedUserSubsidyPage;
