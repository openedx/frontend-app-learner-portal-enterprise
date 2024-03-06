import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';
import { fetchNotices } from './services';

const APP_CONFIG = {
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  LMS_BASE_URL: 'http://localhost:18000',
};
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  logError: jest.fn(),
  logInfo: jest.fn(),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedUser: jest.fn(() => ({ id: 12345 })),
  getAuthenticatedHttpClient: jest.fn(),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const NOTICES_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL }/notices/api/v1/unacknowledged`;

describe('fetchNotices', () => {
  it('returns empty data results', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, { results: [] });
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toBe(null);
  });
  it('returns notice redirect url', async () => {
    const exampleNoticeUrl = 'https://example.com';
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, { results: [exampleNoticeUrl] });
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toBe(`${exampleNoticeUrl}?next=${window.location.href}`);
  });
  it('calls logInfo on 404', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(404, {});
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toBe(null);
    expect(logInfo).toHaveBeenCalledTimes(1);
  });
  it('calls logError on 500', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(500, {});
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toBe(null);
    expect(logError).toHaveBeenCalledTimes(1);
  });
});
