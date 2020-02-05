import React, { useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { AppProvider } from '@edx/frontend-platform/react';

import { DashboardPage } from '../dashboard';

import store from '../../store';

import '../../assets/favicon.ico';

function App() {
  return (
    <AppProvider store={store}>
      <Switch>
        <Route path="/:enterpriseSlug" component={DashboardPage} />
      </Switch>
    </AppProvider>
  );
}

export default App;
