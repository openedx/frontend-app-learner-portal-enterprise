import React from 'react';

import { EnterprisePage } from '../enterprise-page';
import { Layout } from '../layout';
import Dashboard from './Dashboard';

export default function DashboardPage() {
  return (
    <EnterprisePage>
      <Layout>
        <Dashboard />
      </Layout>
    </EnterprisePage>
  );
}
