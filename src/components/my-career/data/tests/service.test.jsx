import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  getLearnerProfileInfo, getLearnerSkillLevels, patchProfile,
} from '../service';
import { CURRENT_JOB_PROFILE_FIELD_NAME } from '../constants';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  LMS_BASE_URL: 'http://localhost:18000',
};

jest.mock('@edx/frontend-platform/config', () => ({
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
    axiosMock.resetHistory();
    jest.clearAllMocks();
  });

  afterEach(() => {
    axiosMock.resetHistory();
    jest.clearAllMocks();
  });

  it('fetches enterprise learner profile info', async () => {
    await getLearnerProfileInfo(USERNAME);
    expect(axios.get).toBeCalledWith(LEARNER_PROFILE_ENDPOINT);
  });

  it('fetches enterprise learner skill levels', async () => {
    await getLearnerSkillLevels(JOB_ID);
    expect(axios.get).toBeCalledWith(LEARNER_SKILL_LEVELS_ENDPOINT);
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
    expect(axios.patch).toBeCalledWith(LEARNER_PROFILE_ENDPOINT, params, header);
  });
});
