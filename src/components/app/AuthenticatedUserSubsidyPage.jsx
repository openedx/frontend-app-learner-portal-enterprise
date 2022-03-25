import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';
import {
  AutoActivateLicense,
  UserSubsidy,
} from '../enterprise-user-subsidy';

export default function AuthenticatedUserSubsidyPage({ children }) {
  return (
    <AuthenticatedPage>
      <UserSubsidy>
        <AutoActivateLicense />
        {children}
      </UserSubsidy>
    </AuthenticatedPage>
  );
}

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};
