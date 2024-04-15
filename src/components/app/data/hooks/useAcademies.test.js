import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useAcademies from './useAcademies';
import { queryClient } from '../../../../utils/tests';
import { fetchAcademies } from '../services';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchAcademies: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAcademyListData = [
  {
    uuid: 'test-uuid-1',
    title: 'Test Academy 1',
    short_description: 'All enterprise - All catalogs',
    long_description: 'All enterprise - All catalogs',
    image: 'http://google.com',
    tags: [
      {
        id: 1,
        title: 'Test tag1',
        description: 'Test tag1',
      },
    ],
  },
  {
    uuid: 'test-uuid-2',
    title: 'Test Academy3',
    short_description: 'Test Academy3',
    long_description: 'Test Academy3',
    image: 'https://picsum.photos/400/200',
    tags: [
      {
        id: 2,
        title: 'test tag 2',
        description: 'test tag 2',
      },
    ],
  },
];

describe('useAcademies', () => {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should handle resolved value correctly', async () => {
    fetchAcademies.mockResolvedValue(mockAcademyListData);
    const { result, waitForNextUpdate } = renderHook(() => useAcademies(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockAcademyListData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should handle rejected value correctly', async () => {
    const errorMessage = new Error('Test Error');
    fetchAcademies.mockRejectedValue(errorMessage);
    const { result, waitForNextUpdate } = renderHook(() => useAcademies(), { wrapper: Wrapper });
    await waitForNextUpdate();
    expect(result.current).toEqual(
      expect.objectContaining({
        data: undefined,
        failureReason: errorMessage,
        isError: true,
      }),
    );
  });
});
