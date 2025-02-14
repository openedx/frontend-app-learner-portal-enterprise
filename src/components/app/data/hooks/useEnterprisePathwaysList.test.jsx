import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { camelCaseObject } from '@edx/frontend-platform';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchInProgressPathways } from '../services';
import useEnterprisePathwaysList from './useEnterprisePathwaysList';
import learnerPathwayData from '../../../pathway-progress/data/__mocks__/PathwayProgressListData.json';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchInProgressPathways: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const camelCasedLearnerPathwayData = camelCaseObject(learnerPathwayData);
describe('useEnterprisePathwaysList', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchInProgressPathways.mockResolvedValue(camelCasedLearnerPathwayData);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useEnterprisePathwaysList(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: camelCasedLearnerPathwayData,
          isPending: false,
          isFetching: false,
        }),
      );
    });
  });
});
