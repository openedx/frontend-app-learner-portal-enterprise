import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCuration } from '../services';
import useContentHighlightsConfiguration from './useContentHighlightsConfiguration';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { enterpriseCustomerFactory } from '../services/data/__factories__';

jest.mock('./useEnterpriseCustomer');

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchEnterpriseCuration: jest.fn().mockResolvedValue(null),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockEnterpriseCurations = {
  id: '123',
  name: 'Test Enterprise',
  canOnlyViewHighlightSets: false,
};

describe('useContentHighlightsConfiguration', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchEnterpriseCuration.mockResolvedValue(mockEnterpriseCurations);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useContentHighlightsConfiguration(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockEnterpriseCurations,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
