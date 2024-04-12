import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  mockTransactionResponse,
  mockRedemptionResponse,
} from '../../tests/constants';
import { retrieveTransactionStatus, submitRedemptionRequest } from '../../../stateful-enroll/data';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
  ENTERPRISE_SUBSIDY_BASE_URL: 'http://localhost:18280',
};

// test data
const TRANSACTION_UUID = '12345678-9000-0000-0000-98765432101';
const POLICY_UUID = '87654321-9000-0000-0000-123456789101';

// endpoints
const TRANSACTION_ENDPOINT = `${APP_CONFIG.ENTERPRISE_SUBSIDY_BASE_URL}/api/v1/transactions/${TRANSACTION_UUID}/`;
const REDEEM_ENDPOINT = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/${POLICY_UUID}/redeem/`;

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(TRANSACTION_ENDPOINT).reply(200, mockTransactionResponse);
axiosMock.onPost(REDEEM_ENDPOINT).reply(200, mockRedemptionResponse);

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: () => (APP_CONFIG),
}));

describe('CourseService', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
    jest.clearAllMocks();
  });

  it('fetches transaction status', async () => {
    const transactionStatusApiUrl = TRANSACTION_ENDPOINT;
    const response = await retrieveTransactionStatus({ transactionStatusApiUrl });
    expect(axiosMock.history.get[0].url).toBe(TRANSACTION_ENDPOINT);
    expect(response).toEqual(mockTransactionResponse);
  });

  it('fetches redemption request', async () => {
    const policyRedemptionUrl = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy-redemption/87654321-9000-0000-0000-123456789101/redeem/`;
    const userId = mockTransactionResponse.user_id;
    const contentKey = mockTransactionResponse.content_key;
    const requestBody = {
      lms_user_id: userId,
      content_key: contentKey,
      metadata: {},
    };
    const response = await submitRedemptionRequest({ policyRedemptionUrl, userId, contentKey });
    expect(axiosMock.history.post[0].url).toBe(REDEEM_ENDPOINT);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(requestBody));
    expect(response).toEqual(mockRedemptionResponse);
  });
});
