/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';

import React from 'react';
import ReactDOM from 'react-dom';
import {
  initialize, APP_INIT_ERROR, APP_READY, subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import { mergeConfig } from '@edx/frontend-platform/config';

import { App } from './components/app';

import './index.scss';

subscribe(APP_READY, () => {
  ReactDOM.render(<App />, document.getElementById('root'));
});

subscribe(APP_INIT_ERROR, (error) => {
  ReactDOM.render(<ErrorPage message={error.message} />, document.getElementById('root'));
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        USE_API_CACHE: process.env.USE_API_CACHE || null,
        ENTERPRISE_CATALOG_API_BASE_URL: process.env.ENTERPRISE_CATALOG_API_BASE_URL || null,
        LICENSE_MANAGER_URL: process.env.LICENSE_MANAGER_URL || null,
        ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID || null,
        ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY || null,
        ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME || null,
        INTEGRATION_WARNING_DISMISSED_COOKIE_NAME: process.env.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME || null,
        SHOW_MAINTENANCE_ALERT: process.env.SHOW_MAINTENANCE_ALERT,
        // Logs JS errors matching the following regex as NewRelic page actions instead of
        // errors,reducing JS error noise.
        IGNORED_ERROR_REGEX: '(Axios Error|\'removeChild\'|Script error|getReadModeExtract)',
        ENABLE_SKILLS_QUIZ: process.env.ENABLE_SKILLS_QUIZ || false,
      });
    },
  },
  messages: [],
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
