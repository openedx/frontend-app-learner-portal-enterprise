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
import { SentryLoggingService } from './services';

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
        ENTERPRISE_ACCESS_BASE_URL: process.env.ENTERPRISE_ACCESS_BASE_URL || null,
        ENTERPRISE_CATALOG_API_BASE_URL: process.env.ENTERPRISE_CATALOG_API_BASE_URL || null,
        LICENSE_MANAGER_URL: process.env.LICENSE_MANAGER_URL || null,
        ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID || null,
        ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY || null,
        ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME || null,
        ALGOLIA_INDEX_NAME_JOBS: process.env.ALGOLIA_INDEX_NAME_JOBS || null,
        INTEGRATION_WARNING_DISMISSED_COOKIE_NAME: process.env.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME || null,
        IS_MAINTENANCE_ALERT_ENABLED: process.env.IS_MAINTENANCE_ALERT_ENABLED || null,
        MAINTENANCE_ALERT_MESSAGE: process.env.MAINTENANCE_ALERT_MESSAGE || null,
        MAINTENANCE_ALERT_START_TIMESTAMP: process.env.MAINTENANCE_ALERT_START_TIMESTAMP || null,
        ENABLE_SKILLS_QUIZ: process.env.ENABLE_SKILLS_QUIZ || false,
        ENABLE_NOTICES: process.env.ENABLE_NOTICES || null,
        LEARNER_SUPPORT_URL: process.env.LEARNER_SUPPORT_URL || null,
        SENTRY_DSN: process.env.SENTRY_DSN || null,
        SENTRY_ENVIRONMENT: process.env.SENTRY_ENVIRONMENT || '',
        SENTRY_PROJECT_ENV_PREFIX: 'dojo-frontend-app-learner-portal',
      });
    },
  },
  loggingService: SentryLoggingService,
  messages: [],
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
