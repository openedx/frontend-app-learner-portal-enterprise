import React from 'react';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import '../../skills-quiz/__mocks__/react-instantsearch-dom';
import { queryClient, renderWithRouter } from '../../../utils/tests';
import '@testing-library/jest-dom';
import Search from '../Search';
import { useDefaultSearchFilters, useEnterpriseCustomer } from '../../app/data';
import { useAlgoliaSearch } from '../../../utils/hooks';
import { enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { features } from '../../../config';

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
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useCouponCodes: jest.fn(() => ({ data: { couponCodeAssignments: [] } })),
  useEnterpriseOffers: jest.fn(() => ({ data: { currentEnterpriseOffers: [] } })),
  useBrowseAndRequestConfiguration: jest.fn(() => ({ data: {} })),
  useContentHighlightsConfiguration: jest.fn(() => ({ data: {} })),
  useCanOnlyViewHighlights: jest.fn(() => ({ data: false })),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
  useDefaultSearchFilters: jest.fn(),
}));
jest.mock('../../../utils/hooks', () => ({
  ...jest.requireActual('../../../utils/hooks'),
  useAlgoliaSearch: jest.fn(),
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
    useAlgoliaSearch.mockReturnValue([{ search: jest.fn(), appId: 'test-app-id' }, { indexName: 'mock-index-name' }]);
  });
  test('renders the video beta banner component', () => {
    features.FEATURE_ENABLE_VIDEO_CATALOG = true;
    renderWithRouter(
      <SearchWrapper>
        <Search />
      </SearchWrapper>,
    );
    expect(screen.getByText('Videos Now Available with Your Subscription')).toBeInTheDocument();
  });
});
