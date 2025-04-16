import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import * as MockReactInstantSearch from '../../skills-quiz/__mocks__/react-instantsearch-dom';
import { generateTestPermutations, renderWithRouter } from '../../../utils/tests';
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
  <IntlProvider locale="en">
    <AppContext.Provider value={appState}>
      <SearchContext.Provider value={searchContext}>
        {children}
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);
const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockFilter = `enterprise_customer_uuids: ${mockEnterpriseCustomer.uuid}`;
const mockSearchClient = { search: jest.fn(), appId: 'test-app-id' };
const mockSearchIndex = { indexName: 'mock-index-name' };
describe('<Search />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue(mockFilter);
    useHasValidLicenseOrSubscriptionRequestsEnabled.mockReturnValue(true);
    useAlgoliaSearch.mockReturnValue({
      searchClient: mockSearchClient,
      searchIndex: mockSearchIndex,
    });
    MockReactInstantSearch.configure.nbHits = 2;
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
    MockReactInstantSearch.configure.nbHits = 0;

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
      searchClient: [null, mockSearchClient],
    }),
  )('renders the search client error page if no search client is found', ({
    canOnlyViewHighlights,
    searchClient,
  }) => {
    useAlgoliaSearch.mockReturnValue({
      searchClient,
    });
    useCanOnlyViewHighlights.mockReturnValue({ data: canOnlyViewHighlights });
    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );

    if (!searchClient && !canOnlyViewHighlights) {
      expect(screen.getByText(messages.alertHeading.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertText.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionsHeader.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionRefresh.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionNetwork.defaultMessage)).toBeInTheDocument();
      expect(screen.getByText(messages.alertTextOptionSupport.defaultMessage)).toBeInTheDocument();
    } else if (searchClient || canOnlyViewHighlights) {
      expect(screen.queryByText(messages.alertHeading.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertText.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionsHeader.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionRefresh.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionNetwork.defaultMessage)).not.toBeInTheDocument();
      expect(screen.queryByText(messages.alertTextOptionSupport.defaultMessage)).not.toBeInTheDocument();
    }
  });
});
