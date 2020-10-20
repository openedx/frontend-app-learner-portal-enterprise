import React from 'react';

import Dashboard from './Dashboard';
import AuthenticatedUserSubsidyPage from '../app/AuthenticatedUserSubsidyPage';

export default function DashboardPage() {
  return (
    <AuthenticatedUserSubsidyPage>
      <Dashboard />
    </AuthenticatedUserSubsidyPage>
  );
}
