import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom/extend-expect';
import { act, screen, render } from '@testing-library/react';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import JobDescriptions from '../JobDescriptions';
import {
  DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE,
  DROPDOWN_OPTION_CHANGE_CAREERS,
  JOB_DESCRIPTION_DISCLAIMER,
} from '../constants';

const APP_CONFIG = {
  USE_API_CACHE: true,
  DISCOVERY_API_BASE_URL: 'http://localhost:18381',
};

const currentJobID = '1111';
const futureJobID = '2222';
const currentJobDescription = 'I am current job description';
const futureJobDescription = 'I am future job description';
const jobPathDescription = 'I am a current to future job path description';

const JOB_PATH_API_URL = `${APP_CONFIG.DISCOVERY_API_BASE_URL}/taxonomy/api/v1/job-path/?current_job=${currentJobID}&future_job=${futureJobID}`;
const JOB_PATH_API_RESPONSE = { description: jobPathDescription };

jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(JOB_PATH_API_URL).reply(200, JOB_PATH_API_RESPONSE);
jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: () => (APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  logError: jest.fn(),
}));

describe('<JobDescriptions />', () => {
  it('renders correct data', async () => {
    await act(async () => render(
      <JobDescriptions
        currentJobID={currentJobID}
        futureJobID={futureJobID}
        currentJobDescription={currentJobDescription}
        futureJobDescription={futureJobDescription}
        goal={DROPDOWN_OPTION_CHANGE_CAREERS}
      />,
    ));

    expect(screen.getByText(JOB_DESCRIPTION_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(futureJobDescription)).toBeInTheDocument();
    expect(screen.getByText(jobPathDescription)).toBeInTheDocument();
  });

  it('renders correct data with goal improve current role', async () => {
    await act(async () => render(
      <JobDescriptions
        currentJobID={currentJobID}
        futureJobID={futureJobID}
        currentJobDescription={currentJobDescription}
        futureJobDescription={futureJobDescription}
        goal={DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE}
      />,
    ));

    expect(screen.getByText(JOB_DESCRIPTION_DISCLAIMER)).toBeInTheDocument();
    expect(screen.getByText(currentJobDescription)).toBeInTheDocument();
    expect(screen.queryByText(jobPathDescription)).not.toBeInTheDocument();
  });
});
