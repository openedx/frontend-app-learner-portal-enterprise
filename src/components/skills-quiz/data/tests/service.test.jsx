import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import {
  fetchSkillsId,
} from '../service';

import * as service from '../service';

import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL } from '../../constants';

const APP_CONFIG = {
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
};

jest.mock('@edx/frontend-platform/auth');
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('skills quiz service', () => {
  it('fetches selected skills id', () => {
    const url = 'http://localhost:18381/taxonomy/api/v1/skills/?name=python';
    fetchSkillsId(['python']);
    expect(axios.get).toBeCalledWith(url);
  });

  it('fetches multiple selected skills id', () => {
    const url = 'http://localhost:18381/taxonomy/api/v1/skills/?name=python%2C+django';
    fetchSkillsId(['python, django']);
    expect(axios.get).toBeCalledWith(url);
  });

  it('post skills goals and jobs user selected', () => {
    jest.mock('../service');
    const skillsId = [1, 2];
    const interestedJobsId = [3, 4];
    const currentJobRoleId = 5;
    service.postSkillsGoalsAndJobsUserSelected = jest.fn()
      .mockImplementation(() => Promise.resolve({
      }));
    service.postSkillsGoalsAndJobsUserSelected(
      DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
      skillsId,
      interestedJobsId,
      [currentJobRoleId],
    );
    expect(service.postSkillsGoalsAndJobsUserSelected).toBeCalledWith(
      DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
      skillsId,
      interestedJobsId,
      [currentJobRoleId],
    );
  });
});
