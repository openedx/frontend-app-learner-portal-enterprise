import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { waitFor } from '@testing-library/react';

import { postSkillsGoalsAndJobsUserSelected, fetchCourseEnrollments, fetchJobPathDescription } from '../service';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL } from '../../constants';

const APP_CONFIG = {
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
};

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));

const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);

describe('skills quiz service', () => {
  afterEach(() => {
    axiosMock.reset();
  });

  it('post goals and jobs user selected', async () => {
    const sampleResponse = { example: 'data' };
    const url = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/skills-quiz/`;
    axiosMock.onPost(url).reply(200, sampleResponse);
    const interestedJobsId = [3, 4];
    const currentJobRoleId = 5;
    const response = await postSkillsGoalsAndJobsUserSelected(
      DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE_LABEL,
      interestedJobsId,
      [currentJobRoleId],
    );
    await waitFor(() => {
      expect(response.data).toEqual(sampleResponse);
    });
  });

  it('fetches course enrollments', async () => {
    const sampleResponse = { enrollments: ['course1', 'course2'] };
    const url = `${APP_CONFIG.LMS_BASE_URL}/api/enrollment/v1/enrollment`;
    axiosMock.onGet(url).reply(200, sampleResponse);
    const response = await fetchCourseEnrollments();
    await waitFor(() => expect(response.data).toEqual(sampleResponse));
  });

  it('fetches job path description', async () => {
    const currentJobID = 1;
    const futureJobID = 2;
    const sampleResponse = { description: 'Career progression details' };
    const url = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/job-path/?current_job=${currentJobID}&future_job=${futureJobID}`;
    axiosMock.onGet(url).reply(200, sampleResponse);
    const response = await fetchJobPathDescription(currentJobID, futureJobID);
    await waitFor(() => expect(response).toEqual(sampleResponse.description));
  });
});
