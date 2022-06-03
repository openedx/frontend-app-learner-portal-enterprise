import React from 'react';
import PropTypes from 'prop-types';

import AuthenticatedPage from './AuthenticatedPage';
import {
  AutoActivateLicense,
  UserSubsidy,
} from '../enterprise-user-subsidy';
import { SubsidyRequestsContextProvider } from '../enterprise-subsidy-requests';

export default function AuthenticatedUserSubsidyPage({ children }) {
  return (
    <AuthenticatedPage>
      <UserSubsidy>
        <SubsidyRequestsContextProvider>
          <AutoActivateLicense />
          {children}
        </SubsidyRequestsContextProvider>
      </UserSubsidy>
    </AuthenticatedPage>
  );
}

AuthenticatedUserSubsidyPage.propTypes = {
  children: PropTypes.node.isRequired,
};
