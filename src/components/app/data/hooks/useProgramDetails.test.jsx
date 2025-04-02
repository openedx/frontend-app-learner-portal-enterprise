import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchProgramDetails } from '../services';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useProgramDetails from './useProgramDetails';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchProgramDetails: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockProgramDetails = {
  title: 'Test Program Title',
  courses: [
    {
      key: 'edX+DemoX',
      title: 'Test Course 1 Title',
      shortDescription: 'Test course 1 description',
      courseRuns: [
        {
          title: 'Test Course Run 1 Title',
          start: '2013-02-05T05:00:00Z',
          shortDescription: 'Test course 1 description',
        },
      ],
      enterpriseHasCourse: true,
    },
  ],
  catalogContainsProgram: false,
};
describe('useProgramDetails', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    fetchProgramDetails.mockResolvedValue(mockProgramDetails);
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useParams.mockReturnValue({ programUUID: 'test-program-uuid' });
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useProgramDetails(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockProgramDetails,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});
