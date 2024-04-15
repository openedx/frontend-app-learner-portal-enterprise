import { AppContext } from '@edx/frontend-platform/react';
import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import useAcademies from './useAcademies';
import { queryClient } from '../../../../utils/tests';
import { fetchAcademies } from '../services';

jest.mock('./useEnterpriseCustomer');
jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchAcademies: jest.fn().mockResolvedValue(null),
}));
const mockAuthenticatedUser = {
  authenticatedUser: authenticatedUserFactory(),
};
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAcademyData = {
  uuid: 'academy-uuid',
  title: 'My Awesome Academy',
  shortDescription: 'I am a short academy description.',
  longDescription: 'I am an awesome academy.',
  image: 'example.com/academies/images/awesome-academy.png',
  tags: [
    {
      id: 111,
      title: 'wowwww',
      description: 'description 111',
    },
    {
      id: 222,
      title: 'boooo',
      description: 'description 222',
    },
  ],
};

describe('useAcademies', () => {
  const Wrapper = ({ children }) => (
    // eslint-disable-next-line react/jsx-filename-extension
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={mockAuthenticatedUser}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  it('should resolved correctly', async () => {
    fetchAcademies.mockResolvedValue(mockAcademyData);
    const { result, waitForNextUpdate } = renderHook(() => useAcademies(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockAcademyData,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it('should rejected correctly', async () => {
    const errorMessage = new Error({ message: 'Test Error' });
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
