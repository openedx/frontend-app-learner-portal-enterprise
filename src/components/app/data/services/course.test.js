import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { logError } from '@edx/frontend-platform/logging';
import { fetchCanRedeem, fetchCourseMetadata } from './course';
import { findHighestLevelEntitlementSku, getActiveCourseRun } from '../utils';
import { getErrorResponseStatusCode } from '../../../../utils/common';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockCourseKey = 'edX+DemoX';
const mockCourseKeyTwo = 'edX+DemoZ';
const APP_CONFIG = {
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

jest.mock('../utils');
jest.mock('../../../../utils/common');

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
  const CONTENT_METADATA_URL = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/courses/${mockCourseKey}/?`;
  const courseMetadata = {
    key: mockCourseKey,
    title: 'edX Demonstration Course',
    entitlements: null,
    courseRuns: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.reset();
    getActiveCourseRun.mockReturnValue(null);
    findHighestLevelEntitlementSku.mockReturnValue(null);
  });

  it('returns course metadata', async () => {
    axiosMock.onGet(CONTENT_METADATA_URL).reply(200, courseMetadata);
    const result = await fetchCourseMetadata(mockCourseKey);
    const expectedResult = {
      ...courseMetadata,
      activeCourseRun: null,
      courseEntitlementProductSku: null,
    };
    expect(result).toEqual(expectedResult);
  });

  it.each([404, 500])('catches error and returns null (%s)', async (httpStatusCode) => {
    getErrorResponseStatusCode.mockReturnValue(httpStatusCode);
    axiosMock.onGet(CONTENT_METADATA_URL).reply(httpStatusCode, {});
    const result = await fetchCourseMetadata(courseMetadata);
    if (httpStatusCode === 404) {
      expect(result).toBeNull();
    } else {
      expect(logError).toHaveBeenCalledTimes(1);
      expect(logError).toHaveBeenCalledWith(new Error('Request failed with status code 404'));
      expect(result).toEqual(null);
    }
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
