import { screen } from '@testing-library/react';
import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeDashboardLoader from '../dashboardLoader';
import { extractEnterpriseId } from '../../data';
import { makeEnterpriseCourseEnrollmentsQuery } from '../../queries';
import '@testing-library/jest-dom/extend-expect';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn().mockResolvedValue({ userId: 3 }),
  extractEnterpriseId: jest.fn(),
}));

jest.mock('../../queries', () => ({
  ...jest.requireActual('../../queries'),
  fetchEnterpriseCourseEnrollments: jest.fn().mockResolvedValue([]),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
extractEnterpriseId.mockResolvedValue(mockEnterpriseId);

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('dashboardLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ensures the requisite dashboard data is resolved', async () => {
    renderWithRouterProvider({
      path: '/:enterpriseSlug',
      element: <div>hello world</div>,
      loader: makeDashboardLoader(mockQueryClient),
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: makeEnterpriseCourseEnrollmentsQuery(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
        enabled: true,
      }),
    );
  });
});
