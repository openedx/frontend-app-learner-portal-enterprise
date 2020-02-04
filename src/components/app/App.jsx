import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { Provider } from 'react-redux';

import { DashboardPage } from '../dashboard';

import store from '../../store';

import '../../assets/favicon.ico';
// import '../../index.scss';

export default function App() {
  return (
    // TODO: Switch to AppProvider but there is some error there
    <Provider store={store}>
      <Router>
        <Switch>
          <Route path="/:enterpriseSlug" component={DashboardPage} />
        </Switch>
      </Router>
    </Provider>
  );
}
