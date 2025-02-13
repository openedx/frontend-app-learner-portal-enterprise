import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { renderHook } from '@testing-library/react-hooks';

import { useLearnerPathwayData } from '../hooks';
import { TEST_PATHWAY_DATA } from '../../tests/constants';

const APP_CONFIG = {
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
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('useLearnerPathwayData', () => {
  beforeEach(() => {
    axiosMock.resetHistory();
  });

  it('returns correct data', async () => {
    const learnerPathwayUuid = '9d7c7c42-682d-4fa4-a133-2913e939f771';
    const { result, waitForNextUpdate } = renderHook(() => useLearnerPathwayData({ learnerPathwayUuid }));
    await waitForNextUpdate();
    expect(result.current).toEqual([camelCaseObject(TEST_PATHWAY_DATA), false, undefined]);
  });

  it('returns error if api call fails', async () => {
    const error = new Error('something went wrong');
    axiosMock.onGet(LEARNER_PATHWAY_API_URL).reply(() => { throw error; });

    const learnerPathwayUuid = '9d7c7c42-682d-4fa4-a133-2913e939f771';
    const { result, waitForNextUpdate } = renderHook(() => useLearnerPathwayData({ learnerPathwayUuid }));
    await waitForNextUpdate();
    expect(result.current[2]).toBe(error);
  });
});
