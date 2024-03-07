import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { fetchBrowseAndRequestConfiguration, fetchCouponCodeRequests, fetchLicenseRequests } from '.';
import { SUBSIDY_REQUEST_STATE } from '../../../../enterprise-subsidy-requests';

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

const mockEnterpriseId = 'test-enterprise-uuid';
const mockUserEmail = 'edx@example.com';
const APP_CONFIG = {
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
};
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('fetchBrowseAndRequestConfiguration', () => {
  const BNR_CONFIG_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/customer-configurations/${mockEnterpriseId}/`;

  it('returns browse and request configuration', async () => {
    const mockConfig = {
      id: 123,
    };
    axiosMock.onGet(BNR_CONFIG_URL).reply(200, mockConfig);
    const result = await fetchBrowseAndRequestConfiguration(mockEnterpriseId);
    expect(result).toEqual(mockConfig);
  });

  it('returns null when 404', async () => {
    axiosMock.onGet(BNR_CONFIG_URL).reply(404);
    const result = await fetchBrowseAndRequestConfiguration(mockEnterpriseId);
    expect(result).toBeNull();
  });
});

describe('fetchLicenseRequests', () => {
  it('returns license requests', async () => {
    const mockLicenseRequests = {
      results: [{ id: 123 }],
    };
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      user__email: mockUserEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    const LICENSE_REQUESTS_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/license-requests/?${queryParams.toString()}`;
    axiosMock.onGet(LICENSE_REQUESTS_URL).reply(200, mockLicenseRequests);
    const result = await fetchLicenseRequests(mockEnterpriseId, mockUserEmail);
    expect(result).toEqual(mockLicenseRequests);
  });
});

describe('fetchCouponCodeRequests', () => {
  it('returns coupon code requests', async () => {
    const mockCouponCodeRequests = {
      results: [{ id: 123 }],
    };
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseId,
      user__email: mockUserEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    const COUPON_CODE_REQUESTS_URL = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/coupon-code-requests/?${queryParams.toString()}`;
    axiosMock.onGet(COUPON_CODE_REQUESTS_URL).reply(200, mockCouponCodeRequests);
    const result = await fetchCouponCodeRequests(mockEnterpriseId, mockUserEmail);
    expect(result).toEqual(mockCouponCodeRequests);
  });
});
