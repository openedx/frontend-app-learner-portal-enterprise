/* eslint-disable react/jsx-filename-extension */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { queryLearnerPathwayProgressData } from '../../app/data';
import makePathwayProgressLoader from './pathwayProgressLoader';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

const mockEnterpriseId = 'test-enterprise-uuid';
const mockPathwayUUID = 'test-pathway-uuid';
const mockPathwayProgressURL = `/${mockEnterpriseId}/pathway/${mockPathwayUUID}/progress`;

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('programProgressLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/pathway/:pathwayUUID/progress',
        element: <div>hello world</div>,
        loader: makePathwayProgressLoader(mockQueryClient),
      },
      {
        initialEntries: [mockPathwayProgressURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite pathway progress data is resolved', async () => {
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/pathway/:pathwayUUID/progress',
        element: <div>hello world</div>,
        loader: makePathwayProgressLoader(mockQueryClient),
      },
      {
        initialEntries: [mockPathwayProgressURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryLearnerPathwayProgressData(mockPathwayUUID).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
