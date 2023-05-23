import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import CourseService from '../service';
import {
  TEST_RECOMMENDATION_DATA,
  FILTERED_RECOMMENDATIONS,
  REVIEW_DATA,
  mockCanRedeemData,
  mockTransactionResponse,
  mockRedemptionResponse,
} from '../../tests/constants';
import { retrieveTransactionStatus, submitRedemptionRequest } from '../../../stateful-enroll/data';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
  ENTERPRISE_ACCESS_BASE_URL: 'http://localhost:18270',
  ENTERPRISE_SUBSIDY_BASE_URL: 'http://localhost:18280',
};

// test data
const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const COURSE_KEY = 'edX+DemoX';
const COURSE_RUN_KEY = 'edX+DemoX_2022';
const TRANSACTION_UUID = '12345678-9000-0000-0000-98765432101';
const POLICY_UUID = '87654321-9000-0000-0000-123456789101';

// endpoints
const RECOMMENDATION_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/course_recommendations/${COURSE_KEY}/`;
const FILTER_RECOMMENDATION_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/filter_content_items/`;
const REVIEW_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/course_review/${COURSE_KEY}/`;
const canRedeemParams = new URLSearchParams({ content_key: COURSE_RUN_KEY });
const CAN_REDEEM_ENDPOINT = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy/enterprise-customer/${ENTERPRISE_UUID}/can-redeem/?${canRedeemParams.toString()}`;
const TRANSACTION_ENDPOINT = `${APP_CONFIG.ENTERPRISE_SUBSIDY_BASE_URL}/api/v1/transactions/${TRANSACTION_UUID}/`;
const REDEEM_ENDPOINT = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy/${POLICY_UUID}/redeem/`;

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(RECOMMENDATION_API_ENDPOINT).reply(200, TEST_RECOMMENDATION_DATA);
axiosMock.onPost(FILTER_RECOMMENDATION_API_ENDPOINT).reply(200, FILTERED_RECOMMENDATIONS);
axiosMock.onGet(REVIEW_API_ENDPOINT).reply(200, REVIEW_DATA);
axiosMock.onGet(CAN_REDEEM_ENDPOINT).reply(200, mockCanRedeemData);
axiosMock.onGet(TRANSACTION_ENDPOINT).reply(200, mockTransactionResponse);
axiosMock.onPost(REDEEM_ENDPOINT).reply(200, mockRedemptionResponse);

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('CourseService', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
    jest.clearAllMocks();
  });

  it('fetches course recommendations for the passed course key', async () => {
    const courseService = new CourseService({
      enterpriseUuid: ENTERPRISE_UUID,
      courseKey: COURSE_KEY,
      courseRunKey: COURSE_RUN_KEY,
    });
    const response = await courseService.fetchCourseRecommendations();
    expect(axiosMock.history.get[0].url).toBe(RECOMMENDATION_API_ENDPOINT);
    expect(response.data).toEqual(TEST_RECOMMENDATION_DATA);
  });

  it('fetches course recommendations for the passed course key and filters those recommendations', async () => {
    const courseService = new CourseService({
      enterpriseUuid: ENTERPRISE_UUID,
      courseKey: COURSE_KEY,
      courseRunKey: COURSE_RUN_KEY,
    });

    const data = await courseService.fetchAllCourseRecommendations();

    // based on what we get from filtered recommendations API [FILTERED_RECOMMENDATIONS], expected data should be:
    const expectedData = {
      all_recommendations: [TEST_RECOMMENDATION_DATA.all_recommendations[0]],
      same_partner_recommendations: [TEST_RECOMMENDATION_DATA.same_partner_recommendations[1]],
    };
    expect(axiosMock.history.get[0].url).toBe(RECOMMENDATION_API_ENDPOINT);
    expect(axiosMock.history.post[0].url).toBe(FILTER_RECOMMENDATION_API_ENDPOINT);

    expect(data).toEqual(expectedData);
  });

  it('fetches course review data', async () => {
    const courseService = new CourseService({
      courseKey: COURSE_KEY,
    });
    const response = await courseService.fetchCourseReviews();
    expect(axiosMock.history.get[0].url).toBe(REVIEW_API_ENDPOINT);
    expect(response.data).toEqual(REVIEW_DATA);
  });

  it('fetches subsidy access policy redeemability for content keys', async () => {
    const courseService = new CourseService({
      enterpriseUuid: ENTERPRISE_UUID,
      courseKey: COURSE_KEY,
      courseRunKey: COURSE_RUN_KEY,
    });
    const response = await courseService.fetchCanRedeem({ courseRunKeys: [COURSE_RUN_KEY] });
    expect(axiosMock.history.get[0].url).toBe(CAN_REDEEM_ENDPOINT);
    expect(response.data).toEqual(mockCanRedeemData);
  });

  it('fetches transaction status', async () => {
    const transactionStatusApiUrl = TRANSACTION_ENDPOINT;
    const response = await retrieveTransactionStatus({ transactionStatusApiUrl });
    expect(axiosMock.history.get[0].url).toBe(TRANSACTION_ENDPOINT);
    expect(response).toEqual(mockTransactionResponse);
  });

  it('fetches redemption request', async () => {
    const policyRedemptionUrl = `${APP_CONFIG.ENTERPRISE_ACCESS_BASE_URL}/api/v1/policy/87654321-9000-0000-0000-123456789101/redeem/`;
    const userId = mockTransactionResponse.user_id;
    const contentKey = mockTransactionResponse.content_key;
    const requestBody = {
      lms_user_id: userId,
      content_key: contentKey,
    };
    const response = await submitRedemptionRequest({ policyRedemptionUrl, userId, contentKey });
    expect(axiosMock.history.post[0].url).toBe(REDEEM_ENDPOINT);
    expect(axiosMock.history.post[0].data).toEqual(JSON.stringify(requestBody));
    expect(response).toEqual(mockRedemptionResponse);
  });
});
