import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import {
  APP_INIT_ERROR, APP_READY, initialize, subscribe,
} from '@edx/frontend-platform';
import { ErrorPage } from '@edx/frontend-platform/react';
import { mergeConfig } from '@edx/frontend-platform/config';
import messages from './i18n';

import { App } from './components/app';

import './styles/index.scss';

const container = document.getElementById('root');
const root = createRoot(container);

subscribe(APP_READY, () => {
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  handlers: {
    config: () => {
      mergeConfig({
        ENTERPRISE_ACCESS_BASE_URL: process.env.ENTERPRISE_ACCESS_BASE_URL || null,
        ENTERPRISE_CATALOG_API_BASE_URL: process.env.ENTERPRISE_CATALOG_API_BASE_URL || null,
        LICENSE_MANAGER_URL: process.env.LICENSE_MANAGER_URL || null,
        ALGOLIA_APP_ID: process.env.ALGOLIA_APP_ID || null,
        ALGOLIA_SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY || null,
        ALGOLIA_INDEX_NAME: process.env.ALGOLIA_INDEX_NAME || null,
        ALGOLIA_REPLICA_INDEX_NAME: process.env.ALGOLIA_REPLICA_INDEX_NAME || null,
        ALGOLIA_INDEX_NAME_JOBS: process.env.ALGOLIA_INDEX_NAME_JOBS || null,
        INTEGRATION_WARNING_DISMISSED_COOKIE_NAME: process.env.INTEGRATION_WARNING_DISMISSED_COOKIE_NAME || null,
        IS_MAINTENANCE_ALERT_ENABLED: process.env.IS_MAINTENANCE_ALERT_ENABLED || null,
        MAINTENANCE_ALERT_MESSAGE: process.env.MAINTENANCE_ALERT_MESSAGE || null,
        MAINTENANCE_ALERT_START_TIMESTAMP: process.env.MAINTENANCE_ALERT_START_TIMESTAMP || null,
        MAINTENANCE_ALERT_END_TIMESTAMP: process.env.MAINTENANCE_ALERT_END_TIMESTAMP || null,
        ENABLE_SKILLS_QUIZ: process.env.ENABLE_SKILLS_QUIZ || false,
        ENABLE_NOTICES: process.env.ENABLE_NOTICES || null,
        LEARNER_SUPPORT_URL: process.env.LEARNER_SUPPORT_URL || null,
        LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL: process.env.LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL || null,
        LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL: process.env.LEARNER_SUPPORT_ABOUT_DEACTIVATION_URL || null,
        LEARNER_SUPPORT_PACED_COURSE_MODE_URL: process.env.LEARNER_SUPPORT_PACED_COURSE_MODE_URL || null,
        GETSMARTER_STUDENT_TC_URL: process.env.GETSMARTER_STUDENT_TC_URL || null,
        GETSMARTER_PRIVACY_POLICY_URL: process.env.GETSMARTER_PRIVACY_POLICY_URL || null,
        GETSMARTER_LEARNER_DASHBOARD_URL: process.env.GETSMARTER_LEARNER_DASHBOARD_URL || null,
        FEATURE_CONTENT_HIGHLIGHTS: process.env.FEATURE_CONTENT_HIGHLIGHTS || null,
        FEATURE_ENABLE_EMET_REDEMPTION: process.env.FEATURE_ENABLE_EMET_REDEMPTION || null,
        ENTERPRISE_SUBSIDY_BASE_URL: process.env.ENTERPRISE_SUBSIDY_BASE_URL || null,
        EXPERIMENT_2_ID: process.env.EXPERIMENT_2_ID || null,
        EXPERIMENT_2_VARIANT_2_ID: process.env.EXPERIMENT_2_VARIANT_2_ID || null,
        FEATURE_ENABLE_RESTRICTED_RUNS: process.env.FEATURE_ENABLE_RESTRICTED_RUNS || null,
      });
    },
  },
  messages,
  // We don't require authenticated users so that we can perform our own auth redirect to a proxy login that depends on
  // the route, rather than the LMS like frontend-platform does.
  requireAuthenticatedUser: false,
  hydrateAuthenticatedUser: true,
});
