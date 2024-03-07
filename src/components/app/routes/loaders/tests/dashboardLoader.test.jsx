import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeDashboardLoader from '../dashboardLoader';
import { extractEnterpriseId, queryEnterpriseCourseEnrollments } from '../../../data';

jest.mock('../../data', () => ({
  ...jest.requireActual('../../data'),
  ensureAuthenticatedUser: jest.fn().mockResolvedValue({ userId: 3 }),
}));
jest.mock('../../../data', () => ({
  ...jest.requireActual('../../../data'),
  extractEnterpriseId: jest.fn(),
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
