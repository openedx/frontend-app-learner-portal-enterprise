import React from 'react';
import AxiosMockAdapter from 'axios-mock-adapter';
import renderer from 'react-test-renderer';
import axios from 'axios';
import { mergeConfig, getConfig, setConfig } from '@edx/frontend-platform/config';
import { initializeMockApp, history } from '@edx/frontend-platform';
import { App } from './components/app';
import { delay } from './utils/common';
import {
  createCourseEnrollmentWithStatus,
} from './components/dashboard/main-content/course-enrollments/tests/enrollment-testutils';
import { COURSE_STATUSES } from './components/dashboard/main-content/course-enrollments/data';

// For modals
jest.mock('react-focus-on', () => ({
  FocusOn: (props) => {
    // eslint-disable-next-line
    const { children, ...otherProps } = props;
    return (
      <focus-on {...otherProps}>{children}</focus-on>
    );
  },
}));

jest.mock('react-dom', () => ({
  ...jest.requireActual('react-dom'),
  createPortal: jest.fn((element) => (
    <portal>{element}</portal>
  )),
}));

jest.unmock('@edx/frontend-platform/logging');
jest.unmock('@edx/frontend-platform/analytics');
jest.unmock('@edx/frontend-platform/auth');

const mergeTestConfig = () => mergeConfig({
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
  LOGIN_URL: `${process.env.LMS_BASE_URL}/login`,
  SENTRY_PROJECT_ENV_PREFIX: 'dojo-frontend-app-learner-portal',
  ACCESS_TOKEN_COOKIE_NAME: 'dojo-access-token',
  CREDENTIALS_BASE_URL: 'http://example-cred.com',
  CSRF_TOKEN_API_PATH: 'http://exaple-csrf-token-api.com',
  DISCOVERY_API_BASE_URL: 'http://exapmle-discovery-base-url.com',
  PUBLISHER_BASE_URL: 'http://example-publisher-url.com',
  ECOMMERCE_BASE_URL: 'http://example-ecomerce.com',
  IGNORED_ERROR_REGEX: '',
  LANGUAGE_PREFERENCE_COOKIE_NAME: 'dojo-language',
  STUDIO_BASE_URL: process.env.STUDIO_BASE_URL || null,
  ORDER_HISTORY_URL: 'http://example-order-history.com',
  REFRESH_ACCESS_TOKEN_ENDPOINT: '',
});

const axiosMock = new AxiosMockAdapter(axios);
const {
  ECOMMERCE_BASE_URL,
  LMS_BASE_URL,
  LICENSE_MANAGER_URL,
} = process.env;

const ENTERPRISE_SLUG = 'test-enterprise-id';
const ENTERPRISE_UUID = '55b3a044-c9f9-4550-9ce4-3ab366b2e9a6';
const SUBSCRIPTION_UUID = ENTERPRISE_UUID;
const ENTERPRISE_CUSTOMER_UUID = ENTERPRISE_UUID;
const ENTERPRISE_CATALOG_UUID = 'f62ce957-8f5a-452d-bc79-b5ef2651aab8';

const ENTERPRISE = {
  uuid: ENTERPRISE_UUID,
  name: 'Test Enterprise',
  slug: ENTERPRISE_SLUG,
  active: true,
  site: { domain: 'example.com', name: 'example.com' },
  enable_data_sharing_consent: true,
  enforce_data_sharing_consent: 'at_enrollment',
  branding_configuration: {
    enterprise_customer: ENTERPRISE_CUSTOMER_UUID,
    enterprise_slug: ENTERPRISE_SLUG,
    logo: 'http://localhost:18000/static/dojo-theme/images/logo.png',
    primary_color: '#00262B',
    secondary_color: '#EFF8FA',
    tertiary_color: '#0A7DA3',
  },
  enable_audit_enrollment: false,
  replace_sensitive_sso_username: false,
  enable_portal_code_management_screen: true,
  sync_learner_profile_data: false,
  enable_audit_data_reporting: false,
  enable_learner_portal: true,
  enable_portal_reporting_config_screen: true,
  enable_portal_saml_configuration_screen: true,
  enable_portal_subscription_management_screen: true,
  hide_course_original_price: false,
  enable_analytics_screen: false,
  enable_integrated_customer_learner_portal_search: true,
  enable_portal_lms_configurations_screen: true,
  sender_alias: null,
  identity_providers: [],
  enterprise_customer_catalogs: [ENTERPRISE_CATALOG_UUID],
  reply_to: null,
  enterprise_notification_banner: { title: '', text: '' },
  identity_provider: 'saml-test',
  hide_labor_market_data: false,
  contact_email: 'edx@example.com',
};

const ENTERPRISE_CUSTOMER_REPLY = {
  next: null,
  previous: null,
  count: 1,
  num_pages: 1,
  current_page: 1,
  start: 0,
  results: [ENTERPRISE],
};
axiosMock.onGet(new RegExp(`${LMS_BASE_URL}/enterprise/api/v1/enterprise-customer/*`))
  .reply(200, ENTERPRISE_CUSTOMER_REPLY);

const OFFER_ASSIGNMENT_SUMMARY_REPLY = {
  count: 0,
  current_page: 1,
  next: null,
  num_pages: 1,
  previous: null,
  results: [],
  start: 0,
};
axiosMock.onGet(new RegExp(`${ECOMMERCE_BASE_URL}/offer_assignment_summary/*`))
  .reply(200, OFFER_ASSIGNMENT_SUMMARY_REPLY);

const CATALOGS_REPLY = {
  enterprise_uuid: ENTERPRISE_UUID,
  programs: [],
  subscription_uuid: SUBSCRIPTION_UUID,
};
axiosMock.onGet(new RegExp(`${LMS_BASE_URL}/api/catalogs/*`))
  .reply(200, CATALOGS_REPLY);

const COURSE_ENROLLMENTS = [
  createCourseEnrollmentWithStatus(COURSE_STATUSES.inProgress),
  createCourseEnrollmentWithStatus(COURSE_STATUSES.completed),
  createCourseEnrollmentWithStatus(COURSE_STATUSES.upcoming),
];
const COURSE_ENROLLMENTS_REPLY = COURSE_ENROLLMENTS;
axiosMock.onGet(new RegExp(`${LMS_BASE_URL}/enterprise_learner_portal/api/v1/enterprise_course_enrollments/*`))
  .reply(200, COURSE_ENROLLMENTS_REPLY);

const PROGRAM_UUID = '82ac4932-d0e2-475a-9d03-877ef772e9ba';

const PROGRAM_ENROLLMENTS_REPLY = [{
  programUuid: PROGRAM_UUID,
  id: 1,
  enterpriseCourseEnrollments: COURSE_ENROLLMENTS,
}];
axiosMock.onGet(new RegExp(`${LMS_BASE_URL}/api/program-enrollment/user-enrollments/*`))
  .reply(200, PROGRAM_ENROLLMENTS_REPLY);

const CUSTOMER_AGREEMENT_UUID = '40d6bc62-c8bd-479f-a1c0-19de7cc8863d';

const SUBSCRIPTION_PLAN = {
  uuid: SUBSCRIPTION_UUID,
  is_active: true,
  title: 'title',
};

const CUSTOMER_AGREEMENT_REPLY = {
  count: 0,
  next: null,
  previous: null,
  results: [
    {
      uuid: CUSTOMER_AGREEMENT_UUID,
      disable_expiration_notifications: false,
      subscription_for_auto_applied_licenses: SUBSCRIPTION_UUID,
      subscriptions: [SUBSCRIPTION_PLAN],
    },
  ],
};

axiosMock.onGet(new RegExp(`${LICENSE_MANAGER_URL}/api/v1/customer-agreement/*`))
  .reply(200, CUSTOMER_AGREEMENT_REPLY);

const LICENSE_UUID = 'c493860a-f75a-4d6e-8b68-012788853f9f';

const LICENSE = {
  uuid: LICENSE_UUID,
  status: 'activated',
  subscription_plan_uuid: SUBSCRIPTION_UUID,
};

const LICENSE_REPLY = {
  results: [LICENSE],
};

axiosMock.onGet(new RegExp(`${LICENSE_MANAGER_URL}/api/v1/learner-licenses/*`))
  .reply(200, LICENSE_REPLY);

const LOADING_DELAY = 100;

const generateProfileImage = () => {
  const profileImage = { hasImage: false };
  const sizes = {
    largeUrlFull: 500,
    largeUrlLarge: 100,
    largeUrlMedium: 50,
    largeUrlSmall: 30,
  };

  Object.entries(sizes).forEach(([field, size]) => {
    profileImage[field] = `${LMS_BASE_URL}/static/images/profile/default_${size}.png`;
  });

  return profileImage;
};

const ENTERPRISE_LEARNER = {
  username: 'learner',
  name: 'john learner',
  roles: [],
  profileImage: generateProfileImage(),
};

jest.mock('./colors.scss', () => ({
  dark: 'grey',
  white: 'white',
  primary: 'blue',
  info100: 'blue',
  info500: 'blue',
}));

describe('[Smoke] Smoke test', () => {
  let prevConfig = {};

  afterAll(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    prevConfig = getConfig();
    mergeTestConfig();
  });

  afterEach(() => {
    setConfig(prevConfig);
  });

  it('Dashboard renders', async () => {
    history.push({ pathname: ENTERPRISE_SLUG });
    initializeMockApp({
      messages: [],
      authenticatedUser: ENTERPRISE_LEARNER,
    });

    await renderer.act(async () => {
      const tree = await renderer.create(<App />);
      await delay(LOADING_DELAY);

      expect(tree.toJSON()).toMatchSnapshot();
    });
  });
});
