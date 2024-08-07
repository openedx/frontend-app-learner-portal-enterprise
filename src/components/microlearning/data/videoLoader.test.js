/* eslint-disable react/jsx-filename-extension */
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import makeVideosLoader from './videoLoader';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import { extractEnterpriseCustomer, queryVideoDetail } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

jest.mock('../../app/routes/data', () => ({
  ...jest.requireActual('../../app/routes/data'),
  ensureAuthenticatedUser: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  extractEnterpriseCustomer: jest.fn(),
}));

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseSlug = mockEnterpriseCustomer.slug;
const mockEnterpriseId = mockEnterpriseCustomer.uuid;
const mockVideoUUID = 'test-video-uuid';
const mockVideosURL = `/${mockEnterpriseSlug}/videos/${mockVideoUUID}/`;

const mockQueryClient = {
  ensureQueryData: jest.fn().mockResolvedValue({}),
};

describe('videosLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue(mockAuthenticatedUser);
    extractEnterpriseCustomer.mockResolvedValue(mockEnterpriseCustomer);
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/videos/:videoUUID/',
        element: <div>hello world</div>,
        loader: makeVideosLoader(mockQueryClient),
      },
      {
        initialEntries: [mockVideosURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it('ensures the requisite video data is resolved', async () => {
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/videos/:videoUUID/',
        element: <div>hello world</div>,
        loader: makeVideosLoader(mockQueryClient),
      },
      {
        initialEntries: [mockVideosURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(1);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryVideoDetail(mockVideoUUID, mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
