import { useMatch } from 'react-router-dom';
import { renderHook } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';

import useRecommendCoursesForMe from './useRecommendCoursesForMe';
import useContentHighlightsConfiguration from './useContentHighlightsConfiguration';
import useIsAssignmentsOnlyLearner from './useIsAssignmentsOnlyLearner';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useMatch: jest.fn(),
}));

jest.mock('./useContentHighlightsConfiguration', () => jest.fn().mockReturnValue({
  data: {
    canOnlyViewHighlightSets: false,
  },
}));
jest.mock('./useIsAssignmentsOnlyLearner', () => jest.fn().mockReturnValue(false));
jest.mock('./useEnterpriseCustomer', () => jest.fn());

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

const wrapper = ({ children }) => (
  <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
    {children}
  </AppContext.Provider>
);

describe('useRecommendCoursesForMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  it('should not show recommend course CTA by default', () => {
    const { result } = renderHook(() => useRecommendCoursesForMe(), { wrapper });
    expect(result.current).toEqual({
      shouldRecommendCourses: false,
    });
  });

  it.each([
    {
      mockRouteMatch: null, // simulates non-search page route
      canOnlyViewHighlightSets: false,
      isAssignmentsOnlyLearner: false,
      enableOneAcademy: false,
      hasRecommendCourseCTA: false,
    },
    {
      mockRouteMatch: { path: '/search' }, // simulates search page route
      canOnlyViewHighlightSets: false,
      isAssignmentsOnlyLearner: false,
      enableOneAcademy: false,
      hasRecommendCourseCTA: true,
    },
    {
      mockRouteMatch: { path: '/search' }, // simulates search page route
      canOnlyViewHighlightSets: true,
      isAssignmentsOnlyLearner: false,
      enableOneAcademy: false,
      hasRecommendCourseCTA: false,
    },
    {
      mockRouteMatch: { path: '/search' }, // simulates search page route
      canOnlyViewHighlightSets: false,
      isAssignmentsOnlyLearner: false,
      enableOneAcademy: true,
      hasRecommendCourseCTA: false,
    },
  ])('should support showing recommend course CTA, when appropriate (%s)', async ({
    mockRouteMatch,
    canOnlyViewHighlightSets,
    isAssignmentsOnlyLearner,
    enableOneAcademy,
    hasRecommendCourseCTA,
  }) => {
    useMatch.mockReturnValue(mockRouteMatch);
    useContentHighlightsConfiguration.mockReturnValue({
      data: {
        canOnlyViewHighlightSets,
      },
    });
    useIsAssignmentsOnlyLearner.mockReturnValue(isAssignmentsOnlyLearner);
    useEnterpriseCustomer.mockReturnValue({ data: { ...mockEnterpriseCustomer, enableOneAcademy } });

    const { result } = renderHook(() => useRecommendCoursesForMe(), { wrapper });

    if (hasRecommendCourseCTA) {
      expect(result.current).toEqual(
        expect.objectContaining({
          shouldRecommendCourses: true,
        }),
      );
    } else {
      expect(result.current).toEqual({
        shouldRecommendCourses: false,
      });
    }
  });
});
