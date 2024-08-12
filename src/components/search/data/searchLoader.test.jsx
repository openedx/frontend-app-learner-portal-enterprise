import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getConfig } from '@edx/frontend-platform/config';
import { when } from 'jest-when';
import { renderWithRouterProvider } from '../../../utils/tests';
import makeSearchLoader from './searchLoader';
import {
  extractEnterpriseCustomer,
  queryAcademiesList,
  queryContentHighlightSets,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data/utils';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/routes/data/utils', () => ({
  ...jest.requireActual('../../app/routes/data/utils'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);

const mockAcademies = [
  {
    uuid: 'test-academy-uuid-1',
  },
];

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
  getQueryData: jest.fn().mockReturnValue(mockAcademies),
};

describe('searchLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
    getConfig.mockReturnValue({
      FEATURE_CONTENT_HIGHLIGHTS: false,
    });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug/search',
      element: <div>hello world</div>,
      loader: makeSearchLoader(mockQueryClient),
    }, [
      {
        initialEntries: ['/test-enterprise-slug/search'],
      },
    ]);

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite search data is resolved without content highlights', async () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug/search',
      element: <div>hello world</div>,
      loader: makeSearchLoader(mockQueryClient),
    }, [
      {
        initialEntries: ['/test-enterprise-slug/search'],
      },
    ]);

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryAcademiesList(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );
    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryContentHighlightSets(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });

  it('ensures the requisite search data is resolved with content highlights', async () => {
    getConfig.mockReturnValue({
      FEATURE_CONTENT_HIGHLIGHTS: true,
    });
    renderWithRouterProvider({
      path: '/:enterpriseSlug/search',
      element: <div>hello world</div>,
      loader: makeSearchLoader(mockQueryClient),
    }, [
      {
        initialEntries: ['/test-enterprise-slug/search'],
      },
    ]);

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(2);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryAcademiesList(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryContentHighlightSets(mockEnterpriseCustomer.uuid).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });

  it('Redirect learners whose enterprise has enabled one academy.', async () => {
    extractEnterpriseCustomer.mockResolvedValue(enterpriseCustomerFactory({ enable_one_academy: true }));
    const academiesQuery = queryAcademiesList(mockEnterpriseCustomer.uuid);

    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: academiesQuery.queryKey,
      }),
    ).mockResolvedValue(mockAcademies);
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3, username: 'test-user' });

    renderWithRouterProvider({
      path: '/:enterpriseSlug/search',
      element: <div data-testid="search-page" />,
      loader: makeSearchLoader(mockQueryClient),
    }, {
      routes: [
        {
          path: '/:enterpriseCustomer/academies/:academyUUID',
          element: <div data-testid="academy-details-page" />,
        },
      ],
      initialEntries: [`/${mockEnterpriseCustomer.slug}/search`],
    });

    // Validate user is redirected to the academy details page.
    await waitFor(() => {
      expect(screen.getByTestId('academy-details-page')).toBeInTheDocument();
    });
  });

  it('Does not redirect the learners if enterprise one academy is not enabled.', async () => {
    extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);
    const academiesQuery = queryAcademiesList(mockEnterpriseCustomer.uuid);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: academiesQuery.queryKey,
      }),
    ).mockResolvedValue(mockAcademies);
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3, username: 'test-user' });

    renderWithRouterProvider({
      path: '/:enterpriseSlug/search',
      element: <div data-testid="search-page" />,
      loader: makeSearchLoader(mockQueryClient),
    }, {
      routes: [
        {
          path: '/:enterpriseCustomer/academies/:academyUUID',
          element: <div data-testid="academy-details-page" />,
        },
      ],
      initialEntries: [`/${mockEnterpriseCustomer.slug}/search`],
    });

    // Validate user is not redirected to the academy details page.
    await waitFor(() => {
      expect(screen.getByTestId('search-page')).toBeInTheDocument();
    });
  });
});
