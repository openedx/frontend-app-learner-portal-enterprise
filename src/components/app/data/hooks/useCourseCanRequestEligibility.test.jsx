import { renderHook } from '@testing-library/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import useCourseCanRequestEligibility from './useCourseCanRequestEligibility';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryCanRequest } from '../queries';

jest.mock('./useEnterpriseCustomer');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));
jest.mock('../queries', () => ({
  queryCanRequest: jest.fn(),
}));

describe('useCourseCanRequestEligibility', () => {
  const mockEnterpriseCustomer = { uuid: 'enterprise-uuid' };
  const mockCourseKey = 'course-v1:edX+DemoX+Demo_Course';
  const mockQuery = { queryKey: ['canRequest', mockEnterpriseCustomer.uuid, mockCourseKey], queryFn: jest.fn() };
  const mockQueryResult = { data: { canRequest: true }, isLoading: false };

  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useParams.mockReturnValue({ courseKey: mockCourseKey });
    queryCanRequest.mockReturnValue(mockQuery);
    useQuery.mockReturnValue(mockQueryResult);
  });

  it('calls useEnterpriseCustomer and useParams', () => {
    renderHook(() => useCourseCanRequestEligibility());
    expect(useEnterpriseCustomer).toHaveBeenCalled();
    expect(useParams).toHaveBeenCalled();
  });

  it('calls queryCanRequest with correct params', () => {
    renderHook(() => useCourseCanRequestEligibility());
    expect(queryCanRequest).toHaveBeenCalledWith(mockEnterpriseCustomer.uuid, mockCourseKey);
  });

  it('calls useQuery with the result of queryCanRequest', () => {
    renderHook(() => useCourseCanRequestEligibility());
    expect(useQuery).toHaveBeenCalledWith(mockQuery);
  });

  it('returns the result from useQuery', () => {
    const { result } = renderHook(() => useCourseCanRequestEligibility());
    expect(result.current).toBe(mockQueryResult);
  });
});
