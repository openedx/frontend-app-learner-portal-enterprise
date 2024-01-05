import { AppContext } from '@edx/frontend-platform/react';
import { useParams, useMatch } from 'react-router-dom';
import { renderHook, act } from '@testing-library/react-hooks';

import useRecommendCoursesForMe from './useRecommendCoursesForMe';
import { useEnterpriseCuration } from '../../search/content-highlights/data';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
  useMatch: jest.fn(),
}));

jest.mock('../../search/content-highlights/data', () => ({
  useEnterpriseCuration: jest.fn(),
}));

useParams.mockReturnValue({ enterpriseSlug: 'test-enterprise' });
useEnterpriseCuration.mockReturnValue({
  enterpriseCuration: {
    canOnlyViewHighlightSets: false,
  },
});

const wrapper = ({ children }) => (
  <AppContext.Provider value={{ enterpriseConfig: { uuid: 'test-uuid' } }}>
    {children}
  </AppContext.Provider>
);

describe('useRecommendCoursesForMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not show recommend course CTA by default', () => {
    const { result } = renderHook(() => useRecommendCoursesForMe(), { wrapper });
    expect(result.current).toEqual({
      shouldRecommendCourses: false,
      showRecommendCourses: expect.any(Function),
      hideRecommendCourses: expect.any(Function),
    });
  });

  it.each([
    {
      mockRouteMatch: null, // simulates non-search page route
      canOnlyViewHighlightSets: false,
      hasRecommendCourseCTA: false,
    },
    {
      mockRouteMatch: { path: '/search' }, // simulates search page route
      canOnlyViewHighlightSets: false,
      hasRecommendCourseCTA: true,
    },
    {
      mockRouteMatch: { path: '/search' }, // simulates search page route
      canOnlyViewHighlightSets: true,
      hasRecommendCourseCTA: false,
    },
  ])('should support showing recommend course CTA, when appropriate (%s)', async ({
    mockRouteMatch,
    canOnlyViewHighlightSets,
    hasRecommendCourseCTA,
  }) => {
    useMatch.mockReturnValue(mockRouteMatch);
    useEnterpriseCuration.mockReturnValue({
      enterpriseCuration: {
        canOnlyViewHighlightSets,
      },
    });

    const { result } = renderHook(() => useRecommendCoursesForMe(), { wrapper });
    const {
      showRecommendCourses,
      hideRecommendCourses,
    } = result.current;

    expect(result.current).toEqual({
      shouldRecommendCourses: false,
      showRecommendCourses: expect.any(Function),
      hideRecommendCourses: expect.any(Function),
    });

    act(() => {
      showRecommendCourses();
    });

    if (hasRecommendCourseCTA) {
      expect(result.current).toEqual(
        expect.objectContaining({
          shouldRecommendCourses: true,
        }),
      );

      act(() => {
        hideRecommendCourses();
      });

      expect(result.current).toEqual(
        expect.objectContaining({
          shouldRecommendCourses: false,
        }),
      );
    } else {
      expect(result.current).toEqual({
        shouldRecommendCourses: false,
        showRecommendCourses: expect.any(Function),
        hideRecommendCourses: expect.any(Function),
      });
    }
  });
});
