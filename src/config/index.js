import qs from 'query-string';
import { FEATURE_ENROLL_WITH_CODES } from './constants';

const hasFeatureFlagEnabled = (featureFlag) => {
  const { features } = qs.parse(window.location.search);
  return features && features.split(',').includes(featureFlag);
};

const configuration = {
  BASE_URL: process.env.BASE_URL,
  LMS_BASE_URL: process.env.LMS_BASE_URL,
  DISCOVERY_API_BASE_URL: process.env.DISCOVERY_API_BASE_URL,
  ENTERPRISE_CATALOG_API_BASE_URL: process.env.ENTERPRISE_CATALOG_API_BASE_URL,
  MARKETING_SITE_BASE_URL: process.env.MARKETING_SITE_BASE_URL,

  LOGIN_URL: process.env.LOGIN_URL,
  LOGOUT_URL: process.env.LOGOUT_URL,
  CSRF_TOKEN_API_PATH: process.env.CSRF_TOKEN_API_PATH,
  REFRESH_ACCESS_TOKEN_ENDPOINT: process.env.REFRESH_ACCESS_TOKEN_ENDPOINT,
  ACCESS_TOKEN_COOKIE_NAME: process.env.ACCESS_TOKEN_COOKIE_NAME,
  ECOMMERCE_BASE_URL: process.env.ECOMMERCE_BASE_URL,
  SEGMENT_KEY: process.env.SEGMENT_KEY,
  USER_INFO_COOKIE_NAME: process.env.USER_INFO_COOKIE_NAME,
  FULLSTORY_ORG_ID: process.env.FULLSTORY_ORG_ID,
  ALGOLIA: {
    APP_ID: process.env.ALGOLIA_APP_ID,
    SEARCH_API_KEY: process.env.ALGOLIA_SEARCH_API_KEY,
    INDEX_NAME: process.env.ALGOLIA_INDEX_NAME,
  },
  USE_API_CACHE: process.env.USE_API_CACHE,
};

const features = {
  ENROLL_WITH_CODES: process.env.FEATURE_ENROLL_WITH_CODES || hasFeatureFlagEnabled(FEATURE_ENROLL_WITH_CODES),
};

export { configuration, features };
