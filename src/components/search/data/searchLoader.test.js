import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { getConfig } from '@edx/frontend-platform/config';
import { renderWithRouterProvider } from '../../../utils/tests';
import makeSearchLoader from './searchLoader';
import {
  extractEnterpriseCustomer,
  queryAcademiesList,
  queryContentHighlightSets,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));
jest.mock('@edx/frontend-platform/auth', () => ({
  ...jest.requireActual('@edx/frontend-platform/auth'),
  configure: jest.fn(),
}));
jest.mock('@edx/frontend-platform/logging', () => ({
  ...jest.requireActual('@edx/frontend-platform/logging'),
  configure: jest.fn(),
  getLoggingService: jest.fn(),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  getConfig: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
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
      // eslint-disable-next-line react/jsx-filename-extension
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
});
