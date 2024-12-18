import { screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { AppContext } from '@edx/frontend-platform/react';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import SearchResults from '../SearchResults';
import SearchCourseCard from '../SearchCourseCard';
import SearchProgramCard from '../SearchProgramCard';
import {
  NUM_RESULTS_PROGRAM,
  NUM_RESULTS_COURSE,
  COURSE_TITLE,
  PROGRAM_TITLE,
  CONTENT_TYPE_COURSE,
  CONTENT_TYPE_PROGRAM,
  PATHWAY_TITLE, CONTENT_TYPE_PATHWAY, NUM_RESULTS_PATHWAY,
  CONTENT_TYPE_VIDEO,
  VIDEO_TITLE,
  NUM_RESULTS_VIDEO,
} from '../constants';
import { TEST_IMAGE_URL } from './constants';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';

import {
  queryClient,
  renderWithRouter,
} from '../../../utils/tests';
import SearchPathwayCard from '../../pathway/SearchPathwayCard';
import { getNoResultsMessage, getSearchErrorMessage } from '../../utils/search';
import { useEnterpriseCustomer } from '../../app/data';
import SearchVideoCard from '../SearchVideoCard';

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
  useDefaultSearchFilters: jest.fn().mockReturnValue([]),
}));

jest.mock('../../../config', () => ({
  features: { PROGRAM_TYPE_FACET: true },
}));

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('@edx/frontend-enterprise-catalog-search', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-catalog-search'),
  deleteRefinementAction: jest.fn(),
  setRefinementAction: jest.fn(),
  removeFromRefinementArray: jest.fn(),
}));

const searchContext = {
  refinements: { skill_names: ['test-skill-1', 'test-skill-2'] },
  dispatch: () => null,
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const initialAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const SearchResultsWithContext = (props) => (
  <QueryClientProvider client={queryClient()}>
    <IntlProvider locale="en">
      <AppContext.Provider value={initialAppState}>
        <SearchContext.Provider value={searchContext}>
          <SearchResults {...props} />
        </SearchContext.Provider>
      </AppContext.Provider>
    </IntlProvider>
  </QueryClientProvider>
);

const TEST_COURSE_KEY = 'test-course-key';
const TEST_VIDEO_KEY = 'test-video-key';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'http://fake.image';
const TEST_PARTNER = {
  key: 'test-partner-key',
  name: 'Partner Name',
  logo_image_url: TEST_IMAGE_URL,
};

const SEARCH_RESULT_COURSES = {
  nbHits: 1,
  hits: [
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      authoring_organizations: [TEST_PARTNER],
      type: 'course',
      aggregation_key: 'course:edX+DemoX',
    },

  ],
};
const SEARCH_RESULT_VIDEOS = {
  nbHits: 1,
  hits: [
    {
      key: TEST_VIDEO_KEY,
      title: TEST_TITLE,
      aggregation_key: 'some_key',
      content_type: 'video',
      course_run_key: 'some_key',
      image_url: TEST_CARD_IMG_URL,
      logo_image_urls: [TEST_IMAGE_URL],
      org: 'test-org',
      duration: 135,
    },
  ],
};

const SEARCH_RESULT_PROGRAMS = {
  nbHits: 1,
  hits: [
    {
      uuid: 'test-program-uuid',
      title: TEST_TITLE,
      aggregation_key: 'program:test-program-uuid',
      type: 'program',
      authoring_organizations: [TEST_PARTNER],
      card_image_url: TEST_CARD_IMG_URL,
      course_keys: [TEST_COURSE_KEY],
    },
  ],
};

const SEARCH_RESULT_PATHWAYS = {
  nbHits: 1,
  hits: [
    {
      uuid: 'test-pathway-uuid',
      title: TEST_TITLE,
      aggregation_key: 'pathway:test-pathway-uuid',
      type: 'learnerpathway',
      card_image_url: TEST_CARD_IMG_URL,
    },
  ],
};

const propsForCourseResults = {
  searchResults: SEARCH_RESULT_COURSES,
  isSearchStalled: false,
  error: undefined,
  searchState: {
    page: 1,
  },
  hitComponent: SearchCourseCard,
  title: COURSE_TITLE,
  contentType: CONTENT_TYPE_COURSE,
};
const propsForVideoResults = {
  searchResults: SEARCH_RESULT_VIDEOS,
  isSearchStalled: false,
  error: undefined,
  searchState: {
    page: 1,
  },
  hitComponent: SearchVideoCard,
  title: VIDEO_TITLE,
  contentType: CONTENT_TYPE_VIDEO,
};

const propsForProgramResults = {
  ...propsForCourseResults,
  searchResults: SEARCH_RESULT_PROGRAMS,
  hitComponent: SearchProgramCard,
  title: PROGRAM_TITLE,
  contentType: CONTENT_TYPE_PROGRAM,
};

const propsForPathwayResults = {
  ...propsForCourseResults,
  searchResults: SEARCH_RESULT_PATHWAYS,
  hitComponent: SearchPathwayCard,
  title: PATHWAY_TITLE,
  contentType: CONTENT_TYPE_PATHWAY,
};

const propsForError = {
  searchResults: undefined,
  isSearchStalled: false,
  error: {
    body: 'Test Error String',
  },
  hitComponent: SearchCourseCard,
  contentType: CONTENT_TYPE_COURSE,
  title: COURSE_TITLE,
};
const propsForVideosError = {
  searchResults: undefined,
  isSearchStalled: false,
  error: {
    body: 'Test Error String',
  },
  hitComponent: SearchVideoCard,
  contentType: CONTENT_TYPE_VIDEO,
  title: VIDEO_TITLE,
};

const propsForNoResults = {
  searchResults: {
    nbHits: 0,
    hits: [],
  },
  isSearchStalled: false,
  error: undefined,
  searchState: {
    page: 1,
  },
  hitComponent: SearchCourseCard,
  title: COURSE_TITLE,
  contentType: CONTENT_TYPE_COURSE,
};
const propsForNoVideoResults = {
  searchResults: {
    nbHits: 0,
    hits: [],
  },
  isSearchStalled: false,
  error: undefined,
  searchState: {
    page: 1,
  },
  hitComponent: SearchVideoCard,
  title: VIDEO_TITLE,
  contentType: CONTENT_TYPE_VIDEO,
};

describe('<SearchResults />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });
  test('renders correct results for courses', () => {
    renderWithRouter(
      <SearchResultsWithContext {...propsForCourseResults} />,
    );
    expect(screen.getByText(COURSE_TITLE, { exact: false })).toBeInTheDocument();
    SEARCH_RESULT_COURSES.hits.forEach((hit) => {
      expect(screen.getByText(hit.title)).toBeInTheDocument();
    });
  });
  test('renders correct results for videos', () => {
    renderWithRouter(
      <SearchResultsWithContext {...propsForVideoResults} />,
    );
    expect(screen.getByText(VIDEO_TITLE, { exact: false })).toBeInTheDocument();
    SEARCH_RESULT_VIDEOS.hits.forEach((hit) => {
      expect(screen.getByText(hit.title)).toBeInTheDocument();
    });
  });

  test('renders correct results for programs', () => {
    renderWithRouter(
      <SearchResultsWithContext {...propsForProgramResults} />,
    );
    expect(screen.getByText(PROGRAM_TITLE, { exact: false })).toBeInTheDocument();
    SEARCH_RESULT_PROGRAMS.hits.forEach((hit) => {
      expect(screen.getByText(hit.title)).toBeInTheDocument();
    });
  });

  test('renders correct results for pathways', () => {
    renderWithRouter(
      <SearchResultsWithContext {...propsForPathwayResults} />,
    );
    expect(screen.getByText(PATHWAY_TITLE, { exact: false })).toBeInTheDocument();
    SEARCH_RESULT_PATHWAYS.hits.forEach((hit) => {
      expect(screen.getByText(hit.title)).toBeInTheDocument();
    });
  });

  test('renders loading component for courses correctly when search is stalled', () => {
    const propsForLoadingCourses = { ...propsForCourseResults, isSearchStalled: true };
    renderWithRouter(
      <SearchResultsWithContext {...propsForLoadingCourses} />,
    );
    // assert correct number of loading skeleton cards
    const skeletonCards = screen.queryAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(NUM_RESULTS_COURSE);
  });
  test('renders loading component for videos correctly when search is stalled', () => {
    const propsForLoadingVideos = { ...propsForVideoResults, isSearchStalled: true };
    renderWithRouter(
      <SearchResultsWithContext {...propsForLoadingVideos} />,
    );
    // assert correct number of loading skeleton cards
    const skeletonCards = screen.queryAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(NUM_RESULTS_VIDEO);
  });

  test('renders loading component for programs correctly when search is stalled', () => {
    const propsForLoadingProgram = {
      ...propsForProgramResults,
      isSearchStalled: true,
    };
    renderWithRouter(
      <SearchResultsWithContext {...propsForLoadingProgram} />,
    );
    // assert correct number of loading skeleton cards
    const skeletonCards = screen.queryAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(NUM_RESULTS_PROGRAM);
  });

  test('renders loading component for pathways correctly when search is stalled', () => {
    const propsForLoadingPathway = {
      ...propsForPathwayResults,
      isSearchStalled: true,
    };
    renderWithRouter(
      <SearchResultsWithContext {...propsForLoadingPathway} />,
    );
    // assert correct number of loading skeleton cards
    const skeletonCards = screen.queryAllByTestId('skeleton-card');
    expect(skeletonCards).toHaveLength(NUM_RESULTS_PATHWAY);
  });

  test('renders an alert in case of an error for courses', () => {
    const searchErrorMessage = getSearchErrorMessage(COURSE_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForError} />,
    );
    expect(screen.getByText(new RegExp(searchErrorMessage.messageTitle, 'i'))).toBeTruthy();
    expect(screen.getByText(new RegExp(searchErrorMessage.messageContent, 'i'))).toBeTruthy();
  });
  test('renders an alert in case of an error for videos', () => {
    const searchErrorMessage = getSearchErrorMessage(VIDEO_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForVideosError} />,
    );
    expect(screen.getByText(new RegExp(searchErrorMessage.messageTitle, 'i'))).toBeTruthy();
    expect(screen.getByText(new RegExp(searchErrorMessage.messageContent, 'i'))).toBeTruthy();
  });

  test('renders an alert in case of an error for programs', () => {
    const propsForErrorProgram = {
      ...propsForError,
      hitComponent: SearchProgramCard,
      contentType: CONTENT_TYPE_PROGRAM,
      title: PROGRAM_TITLE,
    };
    const searchErrorMessage = getSearchErrorMessage(PROGRAM_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForErrorProgram} />,
    );
    expect(screen.getByText(new RegExp(searchErrorMessage.messageTitle, 'i'))).toBeTruthy();
    expect(screen.getByText(new RegExp(searchErrorMessage.messageContent, 'i'))).toBeTruthy();
  });

  test('renders an alert in case of an error for pathways', () => {
    const propsForErrorPathway = {
      ...propsForError,
      hitComponent: SearchPathwayCard,
      contentType: CONTENT_TYPE_PATHWAY,
      title: PATHWAY_TITLE,
    };
    const searchErrorMessage = getSearchErrorMessage(PATHWAY_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForErrorPathway} />,
    );
    expect(screen.getByText(new RegExp(searchErrorMessage.messageTitle, 'i'))).toBeTruthy();
    expect(screen.getByText(new RegExp(searchErrorMessage.messageContent, 'i'))).toBeTruthy();
  });

  test('renders an alert in case of no results for courses', async () => {
    const noResultsMessage = getNoResultsMessage(COURSE_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForNoResults} />,
    );
    await waitFor(() => {
      expect(screen.getByText(new RegExp(noResultsMessage.messageTitle, 'i'))).toBeTruthy();
      expect(screen.getByText(new RegExp(noResultsMessage.messageContent, 'i'))).toBeTruthy();
    });
  });
  test('renders an alert in case of no results for videos', async () => {
    const noResultsMessage = getNoResultsMessage(VIDEO_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForNoVideoResults} />,
    );
    await waitFor(() => {
      expect(screen.getByText(new RegExp(noResultsMessage.messageTitle, 'i'))).toBeTruthy();
      expect(screen.getByText(new RegExp(noResultsMessage.messageContent, 'i'))).toBeTruthy();
    });
  });

  test('renders an alert in case of no results for programs', () => {
    const propsForNoResultsProgram = {
      ...propsForNoResults,
      hitComponent: SearchProgramCard,
      title: PROGRAM_TITLE,
      contentType: CONTENT_TYPE_PROGRAM,
    };
    const noResultsMessage = getNoResultsMessage(PROGRAM_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForNoResultsProgram} />,
    );
    expect(screen.getByText(new RegExp(noResultsMessage.messageTitle, 'i'))).toBeTruthy();
    expect(screen.getByText(new RegExp(noResultsMessage.messageContent, 'i'))).toBeTruthy();
  });

  test('does not render an alert in case of no results for pathways', () => {
    const propsForNoResultsPathway = {
      ...propsForNoResults,
      hitComponent: SearchPathwayCard,
      title: PATHWAY_TITLE,
      contentType: CONTENT_TYPE_PATHWAY,
      isPathwaySearchResults: true,
    };
    const noResultsMessage = getNoResultsMessage(PATHWAY_TITLE);
    renderWithRouter(
      <SearchResultsWithContext {...propsForNoResultsPathway} />,
    );
    expect(screen.queryByText(new RegExp(noResultsMessage.messageTitle, 'i'))).toBeNull();
    expect(screen.queryByText(new RegExp(noResultsMessage.messageContent, 'i'))).toBeNull();
  });
});
