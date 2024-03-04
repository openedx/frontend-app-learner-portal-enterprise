import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { mergeConfig } from '@edx/frontend-platform/config';

import {
  fetchSubsidyRequestConfiguration,
  fetchCouponCodeRequests,
  fetchLicenseRequests,
} from '../service';
import { SUBSIDY_REQUEST_STATE } from '../../constants';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
const enterpriseAccessBaseUrl = `${process.env.ENTERPRISE_ACCESS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';
const mockEmail = 'edx@example.com';

describe('fetchSubsidyRequestConfiguration', () => {
  beforeEach(() => {
    mergeConfig({
      ENTERPRISE_ACCESS_BASE_URL: enterpriseAccessBaseUrl,
    });
  });

  it('fetches subsidy request configuration for the given enterprise', () => {
    fetchSubsidyRequestConfiguration(mockEnterpriseUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/customer-configurations/${mockEnterpriseUUID}/`);
  });
});

describe('fetchLicenseRequests', () => {
  it('fetches license requests', () => {
    fetchLicenseRequests({
      enterpriseUUID: mockEnterpriseUUID,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.DECLINED,
    });
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      user__email: mockEmail,
      state: SUBSIDY_REQUEST_STATE.DECLINED,
    });
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/license-requests/?${queryParams.toString()}`,
    );
  });
});

describe('fetchCouponCodeRequests', () => {
  it('fetches coupon code requests', () => {
    fetchCouponCodeRequests({
      enterpriseUUID: mockEnterpriseUUID,
      userEmail: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    const queryParams = new URLSearchParams({
      enterprise_customer_uuid: mockEnterpriseUUID,
      user__email: mockEmail,
      state: SUBSIDY_REQUEST_STATE.REQUESTED,
    });
    expect(axios.get).toBeCalledWith(
      `${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/?${queryParams.toString()}`,
    );
  });
});
