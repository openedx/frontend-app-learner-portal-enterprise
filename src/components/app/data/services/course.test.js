import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchCanRedeem, fetchCourseMetadata } from './course';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockCourseKey = 'edX+DemoX';
const mockCourseKeyTwo = 'edX+DemoZ';
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
  configure: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  configure: jest.fn(),
  getLoggingService: jest.fn(),
}));

describe('fetchCourseMetadata', () => {
  const CONTENT_METADATA_URL = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${mockEnterpriseId}/content-metadata/${mockCourseKey}/?`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('returns course metadata', async () => {
    const courseMetadata = {
      key: mockCourseKey,
      title: 'edX Demonstration Course',
    };
    axiosMock.onGet(CONTENT_METADATA_URL).reply(200, courseMetadata);
    const result = await fetchCourseMetadata(mockEnterpriseId, mockCourseKey);
    expect(result).toEqual(courseMetadata);
  });

  it.each([404, 500])('catches error and returns null (%s)', async (httpStatusCode) => {
    axiosMock.onGet(CONTENT_METADATA_URL).reply(httpStatusCode);
    const result = await fetchCourseMetadata(mockEnterpriseId, mockCourseKey);
    expect(result).toBeNull();
  });
});

describe('fetchCanRedeem', () => {
  const queryParams = new URLSearchParams();
  queryParams.append('content_key', mockCourseKey);
  queryParams.append('content_key', mockCourseKeyTwo);
  const CAN_REDEEM_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/enterprise-customer/${mockEnterpriseId}/can-redeem/?${queryParams.toString()}`;

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
  });

  it('handles no available course runs', async () => {
    const result = await fetchCanRedeem(mockEnterpriseId, []);
    expect(axiosMock.history.get.length).toBe(0);
    expect(result).toEqual([]);
  });

  it('returns can-redeem response', async () => {
    const canRedeemData = [{ canRedeem: true }];
    axiosMock.onGet(CAN_REDEEM_URL).reply(200, canRedeemData);
    const result = await fetchCanRedeem(mockEnterpriseId, [mockCourseKey, mockCourseKeyTwo]);
    expect(result).toEqual(canRedeemData);
  });

  it.each([404, 500])('catches error and returns empty array (%s)', async (httpStatusCode) => {
    axiosMock.onGet(CAN_REDEEM_URL).reply(httpStatusCode);
    const result = await fetchCanRedeem(mockEnterpriseId, [mockCourseKey, mockCourseKeyTwo]);
    expect(result).toEqual([]);
  });
});
