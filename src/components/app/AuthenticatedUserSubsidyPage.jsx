import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';
import {
  ActivateLicenseAlert,
  UserSubsidy,
} from '../enterprise-user-subsidy';

export default function AuthenticatedUserSubsidyPage({ children }) {
  return (
    <AuthenticatedPage>
      <UserSubsidy>
        <ActivateLicenseAlert />
        {children}
      </UserSubsidy>
    </AuthenticatedPage>
  );
}

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};
