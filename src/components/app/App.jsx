import React from 'react';
import { Switch } from 'react-router-dom';
import { AppProvider, AuthenticatedPageRoute, PageRoute } from '@edx/frontend-platform/react';

import NotFoundPage from '../NotFoundPage';
import { EnterpriseCustomerRedirect } from '../enterprise-customer-redirect';
import { DashboardPage } from '../dashboard';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { LicenseActivationPage } from '../license-activation';

import store from '../../store';

export default function App() {
  return (
    <AppProvider store={store}>
      <Switch>
        <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
        <PageRoute exact path="/:enterpriseSlug/search" component={SearchPage} />
        <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
        <PageRoute exact path="/:enterpriseSlug/licenses/:activationKey/activate" component={LicenseActivationPage} />
        <AuthenticatedPageRoute exact path="/" component={EnterpriseCustomerRedirect} />
        <PageRoute path="*" component={NotFoundPage} />
      </Switch>
    </AppProvider>
  );
}
