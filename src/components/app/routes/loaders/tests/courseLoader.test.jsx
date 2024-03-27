import { screen } from '@testing-library/react';
import { when } from 'jest-when';
import '@testing-library/jest-dom/extend-expect';

import { renderWithRouterProvider } from '../../../../../utils/tests';
import makeCourseLoader from '../courseLoader';
import {
  extractEnterpriseId,
  queryCanRedeem,
  queryCourseMetadata,
  queryEnterpriseCourseEnrollments,
  queryUserEntitlements,
} from '../../../data';
import { ensureAuthenticatedUser } from '../../data';

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

describe('courseLoader', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    ensureAuthenticatedUser.mockResolvedValue({ userId: 3 });
  });

  it('does nothing with unauthenticated users', async () => {
    ensureAuthenticatedUser.mockResolvedValue(null);
    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <div>hello world</div>,
      loader: makeCourseLoader(mockQueryClient),
    }, {
      initialEntries: ['/test-enterprise-slug/course/edX+DemoX'],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalled();
  });

  it.each([
    { hasCourseMetadata: true },
    { hasCourseMetadata: false },
  ])('ensures the requisite course-related metadata data is resolved (%s)', async ({ hasCourseMetadata }) => {
    const mockCourseMetadata = {
      key: 'edX+DemoX',
      courseRuns: [{
        key: 'course-run-key',
        isMarketable: true,
        isEnrollable: true,
        availability: 'Current',
      }],
    };

    // When `ensureQueryData` is called with the course metadata
    // query, ensure its mock return value is the course metadata
    // for the dependent course redemption eligibility query.
    const courseMetadataQuery = queryCourseMetadata(mockEnterpriseId, 'edX+DemoX');
    when(mockQueryClient.ensureQueryData).calledWith(
      expect.objectContaining({
        queryKey: courseMetadataQuery.queryKey,
      }),
    ).mockResolvedValue(hasCourseMetadata ? mockCourseMetadata : undefined);

    renderWithRouterProvider({
      path: '/:enterpriseSlug/course/:courseKey',
      element: <div>hello world</div>,
      loader: makeCourseLoader(mockQueryClient),
    }, {
      initialEntries: ['/test-enterprise-slug/course/edX+DemoX'],
    });

    expect(await screen.findByText('hello world')).toBeInTheDocument();

    // Assert that the expected number of queries were made.
    const expectedQueryCount = hasCourseMetadata ? 5 : 4;
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledTimes(expectedQueryCount);

    // Course metadata query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryCourseMetadata(mockEnterpriseId, mockCourseMetadata.key).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // Course redemption eligibility query
    if (hasCourseMetadata) {
      expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryCanRedeem(mockEnterpriseId, mockCourseMetadata).queryKey,
          queryFn: expect.any(Function),
        }),
      );
    } else {
      expect(mockQueryClient.ensureQueryData).not.toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: queryCanRedeem(mockEnterpriseId, mockCourseMetadata).queryKey,
          queryFn: expect.any(Function),
        }),
      );
    }

    // Course enrollments query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryEnterpriseCourseEnrollments(mockEnterpriseId).queryKey,
        queryFn: expect.any(Function),
      }),
    );

    // User entitlements query
    expect(mockQueryClient.ensureQueryData).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: queryUserEntitlements().queryKey,
        queryFn: expect.any(Function),
      }),
    );
  });
});
