import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../../../../utils/tests';
import { fetchEnterpriseCuration } from '../services';
import useContentHighlightsConfiguration, { useCanOnlyViewHighlights } from './useContentHighlightsConfiguration';
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
  isHighlightFeatureActive: true,
};
const Wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient()}>
    {children}
  </QueryClientProvider>
);

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
fetchEnterpriseCuration.mockResolvedValue(mockEnterpriseCurations);

describe('useContentHighlightsConfiguration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

describe('useCanOnlyViewHighlights', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it('should handle resolved value correctly when isHighlightFeatureActive is enabled', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useCanOnlyViewHighlights(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockEnterpriseCurations.canOnlyViewHighlightSets,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle resolved value correctly when isHighlightFeatureActive is disabled', async () => {
    const updatedMockEnterpriseCuration = {
      ...mockEnterpriseCurations,
      isHighlightFeatureActive: false,
    };
    fetchEnterpriseCuration.mockResolvedValue(updatedMockEnterpriseCuration);
    const { result, waitForNextUpdate } = renderHook(() => useCanOnlyViewHighlights(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: false,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle resolved value correctly when isHighlightFeatureActive is not present in the object', async () => {
    delete mockEnterpriseCurations.isHighlightFeatureActive;
    fetchEnterpriseCuration.mockResolvedValue(mockEnterpriseCurations);
    const { result, waitForNextUpdate } = renderHook(() => useCanOnlyViewHighlights(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: false,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
