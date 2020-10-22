import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';
import { UserSubsidy } from '../enterprise-user-subsidy';
import UserSubsidyAlerts from '../enterprise-user-subsidy/UserSubsidyAlerts';

export default function AuthenticatedUserSubsidyPage({ children }) {
  return (
    <AuthenticatedPage>
      <UserSubsidy>
        <UserSubsidyAlerts />
        {children}
      </UserSubsidy>
    </AuthenticatedPage>
  );
}

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};
