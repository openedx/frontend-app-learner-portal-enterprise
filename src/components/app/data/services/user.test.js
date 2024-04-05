import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError, logInfo } from '@edx/frontend-platform/logging';

import { fetchLearnerSkillLevels, fetchNotices, fetchUserEntitlements } from './user';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const APP_CONFIG = {
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  LMS_BASE_URL: 'http://localhost:18000',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  logError: jest.fn(),
  logInfo: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('fetchNotices', () => {
  const NOTICES_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL }/notices/api/v1/unacknowledged`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each([
    {
      mockResponse: { results: [] },
    },
    {
      mockResponse: null,
    },
  ])('returns empty data results (%s)', async ({ mockResponse }) => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, mockResponse);
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toEqual(null);
  });

  it('returns notice redirect url', async () => {
    const exampleNoticeUrl = 'https://example.com';
    axiosMock.onGet(NOTICES_ENDPOINT).reply(200, { results: [exampleNoticeUrl] });
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toEqual(`${exampleNoticeUrl}?next=${window.location.href}`);
  });

  it('calls logInfo on 404', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(404, {});
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toEqual(null);
    expect(logInfo).toHaveBeenCalledTimes(1);
  });

  it('calls logError on 500', async () => {
    axiosMock.onGet(NOTICES_ENDPOINT).reply(500, {});
    const noticeRedirectUrl = await fetchNotices();
    expect(noticeRedirectUrl).toEqual(null);
    expect(logError).toHaveBeenCalledTimes(1);
  });
});

describe('fetchUserEntitlements', () => {
  const ENTITLEMENTS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/entitlements/v1/entitlements/`;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns user entitlements', async () => {
    const mockEntitlements = { results: [] };
    axiosMock.onGet(ENTITLEMENTS_ENDPOINT).reply(200, mockEntitlements);
    const entitlements = await fetchUserEntitlements();
    expect(entitlements).toEqual(mockEntitlements.results);
  });
});

describe('fetchLearnerSkillLevels', () => {
  const SKILL_LEVEL_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/user/v1/skill_level/123/`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns skill levels', async () => {
    const mockSkillLevels = { results: [] };
    axiosMock.onGet(SKILL_LEVEL_ENDPOINT).reply(200, mockSkillLevels);
    const skillLevels = await fetchLearnerSkillLevels(123);
    expect(skillLevels).toEqual(mockSkillLevels);
  });
});
