import { when } from 'jest-when';
import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../utils/tests';
import makeVideosLoader from './videosLoader';
import { ensureAuthenticatedUser } from '../../app/routes/data';
import {
  extractEnterpriseCustomer,
  queryCourseMetadata,
  queryCourseReviews,
  queryVideoDetail,
} from '../../app/data';
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
  ensureQueryData: jest.fn().mockResolvedValue(),
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
        path: '/:enterpriseSlug/videos/:videoUUID',
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

  it.each([
    { hasVideoDetailData: true },
    { hasVideoDetailData: false },
  ])('ensures the requisite video data is resolved', async ({ hasVideoDetailData }) => {
    const mockCourseKey = 'test-course-key';
    const videoDetailQuery = queryVideoDetail(mockVideoUUID, mockEnterpriseId);
    const courseMetadataQuery = queryCourseMetadata(mockCourseKey);
    const courseReviewsQuery = queryCourseReviews(mockCourseKey);

    // Mock the resolved data for the queries
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: videoDetailQuery.queryKey,
      }),
    ).mockResolvedValue(hasVideoDetailData ? { courseKey: mockCourseKey } : null);
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining(courseMetadataQuery),
    ).mockResolvedValue({
      key: mockCourseKey,
    });
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining(courseReviewsQuery),
    ).mockResolvedValue([]);

    // Render the route with videosLoader
    renderWithRouterProvider(
      {
        path: '/:enterpriseSlug/videos/:videoUUID',
        element: <div>hello world</div>,
        loader: makeVideosLoader(mockQueryClient),
      },
      {
        initialEntries: [mockVideosURL],
      },
    );

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    const expectedQueryCount = hasVideoDetailData ? 3 : 1;
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(expectedQueryCount);
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryVideoDetail(mockVideoUUID, mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
