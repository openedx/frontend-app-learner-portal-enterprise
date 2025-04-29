import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import { screen, waitFor } from '@testing-library/react';
import { AppContext } from '@edx/frontend-platform/react';
import '@testing-library/jest-dom/extend-expect';
import { SearchContext } from '@edx/frontend-enterprise-catalog-search';
import { IntlProvider } from '@edx/frontend-platform/i18n';

import SkillsCourses from '../SkillsCourses';
import { renderWithRouter } from '../../../utils/tests';
import { TEST_IMAGE_URL } from '../../search/tests/constants';
import { NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS } from '../constants';
import { SkillsContext } from '../SkillsContextProvider';
import { useAlgoliaSearch, useDefaultSearchFilters, useEnterpriseCustomer } from '../../app/data';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../app/data/services/data/__factories__';
import { setFakeHits } from '../__mocks__/react-instantsearch-dom';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useEnterpriseCustomer: jest.fn(),
  useAlgoliaSearch: jest.fn(),
  useDefaultSearchFilters: jest.fn(),
}));

const TEST_COURSE_KEY = 'test-course-key';
const SKILLS_HEADING = 'Skills';
const TEST_TITLE = 'Test Title';
const TEST_CARD_IMG_URL = 'https://fake.image';
const TEST_PARTNER = {
  name: 'Partner Name',
  logo_image_url: TEST_IMAGE_URL,
};

const courses = {
  hits: [
    {
      key: TEST_COURSE_KEY,
      title: TEST_TITLE,
      card_image_url: TEST_CARD_IMG_URL,
      partners: [TEST_PARTNER],
      skill_names: ['test-skill-1'],
    },
  ],
  nbHits: 1,
};

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

const defaultAppState = {
  authenticatedUser: mockAuthenticatedUser,
};

const defaultSearchContext = {
  refinements: { },
  dispatch: () => null,
};

const defaultSkillsState = {
  state: {
    goal: 'Goal',
    selectedJob: 'job-1',
    interestedJobs: [
      {
        name: 'job-1',
        skills: [
          {
            name: 'test-skill-1',
          },
          {
            name: 'test-skill-2',
          },
        ],
      },
    ],
  },
};

const SkillsCoursesWithContext = ({
  initialAppState = defaultAppState,
  initialSkillsState = defaultSkillsState,
  searchContext = defaultSearchContext,
}) => (
  <IntlProvider locale="en">
    <AppContext.Provider value={initialAppState}>
      <SearchContext.Provider value={searchContext}>
        <SkillsContext.Provider value={initialSkillsState}>
          <SkillsCourses />
        </SkillsContext.Provider>
      </SearchContext.Provider>
    </AppContext.Provider>
  </IntlProvider>
);

const mockAlgoliaSearch = {
  searchClient: {
    search: jest.fn(), appId: 'test-app-id',
  },
  searchIndex: {
    indexName: 'mock-index-name',
  },
};

setFakeHits(courses.hits);
describe('<SkillsCourses />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
    useDefaultSearchFilters.mockReturnValue(`enterprise_customer_uuids:${mockEnterpriseCustomer.uuid}`);
    useAlgoliaSearch.mockReturnValue(mockAlgoliaSearch);
  });

  test('renders the correct data', async () => {
    const { container } = renderWithRouter(
      <SkillsCoursesWithContext />,
    );

    await waitFor(() => {
      expect(screen.getByText(SKILLS_HEADING)).toBeInTheDocument();
      expect(screen.getByAltText(TEST_PARTNER.name)).toBeInTheDocument();
    });

    expect(screen.getByText(TEST_PARTNER.name)).toBeInTheDocument();
    // should show both logo image and card image with proper URLs
    const cardImages = container.querySelectorAll('img');
    expect(cardImages).toHaveLength(2);
    cardImages.forEach((cardImg) => {
      expect(cardImg).toHaveAttribute('src', TEST_CARD_IMG_URL);
    });

    userEvent.click(screen.getByTestId('skills-quiz-course-card'));
    expect(window.location.pathname).toContain(`/${mockEnterpriseCustomer.slug}/course/${TEST_COURSE_KEY}`);
  });

  test('renders an alert in case of no courses returned', async () => {
    const noCourses = {
      hits: [],
    };
    setFakeHits(noCourses.hits);
    renderWithRouter(
      <SkillsCoursesWithContext />,
    );
    expect(await screen.findByText(NO_COURSES_ALERT_MESSAGE_AGAINST_SKILLS)).toBeInTheDocument();
  });
});
