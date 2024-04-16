import { renderHook } from '@testing-library/react-hooks';
import { QueryClientProvider } from '@tanstack/react-query';
import { getConfig } from '@edx/frontend-platform';
import { enterpriseCustomerFactory } from '../services/data/__factories__';
import useEnterpriseCustomer from './useEnterpriseCustomer';
import { queryClient } from '../../../../utils/tests';
import { fetchContentHighlights } from '../services';
import useContentHighlightSets from './useContentHighlightSets';

jest.mock('./useEnterpriseCustomer');

jest.mock('../services', () => ({
  ...jest.requireActual('../services'),
  fetchContentHighlights: jest.fn().mockResolvedValue(null),
}));
jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(),
}));
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockContentHighlightSets = [
  {
    uuid: 'test-highlight-set',
    title: 'sample highlight',
    isPublished: true,
    enterpriseCuration: 'test-curation-uuid',
    cardImageUrl: 'https://placehold.co/400',
    highlightedContent: [
      {
        uuid: 'test-course1',
        aggregationKey: 'edX+DemoX',
        contentType: 'course',
        title: 'Sample Course 1',
        cardImageUrl: 'https://placehold.co/500',
        authoringOrganizations: [
          {
            uuid: 'test-organization-uuid1',
            name: 'edx',
            logoImageUrl: 'https://placehold.co/600',
          },
        ],
        courseRunStatuses: ['published'],
      },
    ],
  },
];

describe('useContentHighlightSets', () => {
  const Wrapper = ({ children }) => (
    <QueryClientProvider client={queryClient()}>
      {children}
    </QueryClientProvider>
  );
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    fetchContentHighlights.mockResolvedValue(mockContentHighlightSets);
    getConfig.mockReturnValue({
      FEATURE_CONTENT_HIGHLIGHTS: true,
    });
  });
  it('should handle resolved value correctly when select is not passed as a parameter', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useContentHighlightSets(), { wrapper: Wrapper });
    await waitForNextUpdate();

    expect(result.current).toEqual(
      expect.objectContaining({
        data: mockContentHighlightSets,
        isLoading: false,
        isFetching: false,
      }),
    );
  });
  it(
    'should handle resolved value correctly when select is not passed as a parameter and FEATURE_CONTENT_HIGHLIGHTS are disabled',
    () => {
      getConfig.mockReturnValue({
        FEATURE_CONTENT_HIGHLIGHTS: false,
      });
      const { result } = renderHook(() => useContentHighlightSets(), { wrapper: Wrapper });

      expect(result.current).toEqual(
        expect.objectContaining({
          data: undefined,
        }),
      );
    },
  );
  it(
    'should handle resolved value correctly when select is passed as a parameter, and filters empty highlight sets',
    async () => {
      const mockUpdatedContentHighlightSets = [
        ...mockContentHighlightSets,
        {
          uuid: 'test-highlight-set-2',
          title: 'sample highlight',
          isPublished: true,
          enterpriseCuration: 'test-curation-uuid',
          cardImageUrl: 'https://placehold.co/400',
          highlightedContent: [],
        },
      ];
      fetchContentHighlights.mockResolvedValue(mockUpdatedContentHighlightSets);
      const { result, waitForNextUpdate } = renderHook(() => useContentHighlightSets({
        select: (data) => data,
      }), { wrapper: Wrapper });
      await waitForNextUpdate();

      expect(result.current.data.original).toEqual(mockUpdatedContentHighlightSets);
      expect(result.current.data.transformed).not.toEqual(mockUpdatedContentHighlightSets);

      expect(result.current.data.original.length).toEqual(2);
      expect(result.current.data.transformed.length).toEqual(1);
    },
  );
});
