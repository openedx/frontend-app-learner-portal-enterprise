import renderer from 'react-test-renderer';
import React from 'react';
import { MemoryRouter, Route } from 'react-router-dom';
import AxiosMockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { AppContext } from '@edx/frontend-platform/react';

import ProgramProgressPage from './ProgramProgressPage';

const { LMS_BASE_URL } = process.env;

const PROGRAM_UUID = '86eb2e15-1762-498b-aaa2-510ae4ec0ad2';

const APP_CONTEXT = {
  authenticatedUser: {
    userId: 1,
    roles: [],
  },
  config: {
    LMS_BASE_URL,
  },
};

const axiosMock = new AxiosMockAdapter(axios);
axiosMock
  .onGet(`${LMS_BASE_URL}/api/dashboard/v0/programs/${PROGRAM_UUID}/progress_details/`)
  .reply(200, {
    programData: {
      title: 'Program Title',
    },
  });

jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  getAuthenticatedHttpClient: jest.fn(),
}));

describe('ProgramProgressPage', () => {
  beforeAll(() => {
    const httpClient = axios.create();
    getAuthenticatedHttpClient.mockImplementation(() => httpClient);
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the expected HTML', async () => {
    let tree = null;

    await renderer.act(async () => {
      tree = await renderer.create(
        <AppContext.Provider value={APP_CONTEXT}>
          <MemoryRouter
            initialIndex={0}
            initialEntries={[`/test-org/program-progress/${PROGRAM_UUID}`]}
          >
            <div>
              <Route path="/:enterpriseSlug/program-progress/:programUUID">
                <ProgramProgressPage />
              </Route>
            </div>
          </MemoryRouter>
        </AppContext.Provider>,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
