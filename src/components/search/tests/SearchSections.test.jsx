import React from 'react';
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
import Search, { sendPushEvent } from '../Search';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { SUBSIDY_TYPE, SubsidyRequestsContext } from '../../enterprise-subsidy-requests';
import { EVENTS, pushEvent } from '../../../utils/optimizely';

const APP_CONFIG = {
  ALGOLIA_INDEX_NAME: 'test-index-name',
};

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useIsAssignmentsOnlyLearner: jest.fn().mockReturnValue(false),
}));

jest.mock('@edx/frontend-platform/config', () => ({
  ...jest.requireActual('@edx/frontend-platform/config'),
  getConfig: jest.fn(() => APP_CONFIG),
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
  enterpriseConfig: {
    name: 'BearsRUs',
    slug: 'test-enterprise-slug',
    showIntegrationWarning: false,
    enterpriseFeatures: {
      featurePrequerySearchSuggestions: true,
    },
  },
  authenticatedUser: { userId: 'test-user-id' },
  algolia: {
    appId: 'test-app-id',
    searchApiKey: 'test-search-api-key',
    client: {
      search: jest.fn(),
    },
  },
};

const defaultCouponCodesState = {
  couponCodes: [],
  loading: false,
  couponCodesCount: 0,
};

const initialUserSubsidyState = {
  couponCodes: defaultCouponCodesState,
};
const initialSubsidyRequestsState = {
  subsidyRequestConfiguration: null,
  catalogsForSubsidyRequests: [],
  requestsBySubsidyType: {
    [SUBSIDY_TYPE.LICENSE]: [],
    [SUBSIDY_TYPE.COUPON]: [],
  },
};

describe('<Search />', () => {
  const mockFilter = 'enterprise_customer_uuids: test-uuid';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the course section with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <SearchContext.Provider value={searchContext1}>
            <SearchCourse filter={mockFilter} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Courses (2 results)')).toBeInTheDocument();
  });
  test('renders the programe section with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <SearchContext.Provider value={searchContext1}>
            <SearchProgram filter={mockFilter} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Programs (2 results)')).toBeInTheDocument();
  });

  test('renders the pathways section with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <SearchContext.Provider value={searchContext1}>
            <SearchPathway filter={mockFilter} />
          </SearchContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Pathways (2 results)')).toBeInTheDocument();
  });
  test('renders the course search component with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <UserSubsidyContext.Provider value={initialUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
              <SearchContext.Provider value={searchContext1}>
                <Search />
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Courses (2 results)')).toBeInTheDocument();
  });
  test('renders the program search component with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <UserSubsidyContext.Provider value={initialUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
              <SearchContext.Provider value={searchContext2}>
                <Search />
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
    );
    expect(screen.getByText('Programs (2 results)')).toBeInTheDocument();
  });
  test('renders the pathway search component with the correct title', () => {
    renderWithRouter(
      <IntlProvider locale="en">
        <AppContext.Provider value={initialAppState}>
          <UserSubsidyContext.Provider value={initialUserSubsidyState}>
            <SubsidyRequestsContext.Provider value={initialSubsidyRequestsState}>
              <SearchContext.Provider value={searchContext3}>
                <Search />
              </SearchContext.Provider>
            </SubsidyRequestsContext.Provider>
          </UserSubsidyContext.Provider>
        </AppContext.Provider>
      </IntlProvider>,
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
