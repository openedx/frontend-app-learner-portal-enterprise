import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

import * as service from '../service';

import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL } from '../../constants';

const APP_CONFIG = {
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
};

jest.mock('@edx/frontend-platform/auth', () => {
  const actual = jest.requireActual('@edx/frontend-platform/auth');
  return {
    ...actual,
    getAuthenticatedHttpClient: jest.fn(),
  };
});
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onAny().reply(200);
axios.get = jest.fn();

describe('skills quiz service', () => {
  it('post goals and jobs user selected', () => {
    jest.mock('../service');
    const interestedJobsId = [3, 4];
    const currentJobRoleId = 5;
    // eslint-disable-next-line no-import-assign
    service.postSkillsGoalsAndJobsUserSelected = jest.fn()
      .mockImplementation(() => Promise.resolve({
      }));
    service.postSkillsGoalsAndJobsUserSelected(
      DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
      interestedJobsId,
      [currentJobRoleId],
    );
    expect(service.postSkillsGoalsAndJobsUserSelected).toBeCalledWith(
      DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
      interestedJobsId,
      [currentJobRoleId],
    );
  });
});
