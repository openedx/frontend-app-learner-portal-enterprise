/* eslint-disable import/no-extraneous-dependencies */
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import 'jest-localstorage-mock';

import matchMediaMock from 'match-media-mock';
import ResizeObserverPolyfill from 'resize-observer-polyfill';
import jestFetchMock from 'jest-fetch-mock';
import 'jest-canvas-mock';

import './components/app/data/services/data/__factories__';

import { configure } from 'enzyme';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';

configure({ adapter: new Adapter() });

process.env.LMS_BASE_URL = 'http://localhost:18000';
process.env.ECOMMERCE_BASE_URL = 'http://ecommerce.url';
process.env.MARKETING_SITE_BASE_URL = 'http://marketing.url';
process.env.LEARNER_SUPPORT_SPEND_ENROLLMENT_LIMITS_URL = 'http://limits.url';
process.env.LOGIN_URL = 'http://localhost:18000/login';
process.env.LOGOUT_URL = 'http://localhost:18000/logout';
process.env.REFRESH_ACCESS_TOKEN_ENDPOINT = 'http://localhost:18000/login_refresh';
process.env.ACCESS_TOKEN_COOKIE_NAME = 'edx-jwt-cookie-header-payload';
process.env.CSRF_TOKEN_API_PATH = '/csrf/api/v1/token';
process.env.BASE_URL = 'http://localhost:8734';
process.env.ENTERPRISE_ACCESS_BASE_URL = 'http://enterprise-access.url';

// testing utility to mock window width, etc.
global.window.matchMedia = matchMediaMock.create();

// structuredClone
global.structuredClone = val => JSON.parse(JSON.stringify(val));

jest.mock('@edx/frontend-platform/logging');
jest.mock('@edx/frontend-platform/analytics');

if (typeof global.window.URL.createObjectURL === 'undefined') {
  global.window.URL.createObjectURL = jest.fn();
}

// Upgrading to Node16 shows unhandledPromiseRejection warnings as errors so adding a handler
process.on('unhandledRejection', (reason, p) => {
  // eslint-disable-next-line no-console
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason.stack);
});

global.ResizeObserver = ResizeObserverPolyfill;

jestFetchMock.enableMocks();
