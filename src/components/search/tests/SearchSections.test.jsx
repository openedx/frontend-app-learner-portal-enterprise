import React from 'react';
import { screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { AppContext } from '@edx/frontend-platform/react';
import { QueryClientProvider } from '@tanstack/react-query';
import SearchCourse from '../SearchCourse';
import '../../skills-quiz/__mocks__/react-instantsearch-dom';
import { queryClient, renderWithRouter } from '../../../utils/tests';
import '@testing-library/jest-dom';
import SearchProgram from '../SearchProgram';
import SearchPathway from '../SearchPathway';
import Search, { sendPushEvent } from '../Search';
import { EVENTS, pushEvent } from '../../../utils/optimizely';
import { useEnterpriseCustomer } from '../../app/data';
import { useAlgoliaSearch } from '../../../utils/hooks';

const mockEnterpriseCustomer = {
  name: 'test-enterprise',
  slug: 'test',
  uuid: '12345',
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useSubscriptions: jest.fn(() => ({ data: { subscriptionLicense: {} } })),
  useRedeemablePolicies: jest.fn(() => ({ data: { redeemablePolicies: [] } })),
  useCouponCodes: jest.fn(() => ({ data: { couponCodeAssignments: [] } })),
  useEnterpriseOffers: jest.fn(() => ({ data: { currentEnterpriseOffers: [] } })),
  useBrowseAndRequestConfiguration: jest.fn(() => ({ data: {} })),
  useContentHighlightsConfiguration: jest.fn(() => ({ data: {} })),
  useCanOnlyViewHighlights: jest.fn(() => ({ data: {} })),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
}));

jest.mock('../../../utils/hooks', () => ({
  ...jest.requireActual('../../../utils/hooks'),
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

const initialAppState = {
  authenticatedUser: { userId: 'test-user-id' },
};

const mockFilter = 'enterprise_customer_uuids: test-uuid';

const SearchWrapper = ({
  appState = initialAppState,
  searchContext = searchContext1,
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

describe('<Search />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useAlgoliaSearch.mockReturnValue([{ search: jest.fn(), appId: 'test-app-id' }, { indexName: 'mock-index-name' }]);
  });

  test('renders the course section with the correct title', () => {
    renderWithRouter(
      <SearchWrapper>
        <SearchCourse filter={mockFilter} />
      </SearchWrapper>,
    );
    expect(screen.getByText('Courses (2 results)')).toBeInTheDocument();
  });
  test('renders the programe section with the correct title', () => {
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

  describe('pushEvent', () => {
    test.each([
      [true, 'test-course-101', EVENTS.PREQUERY_SUGGESTION_CLICK],
      [false, 'test-course-102', EVENTS.SEARCH_SUGGESTION_CLICK],
    ])('if isPrequeryEnabled is %p with course metadata %p, submit event %p', (isPrequeryEnabled, courseKeyMetadata, event) => {
      sendPushEvent(isPrequeryEnabled, courseKeyMetadata);
      expect(pushEvent).toHaveBeenCalledWith(event, { courseKeyMetadata });
    });
  });
});
