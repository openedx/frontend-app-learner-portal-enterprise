import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import { getLearnerSkillQuiz, getLearnerSkillLevels } from '../service';

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(() => ({
    LMS_BASE_URL: 'http://localhost:18000',
    DISCOVERY_API_BASE_URL: 'http://localhost:18381',
  })),
}));

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('my career services', () => {
  it('fetches enterprise learner skill quiz', () => {
    const url = 'http://localhost:18381/taxonomy/api/v1/skills-quiz/?page_size=1&username=edx';
    getLearnerSkillQuiz('edx');
    expect(axios.get).toBeCalledWith(url);
  });
  it('fetches enterprise learner skill levels', () => {
    const url = 'http://localhost:18000/api/user/v1/skill_level/27/';
    getLearnerSkillLevels(27);
    expect(axios.get).toBeCalledWith(url);
  });
});
