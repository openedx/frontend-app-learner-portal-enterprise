import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { screen, act } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient, renderWithRouter } from '../../../utils/tests';

import SearchAcademy from '../SearchAcademy';
import { useEnterpriseCustomer } from '../../app/data';
import { useAcademies } from '../../hooks';

// config
const APP_CONFIG = {
  USE_API_CACHE: true,
  ENTERPRISE_CATALOG_API_BASE_URL: 'http://localhost:18160',
};

// test data
const ACADEMY_UUID = 'b48ff396-03b4-467f-a4cc-da4327156984';
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

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

jest.mock('../../hooks', () => ({
  ...jest.requireActual('../../hooks'),
  useAcademies: jest.fn(),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ enterpriseSlug: 'test-enterprise-uuid', academyUUID: ACADEMY_UUID }),
}));
jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
}));

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id' },
};

const SearchAcademyWithContext = ({
  appState = initialAppState, ...rest
}) => (
  <QueryClientProvider client={queryClient()}>
    <AppContext.Provider value={appState}>
      <SearchAcademy {...rest} />
    </AppContext.Provider>
  </QueryClientProvider>
);

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: '12345',
};

describe('<SearchAcademy />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    // FIX COMPLETELY setQueryClientData
  });

  it('renders search academy section correctly.', async () => {
    useAcademies.mockReturnValue({ data: [ACADEMY_MOCK_DATA], isError: false });
    await act(async () => renderWithRouter(
      <IntlProvider locale="en">
        <SearchAcademyWithContext
          initialAppState={initialAppState}
        />
      </IntlProvider>,
    ));
    expect(screen.getByText('edX Academies; designed to meet your most critical business needs')).toBeInTheDocument();
    expect(screen.getByText('My Awesome Academy')).toBeInTheDocument();
  });
});
