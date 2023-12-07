import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, act } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { renderWithRouter } from '../../../utils/tests';

import SearchAcademy from '../SearchAcademy';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
const ENTERPRISE_UUID = '12345678-9000-0000-0000-123456789101';
const ACADEMY_MOCK_DATA = {
  uuid: ACADEMY_UUID,
  title: 'My Awesome Academy',
  long_description: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      description: 'description 222',
    },
  ],
};

// endpoints
const ACADEMY_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies/${ACADEMY_UUID}/`;
const ACADEMIES_LIST_API_ENDPOINT = `${APP_CONFIG.ENTERPRISE_CATALOG_API_BASE_URL}/api/v1/academies?enterprise_customer=${ENTERPRISE_UUID}`;

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', academyUUID: ACADEMY_UUID }),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));
jest.mock('@edx/frontend-platform/auth');
const axiosMock = new MockAdapter(axios);
getAuthenticatedHttpClient.mockReturnValue(axios);
axiosMock.onGet(ACADEMY_API_ENDPOINT).reply(200, ACADEMY_MOCK_DATA);
axiosMock.onGet(ACADEMIES_LIST_API_ENDPOINT).reply(200, { count: 1, results: [ACADEMY_MOCK_DATA] });

const SearchAcademyWithContext = ({
  initialAppState = {}, ...rest
}) => (
  <AppContext.Provider value={initialAppState}>
    <SearchAcademy {...rest} />
  </AppContext.Provider>
);

describe('<SearchAcademy />', () => {
  const initialAppState = {
    enterpriseConfig: {
      slug: 'test-enterprise-slug',
      uuid: ENTERPRISE_UUID,
    },
  };

  it('renders search academy section correctly.', async () => {
    await act(async () => renderWithRouter(
      <SearchAcademyWithContext
        initialAppState={initialAppState}
      />,
    ));
    expect(screen.getByText('edX Academies; designed to meet your most critical business needs')).toBeInTheDocument();
    expect(screen.getByText('My Awesome Academy')).toBeInTheDocument();
  });
});
