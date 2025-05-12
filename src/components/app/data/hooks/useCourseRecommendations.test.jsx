import { Suspense } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchCourseRecommendations } from '../services';
import useCourseRecommendations from './useCourseRecommendations';
import useSearchCatalogs from './useSearchCatalogs';

jest.mock('./useEnterpriseCustomer');
jest.mock('./useSearchCatalogs');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchCourseRecommendations: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();
const mockCourseRecommendations = {
  allRecommendations: ['test-course-recommendations'],
  samePartnerRecommendations: ['test-same-partner-recommendations'],
};

describe('useCourseRecommendations', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <Suspense fallback={<div>Loading...</div>}>
          {children}
        </Suspense>
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchCourseRecommendations.mockResolvedValue(mockCourseRecommendations);
    useSearchCatalogs.mockReturnValue(['sample-catalog-uuid']);
    useParams.mockReturnValue({ courseKey: 'edX+DemoX' });
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useCourseRecommendations(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockCourseRecommendations,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
