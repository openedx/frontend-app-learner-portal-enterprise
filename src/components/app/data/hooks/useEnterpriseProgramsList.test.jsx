import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchLearnerProgramsList } from '../services';
import useEnterpriseProgramsList from './useEnterpriseProgramsList';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchLearnerProgramsList: jest.fn().mockResolvedValue(null),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockProgramsListData = [
  {
    uuid: 'test-uuid',
    title: 'Test Program Title',
    type: 'MicroMasters',
    bannerImage: {
      large: {
        url: 'www.example.com/large',
        height: 123,
        width: 455,
      },
      medium: {
        url: 'www.example.com/medium',
        height: 123,
        width: 455,
      },
      small: {
        url: 'www.example.com/small',
        height: 123,
        width: 455,
      },
      xSmall: {
        url: 'www.example.com/xSmall',
        height: 123,
        width: 455,
      },
    },
    authoringOrganizations: [
      {
        key: 'test-key',
        logoImageUrl: '/media/organization/logos/shield.png',
      },
    ],
    progress: {
      inProgress: 1,
      completed: 2,
      notStarted: 3,
    },
  },
];
describe('useEnterpriseProgramsList', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchLearnerProgramsList.mockResolvedValue(mockProgramsListData);
  });
  it('should handle resolved value correctly', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useEnterpriseProgramsList(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockProgramsListData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
});
