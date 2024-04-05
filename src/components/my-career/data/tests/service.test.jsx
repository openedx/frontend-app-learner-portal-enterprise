import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { patchProfile } from '../service';
import { fetchLearnerSkillLevels } from '../../../app/data';
import { CURRENT_JOB_PROFILE_FIELD_NAME } from '../constants';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  LMS_BASE_URL: 'http://localhost:18000',
};

jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: () => (APP_CONFIG),
}));

// test data
const JOB_ID = 27;
const USERNAME = 'Bob';

// endpoints
const LEARNER_SKILL_LEVELS_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/user/v1/skill_level/${JOB_ID}/`;
const LEARNER_PROFILE_ENDPOINT = `${APP_CONFIG.LMS_BASE_URL}/api/user/v1/accounts/${USERNAME}`;

// mocks
jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn().mockImplementation(() => Promise.resolve({}));
axios.patch = jest.fn().mockImplementation(() => Promise.resolve({}));

jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('my career services', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axiosMock.resetHistory();
  });

  it('fetches enterprise learner skill levels', async () => {
    await fetchLearnerSkillLevels(JOB_ID);
    expect(axios.get).toHaveBeenCalledWith(LEARNER_SKILL_LEVELS_ENDPOINT);
  });

  it('patches enterprise learner profile info', async () => {
    const params = {
      extended_profile: [
        { field_name: CURRENT_JOB_PROFILE_FIELD_NAME, field_value: JOB_ID },
      ],
    };
    const header = {
      headers: { 'Content-Type': 'application/merge-patch+json' },
    };
    await patchProfile(USERNAME, params);
    expect(axios.patch).toHaveBeenCalledWith(LEARNER_PROFILE_ENDPOINT, params, header);
  });
});
