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

  it('catches 404 error and returns null', async () => {
    axiosMock.onGet(CONTENT_METADATA_URL).reply(404);
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
  });

  it('returns can-redeem response', async () => {
    const canRedeemData = {
      canRedeem: true,
    };
    axiosMock.onGet(CAN_REDEEM_URL).reply(200, canRedeemData);
    const result = await fetchCanRedeem(mockEnterpriseId, [mockCourseKey, mockCourseKeyTwo]);
    expect(result).toEqual(canRedeemData);
  });

  it('catches 404 error and returns empty array', async () => {
    axiosMock.onGet(CAN_REDEEM_URL).reply(404);
    const result = await fetchCanRedeem(mockEnterpriseId, [mockCourseKey]);
    expect(result).toEqual([]);
  });
});
