/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import {
  initialize,
  APP_INIT_ERROR,
  APP_READY,
  subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import React from 'react';
import ReactDOM from 'react-dom';

import { App } from './components/app';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  messages: [],
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  // TODO: Switch require auth'd user to false (so the above comment is true) once https://openedx.atlassian.net/browse/ENT-3141 is done
  requireAuthenticatedUser: true,
  hydrateAuthenticatedUser: true,
});
