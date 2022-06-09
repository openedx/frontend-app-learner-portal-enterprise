import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import CourseService from '../service';
import { TEST_RECOMMENDATION_DATA, FILTERED_RECOMMENDATIONS } from '../../tests/constants';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const COURSE_KEY = 'edX+DemoX';
const COURSE_RUN_KEY = 'edX+DemoX_2022';

// endpoints
const RECOMMENDATION_API_ENDPOINT = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/course_recommendations/${COURSE_KEY}/`;
const FILTER_RECOMMENDATION_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/enterprise-customer/${ENTERPRISE_UUID}/filter_content_items/`;

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(RECOMMENDATION_API_ENDPOINT).reply(200, TEST_RECOMMENDATION_DATA);
axiosMock.onPost(FILTER_RECOMMENDATION_API_ENDPOINT).reply(200, FILTERED_RECOMMENDATIONS);

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('CourseService', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
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
});
