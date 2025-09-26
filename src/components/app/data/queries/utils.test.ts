import { QueryClient } from '@tanstack/react-query';
import { safeEnsureQueryDataEnterpriseOffers } from './utils';
import { queryEnterpriseLearnerOffers } from './queries';

// Mock the queries module
jest.mock('./queries', () => ({
  queryEnterpriseLearnerOffers: jest.fn(),
}));

const mockQueryEnterpriseLearnerOffers = queryEnterpriseLearnerOffers as jest.MockedFunction<typeof queryEnterpriseLearnerOffers>;

describe('safeEnsureQueryDataEnterpriseOffers', () => {
  let queryClient: QueryClient;
  let enterpriseCustomer: { uuid: string };
  let mockEnsureQueryData: jest.SpyInstance;
  let mockSetQueryData: jest.SpyInstance;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    enterpriseCustomer = { uuid: 'test-enterprise-uuid' };

    // Reset all mocks
    jest.clearAllMocks();

    // Mock QueryClient methods
    mockEnsureQueryData = jest.spyOn(queryClient, 'ensureQueryData');
    mockSetQueryData = jest.spyOn(queryClient, 'setQueryData');

    // Setup default mock return values
    mockQueryEnterpriseLearnerOffers.mockReturnValue({
      queryKey: ['enterprise', 'test-enterprise-uuid', 'subsidies', 'enterpriseOffers'],
      queryFn: jest.fn(),
    });
  });

  it('should return hardcoded data when query succeeds', async () => {
    const expectedReturnValue = {
      enterpriseOffers: [],
      currentEnterpriseOffers: [],
      canEnrollWithEnterpriseOffers: false,
      hasCurrentEnterpriseOffers: false,
      hasLowEnterpriseOffersBalance: false,
      hasNoEnterpriseOffersBalance: true,
    };

    mockEnsureQueryData.mockResolvedValue(expectedReturnValue);

    const result = await safeEnsureQueryDataEnterpriseOffers({
      queryClient,
      enterpriseCustomer,
    });

    // Verify queryEnterpriseLearnerOffers was called with correct UUID
    expect(mockQueryEnterpriseLearnerOffers).toHaveBeenCalledWith('test-enterprise-uuid');

    // Verify ensureQueryData was called with correct query configuration
    expect(mockEnsureQueryData).toHaveBeenCalledWith({
      queryKey: ['enterprise', 'test-enterprise-uuid', 'subsidies', 'enterpriseOffers'],
      queryFn: expect.any(Function),
      retry: false,
    });

    expect(result).toEqual(expectedReturnValue);
  });

  it('should return hardcoded data from queryFn', async () => {
    let capturedQuery: any;

    mockEnsureQueryData.mockImplementation(async (query) => {
      capturedQuery = query;
      return query.queryFn();
    });

    const result = await safeEnsureQueryDataEnterpriseOffers({
      queryClient,
      enterpriseCustomer,
    });

    // Test the queryFn returns hardcoded data
    expect(result).toEqual({
      enterpriseOffers: [],
      currentEnterpriseOffers: [],
      canEnrollWithEnterpriseOffers: false,
      hasCurrentEnterpriseOffers: false,
      hasLowEnterpriseOffersBalance: false,
      hasNoEnterpriseOffersBalance: true,
    });

    // Verify retry is false
    expect(capturedQuery.retry).toBe(false);
  });

  it('should handle different enterprise customer UUID', async () => {
    const differentEnterpriseCustomer = { uuid: 'different-uuid' };

    mockQueryEnterpriseLearnerOffers.mockReturnValue({
      queryKey: ['enterprise', 'different-uuid', 'subsidies', 'enterpriseOffers'],
      queryFn: jest.fn(),
    });

    mockEnsureQueryData.mockResolvedValue({});

    await safeEnsureQueryDataEnterpriseOffers({
      queryClient,
      enterpriseCustomer: differentEnterpriseCustomer,
    });

    expect(mockQueryEnterpriseLearnerOffers).toHaveBeenCalledWith('different-uuid');
    expect(mockEnsureQueryData).toHaveBeenCalledWith({
      queryKey: ['enterprise', 'different-uuid', 'subsidies', 'enterpriseOffers'],
      queryFn: expect.any(Function),
      retry: false,
    });
  });

  it('should return fallback data when query fails', async () => {
    const error = new Error('Query failed');
    mockEnsureQueryData.mockRejectedValue(error);

    const result = await safeEnsureQueryDataEnterpriseOffers({
      queryClient,
      enterpriseCustomer,
    });

    // Should return fallback data
    expect(result).toEqual({
      enterpriseOffers: [],
      currentEnterpriseOffers: [],
      canEnrollWithEnterpriseOffers: false,
      hasCurrentEnterpriseOffers: false,
      hasLowEnterpriseOffersBalance: false,
      hasNoEnterpriseOffersBalance: false,
    });

    // Should set fallback data in query cache
    expect(mockSetQueryData).toHaveBeenCalledWith(
      ['enterprise', 'test-enterprise-uuid', 'subsidies', 'enterpriseOffers'],
      {
        enterpriseOffers: [],
        currentEnterpriseOffers: [],
        canEnrollWithEnterpriseOffers: false,
        hasCurrentEnterpriseOffers: false,
        hasLowEnterpriseOffersBalance: false,
        hasNoEnterpriseOffersBalance: false,
      }
    );
  });
});
