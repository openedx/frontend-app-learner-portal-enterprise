import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { resetMockReactInstantSearch, setFakeHits } from '../../skills-quiz/__mocks__/react-instantsearch-dom';
import { generateTestPermutations, queryClient, renderWithRouter } from '../../../utils/tests';
import '@testing-library/jest-dom';
import Search from '../Search';
import {
  useAlgoliaSearch,
  useCanOnlyViewHighlights,
  useDefaultSearchFilters,
  useEnterpriseCustomer,
  useHasValidLicenseOrSubscriptionRequestsEnabled,
} from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { features } from '../../../config';
import { messages } from '../../search-unavailable-alert/SearchUnavailableAlert';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(() => ({
    data: {
      subscriptionLicense: {
        status: 'activated',
        subscriptionPlan: { isCurrent: true },
      },
    },
  })),
  useAlgoliaSearch: jest.fn(),
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useCouponCodes: jest.fn(() => ({ data: { couponCodeAssignments: [] } })),
  useEnterpriseOffers: jest.fn(() => ({ data: { currentEnterpriseOffers: [] } })),
  useBrowseAndRequestConfiguration: jest.fn(() => ({ data: {} })),
  useContentHighlightsConfiguration: jest.fn(() => ({ data: {} })),
  useCanOnlyViewHighlights: jest.fn(() => ({ data: false })),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
  useDefaultSearchFilters: jest.fn(),
  useHasValidLicenseOrSubscriptionRequestsEnabled: jest.fn(),
}));

jest.mock('../../../utils/optimizely', () => ({
  ...jest.requireActual('../../../utils/optimizely'),
  pushEvent: jest.fn(),
}));
const searchContext4 = {
  refinements: { content_type: undefined },
  dispatch: () => null,
};
const initialAppState = {
  authenticatedUser: { userId: 'test-user-id' },
};

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  SearchHeader: jest.fn(() => <div data-testid="search-header" />),
}));

const SearchWrapper = ({
  appState = initialAppState,
  searchContext = searchContext4,
  children,
}) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={appState}>
        <SearchContext.Provider value={searchContext}>
          {children}
        </SearchContext.Provider>
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockFilter = `enterprise_customer_uuids: ${mockEnterpriseCustomer.uuid}`;
describe('<Search />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue(mockFilter);
    useHasValidLicenseOrSubscriptionRequestsEnabled.mockReturnValue(true);
    useAlgoliaSearch.mockReturnValue({
      searchClient: {
        search: jest.fn(), appId: 'test-app-id',
      },
      searchIndex: {
        indexName: 'mock-index-name',
      },
    });
  });
  afterEach(() => {
    resetMockReactInstantSearch();
  });
  it('renders the video beta banner component', () => {
    features.FEATURE_ENABLE_VIDEO_CATALOG = true;
    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Videos Now Available with Your Subscription')).toBeInTheDocument();
  });
  it('renders correctly when no search results are found', () => {
    setFakeHits([]);

    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );

    expect(screen.queryByText('Videos Now Available with Your Subscription')).toBeNull();
  });
  it.each(
    generateTestPermutations({
      canOnlyViewHighlights: [true, false],
      useAlgoliaSearchReturnValue: [{
        searchClient: null,
        searchIndex: null,
      }, {
        searchClient: {
          search: jest.fn(), appId: 'test-app-id',
        },
        searchIndex: {
          indexName: 'mock-index-name',
        },
      }],
    }),
  )('renders the search client error page if no search client is found', ({
    canOnlyViewHighlights,
    useAlgoliaSearchReturnValue,
  }) => {
    useAlgoliaSearch.mockReturnValue(useAlgoliaSearchReturnValue);
    useCanOnlyViewHighlights.mockReturnValue({ data: canOnlyViewHighlights });
    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );

    // Validate the SearchUnavailableAlert is being displayed when no search client is present and whether
    // highlights are not the only visible content
    if (!useAlgoliaSearchReturnValue.searchClient && !canOnlyViewHighlights) {
      expect(screen.getByText(messages.alertHeading.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertText.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionsHeader.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionRefresh.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionNetwork.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionSupport.defaultMessage)).toBeInTheDocument();
    } else if (useAlgoliaSearchReturnValue.searchClient || canOnlyViewHighlights) {
      expect(screen.queryByText(messages.alertHeading.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertText.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionsHeader.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionRefresh.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionNetwork.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionSupport.defaultMessage)).not.toBeInTheDocument();
    }
  });
});
