import { renderHook, waitFor } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { AppContext } from '@edx/frontend-platform/react';
import { useParams } from 'react-router-dom';
import { queryClient } from '../../../../utils/tests';
import { fetchAcademiesDetail } from '../services';
import useAcademyDetails from './useAcademyDetails';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchAcademiesDetail: jest.fn().mockResolvedValue(null),
}));
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: jest.fn(),
}));
jest.mock('./useEnterpriseCustomer');

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const mockAcademyDetailsData = {
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

describe('useAcademiesDetails', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useParams.mockReturnValue({ academyUUID: 'academy-uuid', enterpriseUUID: mockEnterpriseCustomer.uuid });
    fetchAcademiesDetail.mockResolvedValue(mockAcademyDetailsData);
  });
  it('should handle resolved value correctly', async () => {
    const { result } = renderHook(() => useAcademyDetails(), { wrapper: Wrapper });
    await waitFor(() => {
      expect(result.current).toEqual(
        expect.objectContaining({
          data: mockAcademyDetailsData,
          isLoading: false,
          isFetching: false,
        }),
      );
    });
  });
});
