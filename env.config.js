const config = {
  // Override default .env.development values
  ACCESS_TOKEN_COOKIE_NAME: 'stage-edx-jwt-cookie-header-payload',
  CREDENTIALS_BASE_URL: 'https://credentials.stage.edx.org',
  LMS_BASE_URL: 'https://courses.stage.edx.org',
  LOGIN_URL: 'https://courses.stage.edx.org/login',
  LOGOUT_URL: 'https://courses.stage.edx.org/logout',
  MARKETING_SITE_BASE_URL: 'https://stage.edx.org',
  ORDER_HISTORY_URL: 'https://orders.stage.edx.org/orders',
  ENTERPRISE_LEARNER_PORTAL_HOSTNAME: 'enterprise.stage.edx.org',
  REFRESH_ACCESS_TOKEN_ENDPOINT: 'https://courses.stage.edx.org/login_refresh',
};

export default config;
