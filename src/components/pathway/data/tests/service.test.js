import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';

import LearnerPathwayService from '../service';
import { TEST_PATHWAY_DATA } from '../../tests/constants';

const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

const LEARNER_PATHWAY_API_URL = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/api/v1/learner-pathway/${TEST_PATHWAY_DATA.uuid}/`;

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(LEARNER_PATHWAY_API_URL).reply(200, TEST_PATHWAY_DATA);
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

describe('Learner Pathway Service', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
  });

  it('fetches learner pathway data', async () => {
    const learnerPathwayService = new LearnerPathwayService({ learnerPathwayUuid: TEST_PATHWAY_DATA.uuid });
    const data = await learnerPathwayService.fetchLearnerPathwayData();
    expect(axiosMock.history.get[0].url).toBe(LEARNER_PATHWAY_API_URL);
    const expectedResponse = camelCaseObject(TEST_PATHWAY_DATA);
    expect(data).toEqual(expectedResponse);
  });
});
