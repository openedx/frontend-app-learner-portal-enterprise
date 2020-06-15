import React from 'react';
import { Switch } from 'react-router-dom';
import { AppProvider, PageRoute } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';
import NotFoundPage from '../NotFoundPage';
import { CoursePage } from '../course';
import { SearchPage } from '../search';

import store from '../../store';

import '../../assets/favicon.ico';

export default function App() {
  return (
    <AppProvider store={store}>
      <Switch>
        <PageRoute exact path="/:enterpriseSlug" component={DashboardPage} />
        <PageRoute exact path="/:enterpriseSlug/search" component={SearchPage} />
        <PageRoute exact path="/:enterpriseSlug/course/:courseKey" component={CoursePage} />
        <PageRoute path="*" component={NotFoundPage} />
      </Switch>
    </AppProvider>
  );
}
