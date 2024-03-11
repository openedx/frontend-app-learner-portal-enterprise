import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import makeDashboardLoader from './dashboardLoader';
import {
  extractEnterpriseId,
  queryEnterpriseCourseEnrollments,
} from '../../app/data';
import { ensureAuthenticatedUser } from '../../app/routes/data';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn(),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseId: jest.fn(),
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

const mockEnterpriseId = 'test-enterprise-uuid';
extractEnterpriseId.mockResolvedValue(mockEnterpriseId);

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('dashboardLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeDashboardLoader(mockQueryClient),
    }, [
      {
        initialEntries: ['/test-enterprise-slug'],
      },
    ]);

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite dashboard data is resolved', async () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeDashboardLoader(mockQueryClient),
    }, [
      {
        initialEntries: ['/test-enterprise-slug'],
      },
    ]);

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseCourseEnrollments(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
