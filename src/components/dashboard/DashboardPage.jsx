import React from 'react';

import Dashboard from './Dashboard';
import AuthenticatedPage from '../app/AuthenticatedPage';

export default function DashboardPage() {
  return (
    <AuthenticatedPage>
      <Dashboard />
    </AuthenticatedPage>
  );
}
