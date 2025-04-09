import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import SearchCourse from '../SearchCourse';
import '../../skills-quiz/__mocks__/react-instantsearch-dom';
import { renderWithRouter } from '../../../utils/tests';
import '@testing-library/jest-dom';
import SearchProgram from '../SearchProgram';
import SearchPathway from '../SearchPathway';
import Search from '../Search';
import {
  useAlgoliaSearch,
  useDefaultSearchFilters,
  useEnterpriseCustomer,
  useHasValidLicenseOrSubscriptionRequestsEnabled,
} from '../../app/data';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import SearchVideo from '../SearchVideo';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(() => ({ data: { subscriptionLicense: null } })),
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useCouponCodes: jest.fn(() => ({ data: { couponCodeAssignments: [] } })),
  useEnterpriseOffers: jest.fn(() => ({ data: { currentEnterpriseOffers: [] } })),
  useBrowseAndRequestConfiguration: jest.fn(() => ({ data: {} })),
  useContentHighlightsConfiguration: jest.fn(() => ({ data: {} })),
  useCanOnlyViewHighlights: jest.fn(() => ({ data: {} })),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
  useEnterpriseFeatures: jest.fn().mockReturnValue({ data: undefined }),
  useDefaultSearchFilters: jest.fn(),
  useHasValidLicenseOrSubscriptionRequestsEnabled: jest.fn(),
  useAlgoliaSearch: jest.fn(),
}));

jest.mock('../../../utils/optimizely', () => ({
  ...jest.requireActual('../../../utils/optimizely'),
  pushEvent: jest.fn(),
}));

const searchContext1 = {
  refinements: { showAll: 1, content_type: ['course'] },
  dispatch: () => null,
};
const searchContext2 = {
  refinements: { showAll: 1, content_type: ['program'] },
  dispatch: () => null,
};
const searchContext3 = {
  refinements: { showAll: 1, content_type: ['learnerpathway'] },
  dispatch: () => null,
};
const searchContext4 = {
  refinements: { showAll: 1, content_type: ['video'] },
  dispatch: () => null,
};

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id' },
};

const SearchWrapper = ({
  appState = initialAppState,
  searchContext = searchContext1,
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

describe('SearchSections', () => {
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

  test('renders the course section with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <SearchCourse filter={mockFilter} />
      </SearchWrapper>,
    );
    expect(screen.getByText('Courses (2 results)')).toBeInTheDocument();
  });
  test('renders the video section with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <SearchVideo filter={mockFilter} />
      </SearchWrapper>,
    );
    expect(screen.getByText('Videos (2 results)')).toBeInTheDocument();
  });

  test('renders the program section with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <SearchProgram filter={mockFilter} />
      </SearchWrapper>,
    );
    expect(screen.getByText('Programs (2 results)')).toBeInTheDocument();
  });

  test('renders the pathways section with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <SearchPathway filter={mockFilter} />
      </SearchWrapper>,
    );
    expect(screen.getByText('Pathways (2 results)')).toBeInTheDocument();
  });

  test('renders the course search component with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Courses (2 results)')).toBeInTheDocument();
  });
  test('renders the video search component with the correct title', () => {
    renderWithRouter(
      <SearchWrapper searchContext={searchContext4}>
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Videos (2 results)')).toBeInTheDocument();
  });

  test('renders the program search component with the correct title', () => {
    renderWithRouter(
      <SearchWrapper
        searchContext={searchContext2}
      >
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Programs (2 results)')).toBeInTheDocument();
  });
  test('renders the pathway search component with the correct title', () => {
    renderWithRouter(
      <SearchWrapper
        searchContext={searchContext3}
      >
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Pathways (2 results)')).toBeInTheDocument();
  });
});
