import { renderHook } from '@testing-library/react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import React from 'react';

import useCourseRequest from '../useCourseRequest';
import { queryCanRequest } from '../../../../app/data/queries';
import useEnterpriseCustomer from '../../../../app/data/hooks/useEnterpriseCustomer';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../app/data/services/data/__factories__';

// Mock dependencies
jest.mock('react-router-dom', () => ({
  useParams: jest.fn(),
}));

jest.mock('@tanstack/react-query', () => ({
  useQuery: jest.fn(),
}));

jest.mock('../../../../app/data/queries', () => ({
  queryCanRequest: jest.fn(),
}));

jest.mock('../../../../app/data/hooks/useEnterpriseCustomer', () => jest.fn());

const mockAuthenticatedUser = authenticatedUserFactory();
const mockEnterpriseCustomer = enterpriseCustomerFactory();

interface WrapperProps {
  children: React.ReactNode;
}

const Wrapper = ({ children }: WrapperProps) => (
  <AppContext.Provider value={mockAuthenticatedUser}>
    {children}
  </AppContext.Provider>
);

describe('useCourseRequest', () => {
  const mockCourseKey = 'course-v1:edX+DemoX+Demo_Course';
  const mockQueryResult = {
    data: { canRequest: true },
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useParams as jest.Mock).mockReturnValue({
      courseKey: mockCourseKey,
    });

    (useEnterpriseCustomer as jest.Mock).mockReturnValue({
      data: mockEnterpriseCustomer,
    });

    (queryCanRequest as jest.Mock).mockReturnValue({
      queryKey: ['canRequest', mockEnterpriseCustomer.uuid, mockCourseKey],
      queryFn: jest.fn(),
    });

    (useQuery as jest.Mock).mockReturnValue(mockQueryResult);
  });

  it('should call useEnterpriseCustomer to get enterprise customer data', () => {
    renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(useEnterpriseCustomer).toHaveBeenCalledTimes(1);
  });

  it('should call useParams to get courseKey from URL params', () => {
    renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(useParams).toHaveBeenCalledTimes(1);
  });

  it('should call queryCanRequest with correct parameters', () => {
    renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(queryCanRequest).toHaveBeenCalledTimes(1);
    expect(queryCanRequest).toHaveBeenCalledWith(
      mockEnterpriseCustomer.uuid,
      mockCourseKey,
    );
  });

  it('should call useQuery with the result from queryCanRequest', () => {
    const mockQuery = {
      queryKey: ['canRequest', mockEnterpriseCustomer.uuid, mockCourseKey],
      queryFn: jest.fn(),
    };
    (queryCanRequest as jest.Mock).mockReturnValue(mockQuery);

    renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(useQuery).toHaveBeenCalledTimes(1);
    expect(useQuery).toHaveBeenCalledWith(mockQuery);
  });

  it('should return the result from useQuery', () => {
    const { result } = renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(result.current).toEqual(mockQueryResult);
  });

  it('should handle loading state', () => {
    const loadingResult = {
      data: undefined,
      isLoading: true,
      error: null,
    };
    (useQuery as jest.Mock).mockReturnValue(loadingResult);

    const { result } = renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(result.current).toEqual(loadingResult);
  });

  it('should handle error state', () => {
    const errorResult = {
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    };
    (useQuery as jest.Mock).mockReturnValue(errorResult);

    const { result } = renderHook(() => useCourseRequest(), { wrapper: Wrapper });

    expect(result.current).toEqual(errorResult);
  });
});
