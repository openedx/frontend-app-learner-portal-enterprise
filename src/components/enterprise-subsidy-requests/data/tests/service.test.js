import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  fetchSubsidyRequestConfiguration,
  fetchCouponCodeRequests,
  fetchLicenseRequests,
} from '../service';

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

axiosMock.onAny().reply(200);
axios.get = jest.fn();
const enterpriseAccessBaseUrl = `${process.env.ENTERPRISE_ACCESS_BASE_URL}`;
const mockEnterpriseUUID = 'test-enterprise-id';

describe('fetchSubsidyRequestConfiguration', () => {
  it('fetches subsidy request configuration for the given enterprise', () => {
    fetchSubsidyRequestConfiguration(mockEnterpriseUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/customer-configurations/${mockEnterpriseUUID}/`);
  });
});

describe('fetchLicenseRequests', () => {
  it('fetches license requests', () => {
    fetchLicenseRequests(mockEnterpriseUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/license-requests/?enterprise_customer_uuid=${mockEnterpriseUUID}`);
  });
});

describe('fetchCouponCodeRequests', () => {
  it('fetches coupon code requests', () => {
    fetchCouponCodeRequests(mockEnterpriseUUID);
    expect(axios.get).toBeCalledWith(`${enterpriseAccessBaseUrl}/api/v1/coupon-code-requests/?enterprise_customer_uuid=${mockEnterpriseUUID}`);
  });
});
