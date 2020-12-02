import React from 'react';
import { Switch } from 'react-router-dom';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';
import FullStory from 'react-fullstory';

import { DashboardPage } from '../dashboard';
import NotFoundPage from '../NotFoundPage';
import { CoursePage } from '../course';
import { SearchPage } from '../search';
import { LicenseActivationPage } from '../license-activation';

import store from '../../store';

import '../../assets/favicon.ico';

export default function App() {
  const { FULLSTORY_ORG_ID } = getConfig();
  return (
    <AppProvider store={store}>
      {FULLSTORY_ORG_ID && (
        <FullStory org={FULLSTORY_ORG_ID} />
      )}
      <Switch>
        <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
        <PageRoute exact path="/:enterpriseSlug/search" component={SearchPage} />
        <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
        <PageRoute exact path="/:enterpriseSlug/licenses/:activationKey/activate" component={LicenseActivationPage} />
        <PageRoute path="*" component={NotFoundPage} />
      </Switch>
    </AppProvider>
  );
}
